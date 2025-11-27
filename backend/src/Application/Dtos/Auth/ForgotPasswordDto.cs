namespace Application.Dtos.Auth;

public sealed record ForgotPasswordDto(string Email, Uri RedirectUrl);
