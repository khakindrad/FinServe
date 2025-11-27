namespace Application.Dtos.Users;

public sealed record PendingUserDto(int Id, string Email, string FullName, ICollection<string> UserRoles, DateTime CreatedAt);
