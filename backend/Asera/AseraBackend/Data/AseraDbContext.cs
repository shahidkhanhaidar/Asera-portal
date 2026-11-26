using AseraBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AseraBackend.Data;

public class AseraDbContext(DbContextOptions<AseraDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();

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
    }
}
