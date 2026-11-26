using System.Text.RegularExpressions;
using AseraBackend.Data;
using AseraBackend.Dtos;
using AseraBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AseraBackend.Controllers;

[ApiController]
[Route("api/tenants")]
public partial class TenantsController(AseraDbContext db) : ControllerBase
{
    [GeneratedRegex(@"^[A-Za-z0-9][A-Za-z0-9 &.,'()_-]*$")]
    private static partial Regex NameRegex();

    [GeneratedRegex(@"^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$")]
    private static partial Regex DomainRegex();

    [HttpGet]
    public async Task<ActionResult<List<TenantResponse>>> List()
    {
        var tenants = await db.Tenants.AsNoTracking().OrderByDescending(t => t.Id).ToListAsync();
        return tenants.Select(TenantResponse.From).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TenantResponse>> Get(int id)
    {
        var t = await db.Tenants.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return t is null ? NotFound() : TenantResponse.From(t);
    }

    [HttpPost]
    public async Task<ActionResult<TenantResponse>> Create(CreateTenantRequest r)
    {
        var errors = new Dictionary<string, string[]>();
        var name = r.Name.Trim();
        var domain = r.Domain.Trim().ToLowerInvariant();

        if (name.Length == 0) errors["name"] = ["Client name is required"];
        else if (name.Length > 60) errors["name"] = ["Client name must be 60 characters or fewer"];
        else if (!NameRegex().IsMatch(name)) errors["name"] = ["Use letters, numbers and basic punctuation only"];
        else if (await db.Tenants.AnyAsync(t => t.Name.ToLower() == name.ToLower()))
            errors["name"] = ["A tenant with this name already exists"];

        if (domain.Length == 0) errors["domain"] = ["Domain name is required"];
        else if (!DomainRegex().IsMatch(domain))
            errors["domain"] = ["Use lowercase letters, numbers and hyphens only, not starting or ending with a hyphen"];
        else if (await db.Tenants.AnyAsync(t => t.Domain == domain))
            errors["domain"] = ["This domain name is already in use"];

        if (r.FaxEnabled)
        {
            if (string.IsNullOrWhiteSpace(r.FaxUserName)) errors["faxUserName"] = ["Enter the Concord Fax user name"];
            if (string.IsNullOrWhiteSpace(r.FaxPassword)) errors["faxPassword"] = ["Enter the Concord Fax password"];
            var digits = new string(r.FaxNumber.Where(char.IsDigit).ToArray());
            if (digits.Length is < 10 or > 15) errors["faxNumber"] = ["Enter a valid fax number"];
        }
        if (r.Hl7Enabled && string.IsNullOrWhiteSpace(r.Hl7MessageType))
            errors["hl7MessageType"] = ["Select an HL7 message type"];
        if (r.PacsEnabled && string.IsNullOrWhiteSpace(r.PacsName))
            errors["pacsName"] = ["Enter a PACS name"];

        ValidateSubscription(errors, r.Status, r.StartDate, r.EndDate, r.GraceDays, r.Packages, r.Notifications);
        if (errors.Count > 0) return ValidationProblem(new ValidationProblemDetails(errors));

        var tenant = new Tenant
        {
            Name = name,
            Domain = domain,
            SubscriptionNumber = await NextSubscriptionNumber(),
            Status = r.Status,
            StartDate = r.StartDate,
            EndDate = r.EndDate,
            GraceDays = r.GraceDays,
            Corporate = r.Corporate,
            FaxEnabled = r.FaxEnabled,
            FaxUrl = r.FaxUrl,
            FaxUserName = r.FaxEnabled ? r.FaxUserName.Trim() : "",
            FaxPassword = r.FaxEnabled ? r.FaxPassword : "",
            FaxNumber = r.FaxEnabled ? r.FaxNumber.Trim() : "",
            Hl7MessageType = r.Hl7Enabled ? r.Hl7MessageType : "",
            PacsName = r.PacsEnabled ? r.PacsName.Trim() : "",
            Packages = r.Packages.Distinct().ToList(),
            Notifications = r.Notifications,
        };
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = tenant.Id }, TenantResponse.From(tenant));
    }

    [HttpPut("{id:int}/subscription")]
    public async Task<ActionResult<TenantResponse>> UpdateSubscription(int id, UpdateSubscriptionRequest r)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id);
        if (tenant is null) return NotFound();

        var errors = new Dictionary<string, string[]>();
        ValidateSubscription(errors, r.Status, r.StartDate, r.EndDate, r.GraceDays, r.Packages, r.Notifications);
        if (errors.Count > 0) return ValidationProblem(new ValidationProblemDetails(errors));

        tenant.Status = r.Status;
        tenant.StartDate = r.StartDate;
        tenant.EndDate = r.EndDate;
        tenant.GraceDays = r.GraceDays;
        tenant.Packages = r.Packages.Distinct().ToList();
        tenant.Notifications = r.Notifications;
        tenant.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return TenantResponse.From(tenant);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<TenantResponse>> Cancel(int id)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id);
        if (tenant is null) return NotFound();
        tenant.Status = TenantStatuses.Cancelled;
        tenant.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return TenantResponse.From(tenant);
    }

    private static void ValidateSubscription(Dictionary<string, string[]> errors, string status, DateOnly start,
        DateOnly end, int grace, List<string> packages, NotificationSettings n)
    {
        if (!TenantStatuses.All.Contains(status))
            errors["status"] = [$"Status must be one of: {string.Join(", ", TenantStatuses.All)}"];
        if (packages.Count == 0) errors["packages"] = ["Select at least one product package"];
        else if (packages.Any(p => !p.Contains('|')))
            errors["packages"] = ["Packages must be in 'Group|Item' format"];
        if (start.Year is < 2000 or > 2100) errors["startDate"] = ["Enter a valid start date"];
        if (end.Year is < 2000 or > 2100) errors["endDate"] = ["Enter a valid end date"];
        else if (end <= start) errors["endDate"] = ["End date must be after the start date"];
        if (grace is < 0 or > 365) errors["graceDays"] = ["Grace period must be a whole number from 0 to 365"];

        if (!n.Enabled) return;
        var msgs = new List<string>();
        if (n.Recipients.Count == 0) msgs.Add("Select at least one notification recipient");
        if (n.Channels.Count == 0) msgs.Add("Select at least one notification channel");
        if (n.Reminders.Select(x => x.Days).Distinct().Count() != n.Reminders.Count)
            msgs.Add("Reminder days must be different from each other");
        var term = end.DayNumber - start.DayNumber;
        if (n.Reminders.Any(x => x.Enabled && x.Days > term))
            msgs.Add("A reminder is set earlier than the subscription start");
        if (msgs.Count > 0) errors["notifications"] = msgs.ToArray();
    }

    private async Task<string> NextSubscriptionNumber()
    {
        var numbers = await db.Tenants.Select(t => t.SubscriptionNumber).ToListAsync();
        var max = numbers
            .Select(s => int.TryParse(s.Replace("SUB-", ""), out var v) ? v : 0)
            .DefaultIfEmpty(0).Max();
        return $"SUB-{Math.Max(max, 10420) + 1}";
    }
}
