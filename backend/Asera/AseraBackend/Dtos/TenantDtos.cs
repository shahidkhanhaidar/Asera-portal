using AseraBackend.Models;

namespace AseraBackend.Dtos;

public class CreateTenantRequest
{
    public string Name { get; set; } = "";
    public string Domain { get; set; } = "";

    public bool FaxEnabled { get; set; }
    public string FaxUrl { get; set; } = "https://www.concordfax.com/";
    public string FaxUserName { get; set; } = "";
    public string FaxPassword { get; set; } = "";
    public string FaxNumber { get; set; } = "";
    public bool Hl7Enabled { get; set; }
    public string Hl7MessageType { get; set; } = "";
    public bool PacsEnabled { get; set; }
    public string PacsName { get; set; } = "";
    public bool Corporate { get; set; }

    public string Status { get; set; } = TenantStatuses.Active;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int GraceDays { get; set; } = 30;
    public List<string> Packages { get; set; } = [];

    public NotificationSettings Notifications { get; set; } = new();
}

public class UpdateSubscriptionRequest
{
    public string Status { get; set; } = TenantStatuses.Active;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int GraceDays { get; set; } = 30;
    public List<string> Packages { get; set; } = [];
    public NotificationSettings Notifications { get; set; } = new();
}

// The fax password is write-only: it is stored but never returned.
public record TenantResponse(
    int Id,
    string Name,
    string Domain,
    string SubscriptionNumber,
    string Status,
    DateOnly StartDate,
    DateOnly EndDate,
    int GraceDays,
    bool Corporate,
    bool FaxEnabled,
    string FaxUrl,
    string FaxUserName,
    string FaxNumber,
    string Hl7MessageType,
    string PacsName,
    List<string> Packages,
    NotificationSettings Notifications,
    DateTime CreatedAt,
    DateTime UpdatedAt)
{
    public static TenantResponse From(Tenant t) => new(
        t.Id, t.Name, t.Domain, t.SubscriptionNumber, t.Status, t.StartDate, t.EndDate, t.GraceDays,
        t.Corporate, t.FaxEnabled, t.FaxUrl, t.FaxUserName, t.FaxNumber, t.Hl7MessageType, t.PacsName,
        t.Packages, t.Notifications, t.CreatedAt, t.UpdatedAt);
}
