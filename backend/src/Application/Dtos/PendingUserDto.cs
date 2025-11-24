namespace Application.Dtos;

public sealed class PendingUserDto
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public ICollection<string> UserRoles { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}