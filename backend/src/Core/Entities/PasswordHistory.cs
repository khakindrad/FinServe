namespace Core.Entities;
public sealed class PasswordHistory : BaseEntity
{
    public int UserId { get; set; }
    public required string PasswordHash { get; set; }
    public User User { get; set; }
}
