namespace Application.Dtos.Auth;

public sealed record ResetPasswordDto(string Email, string Token, string NewPassword);
