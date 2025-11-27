namespace Application.Dtos.Auth;

public sealed record LoginDto(string Email, string Password, string? TotpCode);
