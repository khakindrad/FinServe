namespace Application.Dtos;

public sealed class UpdateMobileDto
{
    public required int UserId { get; set; }
    public required string NewMobile { get; set; }
}
