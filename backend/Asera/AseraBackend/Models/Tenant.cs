namespace AseraBackend.Models;

public static class TenantStatuses
{
    public const string Processing = "Processing";
    public const string Active = "Active";
    public const string ReadOnly = "Read-Only";
    public const string Inactive = "Inactive";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All = [Processing, Active, ReadOnly, Inactive, Cancelled];
}

public class Tenant
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string Domain { get; set; } = "";
    public string SubscriptionNumber { get; set; } = "";
    public string Status { get; set; } = TenantStatuses.Active;

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int GraceDays { get; set; } = 30;
    public bool Corporate { get; set; }

    public bool FaxEnabled { get; set; }
    public string FaxUrl { get; set; } = "https://www.concordfax.com/";
    public string FaxUserName { get; set; } = "";
    public string FaxPassword { get; set; } = "";
    public string FaxNumber { get; set; } = "";

    public string Hl7MessageType { get; set; } = "";
    public string PacsName { get; set; } = "";

    // Stored as "Group|Item", e.g. "Women's Health|OB"
    public List<string> Packages { get; set; } = [];

    public NotificationSettings Notifications { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class NotificationSettings
{
    public bool Enabled { get; set; } = true;
    public List<Reminder> Reminders { get; set; } =
    [
        new() { Days = 30 }, new() { Days = 14 }, new() { Days = 7 },
    ];
    public bool NotifyOnEndDate { get; set; } = true;
    public int EndDateOffsetDays { get; set; }
    public bool NotifyOnGraceEnd { get; set; } = true;
    public List<string> Recipients { get; set; } = ["Tenant admins", "Account owner"];
    public List<string> Channels { get; set; } = ["Application alert"];
    public string ExtraEmails { get; set; } = "";
}

public class Reminder
{
    public int Days { get; set; }
    public bool Enabled { get; set; } = true;
}
