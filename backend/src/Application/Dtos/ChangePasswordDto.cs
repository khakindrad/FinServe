namespace Application.Dtos;

public sealed class ChangePasswordDto
{
    public required int Id { get; set; }
    public required string OldPassword { get; set; }
    public required string NewPassword { get; set; }
}
