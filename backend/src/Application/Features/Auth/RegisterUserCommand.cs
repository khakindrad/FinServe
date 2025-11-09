namespace FinServe.Application.Features.Auth;
public record RegisterUserCommand(string Email, string Password, string? Mobile, string? FullName);

