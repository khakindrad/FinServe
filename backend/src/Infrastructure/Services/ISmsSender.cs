namespace Infrastructure.Services;

public interface ISmsSender
{
    Task SendSmsAsync(string name, string mobileNo, string otp, int expiryMinutes);
}