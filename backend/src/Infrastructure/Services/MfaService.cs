using OtpNet;
using System;
namespace FinServe.Infrastructure.Services;
public class MfaService
{
    public string GenerateSecret() => Base32Encoding.ToString(KeyGeneration.GenerateRandomKey(20));
    public string GetProvisionUrl(string secret, string issuer, string account)
    {
        var label = Uri.EscapeDataString($"{issuer}:{account}");
        return $"otpauth://totp/{label}?secret={secret}&issuer={Uri.EscapeDataString(issuer)}&digits=6";
    }
    public bool ValidateTotp(string secret, string code)
    {
        var bytes = Base32Encoding.ToBytes(secret);
        var totp = new Totp(bytes);
        return totp.VerifyTotp(code, out long _, new VerificationWindow(1, 1));
    }
}
