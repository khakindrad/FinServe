namespace Core.Entities;

public sealed class DashboardAlert : BaseEntity
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }

    public User? User { get; set; }
}