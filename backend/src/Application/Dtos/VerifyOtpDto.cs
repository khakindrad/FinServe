namespace Application.Dtos;

public class VerifyOtpDto
{
    public required int UserId { get; set; }
    public required string Otp { get; set; }
}