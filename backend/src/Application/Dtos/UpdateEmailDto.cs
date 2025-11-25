namespace Application.Dtos;

public sealed class UpdateEmailDto
{
    public required int UserId { get; set; }
    public required string NewEmail { get; set; }
}
