using System;

namespace Core.Entities;

public class LoginHistory
{
    public long Id { get; set; }
    public int? UserId { get; set; }
    public string Email { get; set; }
    public DateTime? LoginTime { get; set; }
    public DateTime? LogoutTime { get; set; }
    public string IpAddress { get; set; }
    public string Device { get; set; }
    public string Status { get; set; } = "SUCCESS"; // SUCCESS | FAILED | LOCKED
    public string Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}