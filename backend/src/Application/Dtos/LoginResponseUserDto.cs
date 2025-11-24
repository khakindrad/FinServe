namespace Application.Dtos;

public sealed class LoginResponseUserDto
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? ProfileImageUrl { get; set; }
    public IList<string> Roles { get; set; } = [];
}