namespace Common.Configurations;

public abstract class BaseServiceConfig
{
    public override string ToString()
    {
        return GetType().Name;
    }
}
