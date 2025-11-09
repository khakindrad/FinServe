using System;

namespace FinServe.Core.Entities;

public class PasswordResetToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(30);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool Used { get; set; } = false;

    public virtual User? User { get; set; }
}
