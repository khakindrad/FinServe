namespace Core.Entities;
public class PasswordHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public virtual User User { get; set; }
}
