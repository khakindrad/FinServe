namespace Application.Dtos;

public sealed class ForgotPasswordDto
{
    public required string Email { get; set; }
    public required Uri RedirectUrl { get; set; }
}
