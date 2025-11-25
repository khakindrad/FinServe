namespace Core.Entities;

public sealed class MobileVerificationToken
{
    public int Id { get; set; }
    public string MobileNumber { get; set; }
    public string Token { get; set; }
    public DateTime ExpiryTime { get; set; }
    public bool IsUsed { get; set; }
}