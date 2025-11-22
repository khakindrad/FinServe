using Common;

namespace WebAPI.Services;

internal sealed class CustomConsoleLiftime : BaseService, IHostLifetime, IDisposable
{
    public CustomConsoleLiftime(Serilog.ILogger logger)
    : base(logger.ForContext<CustomConsoleLiftime>(), null)
    {
    }
    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
    public Task WaitForStartAsync(CancellationToken cancellationToken)
    {
        Console.CancelKeyPress += OnCancelKeyPressed;
        return Task.CompletedTask;
    }
    private void OnCancelKeyPressed(object? sender, ConsoleCancelEventArgs e)
    {
        Logger.Information("Ctrl+C has beed pressed, Ignoring the event.");
        e.Cancel = true;
    }
    public void Dispose()
    {
        Console.CancelKeyPress -= OnCancelKeyPressed;
    }

}
