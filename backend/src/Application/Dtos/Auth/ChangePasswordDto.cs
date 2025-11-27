namespace Application.Dtos.Auth;

public sealed record ChangePasswordDto(int Id, string OldPassword, string NewPassword);
