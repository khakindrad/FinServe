namespace Application.Dtos;

public sealed class LoginResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public List<string> Roles { get; set; } = [];
}
