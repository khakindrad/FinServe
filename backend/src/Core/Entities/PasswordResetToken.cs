namespace Core.Entities;

public sealed class PasswordResetToken : BaseEntity
{
    public required int UserId { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(30);
    public required bool Used { get; set; }
    public User? User { get; set; }
}
