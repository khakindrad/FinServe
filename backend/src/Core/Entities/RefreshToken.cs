namespace FinServe.Core.Entities;
public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public System.DateTime ExpiresAt { get; set; }
    public System.DateTime CreatedAt { get; set; } = System.DateTime.UtcNow;
    public string? CreatedByIp { get; set; }
    public System.DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? ReasonRevoked { get; set; }
    public virtual User? User { get; set; }
}
