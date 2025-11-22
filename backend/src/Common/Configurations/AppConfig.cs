using System.Runtime;

namespace Common.Configurations;

public sealed class AppConfig : BaseServiceConfig
{
    public const string SectionName = "AppConfig";
    public GCLatencyMode GCLatencyMode { get; set; } = GCLatencyMode.SustainedLowLatency;

    public override string ToString()
    {
        return Methods.GetToString(base.ToString(), GCLatencyMode);
    }
}
