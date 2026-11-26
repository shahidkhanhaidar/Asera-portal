using System.Threading.Channels;
using AseraBackend.Data;
using AseraBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AseraBackend.Services;

public class ImpactQueue
{
    private readonly Channel<int> _channel = Channel.CreateUnbounded<int>();
    public void Enqueue(int runId) => _channel.Writer.TryWrite(runId);
    public IAsyncEnumerable<int> ReadAll(CancellationToken ct) => _channel.Reader.ReadAllAsync(ct);
}

// Runs one analysis at a time in the background: Queued -> Processing -> Completed.
// The numbers are a stand-in until the real analysis model is connected.
public class ImpactProcessor(ImpactQueue queue, IServiceScopeFactory scopes, ILogger<ImpactProcessor> log) : BackgroundService
{
    private const int BenchmarkEncounters = 12519;
    private const decimal BenchmarkRevenue = 852012m;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Pick up anything left unfinished by a previous shutdown.
        using (var scope = scopes.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AseraDbContext>();
            var pending = await db.ImpactRuns
                .Where(r => r.Status == RunStatuses.Queued || r.Status == RunStatuses.Processing)
                .Select(r => r.Id).ToListAsync(ct);
            pending.ForEach(queue.Enqueue);
        }

        await foreach (var id in queue.ReadAll(ct))
        {
            try { await Process(id, ct); }
            catch (OperationCanceledException) { throw; }
            catch (Exception e) { log.LogError(e, "Impact run {Id} failed", id); await Fail(id, "The analysis could not be completed."); }
        }
    }

    private async Task Process(int id, CancellationToken ct)
    {
        await Set(id, r => r.Status = RunStatuses.Queued);
        await Task.Delay(1500, ct);
        await Set(id, r => r.Status = RunStatuses.Processing);
        await Task.Delay(3500, ct);
        await Set(id, r =>
        {
            var h = StableHash($"{r.TenantName}{r.Model}{r.ModelVersion}{r.CreatedAt:yyyy-MM-dd HH:mm}");
            var cap = Math.Round(BenchmarkRevenue * (0.8m + h % 35 / 100m) / 100m) * 100m;
            r.RevenueCaptured = cap;
            r.DenialsPrevented = Math.Round(cap * 0.33m / 100m) * 100m;
            r.EncountersAnalyzed = BenchmarkEncounters;
            r.Status = RunStatuses.Completed;
            r.CompletedAt = DateTime.UtcNow;
        });
    }

    private Task Fail(int id, string reason) => Set(id, r => { r.Status = RunStatuses.Failed; r.FailureReason = reason; });

    private async Task Set(int id, Action<ImpactRun> change)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AseraDbContext>();
        var run = await db.ImpactRuns.FirstOrDefaultAsync(r => r.Id == id);
        if (run is null) return;
        change(run);
        await db.SaveChangesAsync();
    }

    // string.GetHashCode() changes on every start, so use a fixed hash to keep results repeatable.
    private static int StableHash(string s)
    {
        var h = 0;
        foreach (var ch in s) h = (h * 31 + ch) % 1000;
        return h;
    }
}
