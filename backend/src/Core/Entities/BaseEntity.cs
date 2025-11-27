namespace Core.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedTime { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime LastUpdatedTime { get; set; }
    public string? LastUpdatedBy { get; set; }
}
