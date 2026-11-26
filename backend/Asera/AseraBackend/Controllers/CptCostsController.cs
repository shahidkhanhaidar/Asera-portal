using AseraBackend.Data;
using AseraBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AseraBackend.Controllers;

public record CptCostItem(string Code, string Description, decimal DefaultValue);
public record CptCostSheet(List<CptCostItem> Items, string LastUpdatedBy, DateTime? LastUpdatedOn);
public record CptCostChange(string Code, decimal Value);
public class SaveCptCostsRequest { public List<CptCostChange> Changes { get; set; } = []; }
public record CptCostImpact(int ChangedCount, int TenantsAffected, int TenantsWithCustomValues);

[ApiController]
[Route("api/cpt-costs")]
public class CptCostsController(AseraDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<CptCostSheet> Get() => await Load();

    // Used by the "Save default values?" confirmation: how many tenants will the change reach?
    [HttpPost("impact")]
    public async Task<ActionResult<CptCostImpact>> Impact(SaveCptCostsRequest r)
    {
        var errors = await Validate(r);
        if (errors.Count > 0) return ValidationProblem(new ValidationProblemDetails(errors));
        return await Count(r);
    }

    [HttpPut]
    public async Task<ActionResult<CptCostSheet>> Save(SaveCptCostsRequest r)
    {
        var errors = await Validate(r);
        if (errors.Count > 0) return ValidationProblem(new ValidationProblemDetails(errors));

        var codes = r.Changes.Select(c => c.Code).ToList();
        var rows = await db.CptCosts.Where(c => codes.Contains(c.Code)).ToListAsync();
        foreach (var row in rows)
        {
            row.DefaultValue = r.Changes.First(c => c.Code == row.Code).Value;
            row.UpdatedAt = DateTime.UtcNow;
            row.UpdatedBy = "AS Admin";
        }
        await db.SaveChangesAsync();
        return await Load();
    }

    private async Task<CptCostSheet> Load()
    {
        var rows = await db.CptCosts.AsNoTracking().ToListAsync();
        var latest = rows.OrderByDescending(x => x.UpdatedAt).FirstOrDefault();
        return new CptCostSheet(
            rows.OrderBy(x => x.Description).Select(x => new CptCostItem(x.Code, x.Description, x.DefaultValue)).ToList(),
            latest?.UpdatedBy ?? "", latest?.UpdatedAt);
    }

    private async Task<CptCostImpact> Count(SaveCptCostsRequest r)
    {
        var codes = r.Changes.Select(c => c.Code).ToList();
        var active = await db.Tenants.Where(t => t.Status != TenantStatuses.Cancelled).Select(t => t.Id).ToListAsync();
        var custom = await db.TenantCptOverrides.Where(o => codes.Contains(o.CptCode)).Select(o => o.TenantId).Distinct().ToListAsync();
        var withCustom = custom.Count(active.Contains);
        return new CptCostImpact(r.Changes.Count, active.Count - withCustom, withCustom);
    }

    private async Task<Dictionary<string, string[]>> Validate(SaveCptCostsRequest r)
    {
        var errors = new Dictionary<string, string[]>();
        if (r.Changes.Count == 0) errors["changes"] = ["No changes to save"];
        var known = (await db.CptCosts.Select(c => c.Code).ToListAsync()).ToHashSet();
        foreach (var c in r.Changes)
        {
            var key = $"value_{c.Code}";
            if (!known.Contains(c.Code)) errors[$"code_{c.Code}"] = [$"Unknown CPT code {c.Code}"];
            else if (c.Value <= 0) errors[key] = ["Must be greater than 0"];
            else if (c.Value >= 1_000_000m) errors[key] = ["Must be under $1,000,000"];
            else if (decimal.Round(c.Value, 2) != c.Value) errors[key] = ["Up to 2 decimal places"];
        }
        return errors;
    }
}
