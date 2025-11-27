namespace Core.Entities;

public sealed class RefreshToken : BaseEntity
{
    public required int UserId { get; set; }
    public required string Token { get; set; } = string.Empty;
    public required DateTime ExpiresAt { get; set; }
    public string? CreatedByIp { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? ReasonRevoked { get; set; }
    public User? User { get; set; }
}
