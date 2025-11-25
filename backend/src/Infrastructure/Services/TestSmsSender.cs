using Common;
using Serilog;

namespace Infrastructure.Services;

public sealed class TestSmsSender : BaseService, ISmsSender
{
    private readonly IEmailSender _emailSender;

    public TestSmsSender(ILogger logger, IEmailSender emailSender)
        : base(logger.ForContext<TestSmsSender>(), null)
    {
        _emailSender = emailSender;
    }

    public async Task SendSmsAsync(string name, string mobileNo, string otp, int expiryMinutes)
    {
        string body = $@"
        <p>Hello <strong>{name}</strong>,</p>
        <p>Welcome to FinServe!</p>
        <p>Please use the OTP below to verify your mobile number:</p>
        <p style='padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:6px;'>
              {otp}
        </p>
        <p>This otp will expire in {expiryMinutes} Minutes.</p>;
        ";

        await _emailSender.SendEmailAsync(mobileNo, "Verify your Mobile Number - FinServe", body);

        Logger.Debug("Test SMS sent to {MobileNo} with OTP {Otp}", mobileNo, otp);
    }
}
