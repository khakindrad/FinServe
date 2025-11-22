namespace Core.Entities;

public class EmailVerificationToken
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string Token { get; set; }
    public DateTime ExpiryTime { get; set; }
    public bool IsUsed { get; set; }
}
