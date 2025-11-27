namespace Core.Entities;

public sealed class MobileVerificationToken : BaseEntity
{
    public required string MobileNumber { get; set; }
    public required string Token { get; set; }
    public required DateTime ExpiryTime { get; set; }
    public required bool IsUsed { get; set; }
}