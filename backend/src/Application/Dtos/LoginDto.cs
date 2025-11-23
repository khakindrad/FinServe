namespace Application.Dtos;

public sealed class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? TotpCode { get; set; }
}
