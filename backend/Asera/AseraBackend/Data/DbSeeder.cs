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
