namespace Application.Dtos.Auth;

public sealed record LoginResponseDto(string AccessToken, LoginResponseUserDto User);
