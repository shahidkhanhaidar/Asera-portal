using AseraBackend.Models;

namespace AseraBackend.Data;

// Mirrors the mock tenants used by the React screens so the UI has data on first run.
public static class DbSeeder
{
    private static readonly string[] Women = ["OB", "MFM", "MFM Consult", "Pelvic US", "Fetal ECHO", "NST"];
    private static readonly string[] Radiology = ["Follicles", "Female Pelvis", "Abdominal", "Breast", "Thyroid", "Male Pelvis", "Scrotal", "Other Ultrasound"];
    private static readonly string[] Vascular = ["Carotid", "Peripheral Venous Dx", "Abdominal Duplex", "Transplant"];

    private static IEnumerable<string> W() => Women.Select(i => $"Women's Health|{i}");
    private static IEnumerable<string> R(int take = 8) => Radiology.Take(take).Select(i => $"Radiology|{i}");
    private static IEnumerable<string> V() => Vascular.Select(i => $"Vascular|{i}");

    public static void Seed(AseraDbContext db)
    {
        SeedTenants(db);
        SeedAnalytics(db);
    }

    private static void SeedAnalytics(AseraDbContext db)
    {
        if (!db.CptCosts.Any())
        {
            var updated = DateTime.UtcNow.AddDays(-12);
            (string Code, string Desc, decimal Value)[] costs =
            [
                ("93975", "Duplex scan, complete", 285), ("93976", "Duplex scan, limited", 160),
                ("76805", "OB US ≥14 wks, complete", 190), ("76816", "OB US, follow-up / limited", 120),
                ("76817", "OB US, transvaginal", 95), ("76801", "OB US <14 wks, single gestation", 175),
                ("76811", "OB US, detailed fetal anatomy", 260), ("76818", "Fetal biophysical profile", 110),
                ("59025", "Fetal non-stress test", 65), ("76856", "Pelvic US, complete", 150),
                ("76830", "Transvaginal US", 140), ("76825", "Fetal echocardiography", 310),
            ];
            db.CptCosts.AddRange(costs.Select(c => new CptCost { Code = c.Code, Description = c.Desc, DefaultValue = c.Value, UpdatedAt = updated }));
            db.SaveChanges();
        }

        if (!db.TenantCptOverrides.Any())
        {
            var ids = db.Tenants.ToDictionary(t => t.Name, t => t.Id);
            (string Code, string[] Tenants)[] overrides =
            [
                ("93975", ["tenanta", "tenantab"]), ("76805", ["qatestone"]),
                ("76811", ["qatesttwo", "tenantab", "qatestfive"]), ("76830", ["tenanta"]),
            ];
            foreach (var (code, names) in overrides)
                foreach (var n in names.Where(ids.ContainsKey))
                    db.TenantCptOverrides.Add(new TenantCptOverride { TenantId = ids[n], CptCode = code, Value = db.CptCosts.First(c => c.Code == code).DefaultValue + 15 });
            db.SaveChanges();
        }

        if (!db.ImpactRuns.Any())
        {
            var now = DateTime.UtcNow;
            ImpactRun Run(int daysAgo, string tenant, bool pro, string model, int mv, string status, decimal cost, string? reason = null)
            {
                var run = new ImpactRun
                {
                    CreatedAt = now.AddDays(-daysAgo), TenantName = tenant, IsProspect = pro, Model = model, ModelVersion = mv,
                    Status = status, SubscriptionCost = cost, FailureReason = reason, FileName = "encounters.xlsx",
                };
                if (status == RunStatuses.Completed)
                {
                    run.EncountersAnalyzed = 12519;
                    run.RevenueCaptured = 852012m * (0.8m + (daysAgo % 35) / 100m);
                    run.RevenueCaptured = Math.Round(run.RevenueCaptured.Value / 100m) * 100m;
                    run.DenialsPrevented = Math.Round(run.RevenueCaptured.Value * 0.33m / 100m) * 100m;
                    run.CompletedAt = run.CreatedAt.AddSeconds(5);
                }
                return run;
            }
            db.ImpactRuns.AddRange(
                Run(45, "Granite Women's Care", true, "Global", 2, RunStatuses.Completed, 84000),
                Run(54, "tenantab", false, "Central", 2, RunStatuses.Completed, 96000),
                Run(47, "tenanta", false, "Central", 2, RunStatuses.Completed, 120000),
                Run(36, "tenantab", false, "Global", 3, RunStatuses.Completed, 96000),
                Run(1, "tenanta", false, "Global", 3, RunStatuses.Completed, 120000),
                Run(0, "tenanta", false, "Global", 3, RunStatuses.Failed, 120000, "Required column CPT Codes is empty in 212 rows."));
            db.SaveChanges();
        }
    }

    private static void SeedTenants(AseraDbContext db)
    {
        if (db.Tenants.Any()) return;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        Tenant T(string name, string sub, string status, int endInDays, IEnumerable<string> pk,
            bool fax = false, string hl7 = "", string pacs = "", bool corp = false) => new()
        {
            Name = name, Domain = name, SubscriptionNumber = sub, Status = status,
            StartDate = new DateOnly(2025, 11, 9), EndDate = today.AddDays(endInDays),
            Packages = pk.ToList(), Corporate = corp,
            FaxEnabled = fax, FaxNumber = fax ? "+1 (212) 555-0123" : "", FaxUserName = fax ? "faxuser" : "",
            Hl7MessageType = hl7, PacsName = pacs,
        };

        db.Tenants.AddRange(
            T("tenanta", "SUB-10421", TenantStatuses.Active, 14, W().Concat(R()), true, "ADT", "Extended PACS"),
            T("tenantab", "SUB-10440", TenantStatuses.Active, 157, W().Concat(V()).Concat(R()), true, "ORM", "Enterprise PACS", true),
            T("qatestone", "SUB-10441", TenantStatuses.Active, 220, W()),
            T("qatesttwo", "SUB-10442", TenantStatuses.Active, 90, W().Concat(R(3)), corp: true),
            T("qatestthree", "SUB-10443", TenantStatuses.ReadOnly, -12, R()),
            T("qatestfour", "SUB-10444", TenantStatuses.Inactive, -60, V()),
            T("qatestfive", "SUB-10445", TenantStatuses.Active, 300, W().Concat(V()).Concat(R())),
            T("qatestzeroone", "SUB-10446", TenantStatuses.Cancelled, -30, W()),
            T("qatestzerotwo", "SUB-10447", TenantStatuses.Active, 45, R()));
        db.SaveChanges();
    }
}
