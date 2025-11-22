using Common.Configurations;
using Serilog;

namespace Common;

public abstract class BaseService
{
    protected ILogger Logger { get; }

    public string Name { get; set; }
    protected BaseService(ILogger logger, BaseServiceConfig? baseServiceConfig)
    {
        Logger = logger;
        Name = GetType().Name;

        var id = Guid.NewGuid();

        Logger.Debug("Service {ServiceName} with Id {ServiceId} and config {ServiceConfig} has been created.", Name, id, baseServiceConfig);
    }
}
