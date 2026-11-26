namespace AseraBackend.Models;

public class CptCost
{
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal DefaultValue { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string UpdatedBy { get; set; } = "AS Admin";
}

// A tenant that has customised the cost of one CPT code. Default-value changes do not touch these.
public class TenantCptOverride
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string CptCode { get; set; } = "";
    public decimal Value { get; set; }
}

public static class RunStatuses
{
    public const string Queued = "Queued";
    public const string Processing = "Processing";
    public const string Completed = "Completed";
    public const string Failed = "Failed";
}

public static class ImpactModels
{
    public static readonly (string Name, int Version)[] All =
        [("Global", 3), ("Central", 2), ("Southwest", 2), ("East", 1), ("West", 2), ("North", 1), ("South", 1)];

    public static int? VersionOf(string name) =>
        All.Where(m => m.Name == name).Select(m => (int?)m.Version).FirstOrDefault();
}

public class ImpactRun
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string TenantName { get; set; } = "";
    public bool IsProspect { get; set; }
    public string Model { get; set; } = "Global";
    public int ModelVersion { get; set; }
    public string RunBy { get; set; } = "AS Admin";
    public string Status { get; set; } = RunStatuses.Queued;
    public string? FailureReason { get; set; }
    public decimal SubscriptionCost { get; set; }
    public string FileName { get; set; } = "";
    public string StoredFilePath { get; set; } = "";
    public int? RerunOfId { get; set; }

    public int? EncountersAnalyzed { get; set; }
    public decimal? RevenueCaptured { get; set; }
    public decimal? DenialsPrevented { get; set; }
    public DateTime? CompletedAt { get; set; }
}
