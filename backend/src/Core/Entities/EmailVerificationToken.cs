namespace Core.Entities;

public sealed class EmailVerificationToken : BaseEntity
{
    public required string Email { get; set; }
    public required string Token { get; set; }
    public required DateTime ExpiryTime { get; set; }
    public required bool IsUsed { get; set; }
}
