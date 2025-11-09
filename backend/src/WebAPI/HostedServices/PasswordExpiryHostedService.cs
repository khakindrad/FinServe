namespace FinServe.WebAPI.HostedServices;

public class PasswordExpiryHostedService : BackgroundService
{
    private readonly IServiceProvider _provider;
    private readonly ILogger<PasswordExpiryHostedService> _logger;
    private readonly IConfiguration _config;

    public PasswordExpiryHostedService(IServiceProvider provider, ILogger<PasswordExpiryHostedService> logger, IConfiguration config)
    {
        _provider = provider;
        _logger = logger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Cron-like: run once every day at configured hour (or fallback to every 24 hours).
        var runHour = _config.GetValue<int?>("ScheduledJobs:PasswordExpiryCheckHourUtc") ?? -1;
        var interval = TimeSpan.FromHours(24);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _provider.CreateScope();
                var svc = scope.ServiceProvider.GetRequiredService<FinServe.Infrastructure.Services.PasswordExpiryNotificationService>();

                if (runHour >= 0)
                {
                    // Wait until next runHour UTC
                    var now = DateTime.UtcNow;
                    var next = new DateTime(now.Year, now.Month, now.Day, runHour, 0, 0, DateTimeKind.Utc);
                    if (next <= now) next = next.AddDays(1);
                    var delay = next - now;
                    _logger.LogInformation("PasswordExpiryHostedService waiting {Delay} until next run at {Next}", delay, next);
                    await Task.Delay(delay, stoppingToken);
                    await svc.RunAsync(stoppingToken);
                    // then loop to wait ~24h
                    await Task.Delay(interval, stoppingToken);
                }
                else
                {
                    // simple every-24-hours schedule
                    _logger.LogInformation("PasswordExpiryHostedService running immediate check");
                    await svc.RunAsync(stoppingToken);
                    await Task.Delay(interval, stoppingToken);
                }
            }
            catch (TaskCanceledException) { /* shutting down */ }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hosted service error");
                // On error, wait a short time then retry
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
