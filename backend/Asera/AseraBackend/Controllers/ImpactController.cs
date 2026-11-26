using AseraBackend.Data;
using AseraBackend.Models;
using AseraBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AseraBackend.Controllers;

public record ImpactRunResponse(
    int Id, DateTime CreatedAt, string Tenant, bool IsProspect, string Model, int ModelVersion, string RunBy,
    string Status, string? FailureReason, decimal SubscriptionCost, string FileName, int? RerunOfId)
{
    public static ImpactRunResponse From(ImpactRun r) => new(
        r.Id, r.CreatedAt, r.TenantName, r.IsProspect, r.Model, r.ModelVersion, r.RunBy,
        r.Status, r.FailureReason, r.SubscriptionCost, r.FileName, r.RerunOfId);
}

public record ImpactResults(
    string Tenant, string Model, int ModelVersion, string RunBy, DateTime CreatedAt,
    decimal RevenueCaptured, decimal DenialsPrevented, decimal TotalProjectedImpact, int EncountersAnalyzed);

public record ModelOption(string Name, int Version);
public record TenantOption(string Name, string Kind);

public class ImportRunRequest
{
    public string Tenant { get; set; } = "";
    public string Model { get; set; } = "";
    public decimal SubscriptionCost { get; set; }
    public IFormFile? File { get; set; }
}

public class RerunRequest { public string Model { get; set; } = ""; }

[ApiController]
[Route("api/impact")]
public class ImpactController(AseraDbContext db, ImpactQueue queue, IWebHostEnvironment env) : ControllerBase
{
    private const long MaxFileBytes = 10 * 1024 * 1024;

    [HttpGet("models")]
    public List<ModelOption> Models() => ImpactModels.All.Select(m => new ModelOption(m.Name, m.Version)).ToList();

    // Tenants plus prospects that were analysed before.
    [HttpGet("tenants")]
    public async Task<List<TenantOption>> Tenants()
    {
        var tenants = await db.Tenants.AsNoTracking().OrderBy(t => t.Name).Select(t => t.Name).ToListAsync();
        var prospects = await db.ImpactRuns.AsNoTracking().Where(r => r.IsProspect).Select(r => r.TenantName).Distinct().ToListAsync();
        return tenants.Select(n => new TenantOption(n, "Tenant"))
            .Concat(prospects.Where(p => !tenants.Contains(p, StringComparer.OrdinalIgnoreCase)).Order().Select(p => new TenantOption(p, "Prospect")))
            .ToList();
    }

    [HttpGet("runs")]
    public async Task<List<ImpactRunResponse>> Runs() =>
        (await db.ImpactRuns.AsNoTracking().OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id).ToListAsync())
        .Select(ImpactRunResponse.From).ToList();

    [HttpGet("runs/{id:int}")]
    public async Task<ActionResult<ImpactRunResponse>> Run(int id)
    {
        var r = await db.ImpactRuns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return r is null ? NotFound() : ImpactRunResponse.From(r);
    }

    [HttpGet("runs/{id:int}/results")]
    public async Task<ActionResult<ImpactResults>> Results(int id)
    {
        var r = await db.ImpactRuns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (r is null) return NotFound();
        if (r.Status != RunStatuses.Completed) return Conflict(new ProblemDetails { Title = "Results are only available once the analysis is Completed" });
        var cap = r.RevenueCaptured ?? 0; var den = r.DenialsPrevented ?? 0;
        return new ImpactResults(r.TenantName, r.Model, r.ModelVersion, r.RunBy, r.CreatedAt, cap, den, cap + den, r.EncountersAnalyzed ?? 0);
    }

    [HttpPost("runs")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ImpactRunResponse>> Import([FromForm] ImportRunRequest r)
    {
        var errors = new Dictionary<string, string[]>();
        var tenant = r.Tenant.Trim();
        if (tenant.Length == 0) errors["tenant"] = ["Select a tenant or enter a prospect"];
        else if (tenant.Length > 60) errors["tenant"] = ["Name must be 60 characters or fewer"];
        if (ImpactModels.VersionOf(r.Model) is null) errors["model"] = ["Select a valid model"];
        ValidateCost(errors, r.SubscriptionCost);
        await ValidateFile(errors, r.File);
        if (errors.Count > 0) return ValidationProblem(new ValidationProblemDetails(errors));
        if (await IsBusy()) return Busy();

        var path = await SaveFile(r.File!);
        var isTenant = await db.Tenants.AnyAsync(t => t.Name.ToLower() == tenant.ToLower());
        var existing = await db.Tenants.Where(t => t.Name.ToLower() == tenant.ToLower()).Select(t => t.Name).FirstOrDefaultAsync();
        var run = new ImpactRun
        {
            TenantName = existing ?? tenant, IsProspect = !isTenant, Model = r.Model,
            ModelVersion = ImpactModels.VersionOf(r.Model)!.Value, SubscriptionCost = r.SubscriptionCost,
            FileName = Path.GetFileName(r.File!.FileName), StoredFilePath = path,
        };
        db.ImpactRuns.Add(run);
        await db.SaveChangesAsync();
        queue.Enqueue(run.Id);
        return CreatedAtAction(nameof(Run), new { id = run.Id }, ImpactRunResponse.From(run));
    }

    // Only the model can change on a re-run; tenant, cost and file are copied from the original.
    [HttpPost("runs/{id:int}/rerun")]
    public async Task<ActionResult<ImpactRunResponse>> Rerun(int id, RerunRequest r)
    {
        var src = await db.ImpactRuns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (src is null) return NotFound();
        if (src.Status is not (RunStatuses.Completed or RunStatuses.Failed))
            return Conflict(new ProblemDetails { Title = "Only Completed or Failed runs can be re-run" });
        var version = ImpactModels.VersionOf(r.Model);
        if (version is null) return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]> { ["model"] = ["Select a valid model"] }));
        if (await IsBusy()) return Busy();

        var run = new ImpactRun
        {
            TenantName = src.TenantName, IsProspect = src.IsProspect, Model = r.Model, ModelVersion = version.Value,
            SubscriptionCost = src.SubscriptionCost, FileName = src.FileName, StoredFilePath = src.StoredFilePath, RerunOfId = src.Id,
        };
        db.ImpactRuns.Add(run);
        await db.SaveChangesAsync();
        queue.Enqueue(run.Id);
        return CreatedAtAction(nameof(Run), new { id = run.Id }, ImpactRunResponse.From(run));
    }

    private Task<bool> IsBusy() =>
        db.ImpactRuns.AnyAsync(r => r.Status == RunStatuses.Queued || r.Status == RunStatuses.Processing);

    private ActionResult Busy() => Conflict(new ProblemDetails { Title = "Another analysis is already running. Try again when it finishes." });

    private static void ValidateCost(Dictionary<string, string[]> errors, decimal cost)
    {
        if (cost <= 0) errors["subscriptionCost"] = ["Enter an amount greater than 0"];
        else if (cost >= 1_000_000_000m) errors["subscriptionCost"] = ["Amount is too large"];
        else if (decimal.Round(cost, 2) != cost) errors["subscriptionCost"] = ["Up to 2 decimal places"];
    }

    private static async Task ValidateFile(Dictionary<string, string[]> errors, IFormFile? file)
    {
        if (file is null) { errors["file"] = ["Attach the filled template"]; return; }
        if (file.Length == 0) errors["file"] = ["The file is empty"];
        else if (file.Length > MaxFileBytes) errors["file"] = ["File is larger than 10 MB"];
        else if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase)) errors["file"] = ["Only XLSX files are accepted"];
        else
        {
            // An .xlsx is a zip archive, so it must start with "PK".
            var head = new byte[2];
            await using var s = file.OpenReadStream();
            var n = await s.ReadAsync(head);
            if (n < 2 || head[0] != 0x50 || head[1] != 0x4B) errors["file"] = ["This is not a valid XLSX file"];
        }
    }

    private async Task<string> SaveFile(IFormFile file)
    {
        var dir = Path.Combine(env.ContentRootPath, "App_Data", "uploads");
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, $"{Guid.NewGuid():N}.xlsx");
        await using var fs = System.IO.File.Create(path);
        await file.CopyToAsync(fs);
        return path;
    }
}
