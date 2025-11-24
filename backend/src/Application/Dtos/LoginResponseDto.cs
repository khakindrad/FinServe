namespace Application.Dtos;

public sealed class LoginResponseDto
{
    public required string AccessToken { get; set; }

    public required LoginResponseUserDto User { get; set; }
}
