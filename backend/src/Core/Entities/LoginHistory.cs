namespace Core.Entities;

public sealed class LoginHistory : BaseEntity
{
    public int? UserId { get; set; }
    public string Email { get; set; }
    public DateTime? LoginTime { get; set; }
    public DateTime? LogoutTime { get; set; }
    public string IpAddress { get; set; }
    public string Device { get; set; }
    public Status Status { get; set; } = Status.SUCCESS;
    public string Message { get; set; }
}