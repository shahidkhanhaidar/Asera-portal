using AseraBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AseraBackend.Data;

public class AseraDbContext(DbContextOptions<AseraDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<CptCost> CptCosts => Set<CptCost>();
    public DbSet<TenantCptOverride> TenantCptOverrides => Set<TenantCptOverride>();
    public DbSet<ImpactRun> ImpactRuns => Set<ImpactRun>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Tenant>(t =>
        {
            t.HasIndex(x => x.Name).IsUnique();
            t.HasIndex(x => x.Domain).IsUnique();
            t.HasIndex(x => x.SubscriptionNumber).IsUnique();
            t.Property(x => x.Name).HasMaxLength(60);
            t.Property(x => x.Domain).HasMaxLength(40);
            t.OwnsOne(x => x.Notifications, n =>
            {
                n.ToJson();
                n.OwnsMany(x => x.Reminders);
            });
        });

        b.Entity<CptCost>(c =>
        {
            c.HasKey(x => x.Code);
            c.Property(x => x.Code).HasMaxLength(10);
        });

        b.Entity<TenantCptOverride>(o =>
        {
            o.HasIndex(x => new { x.TenantId, x.CptCode }).IsUnique();
            o.HasOne(x => x.Tenant).WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ImpactRun>(r => r.HasIndex(x => x.Status));
    }
}
