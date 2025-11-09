using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace FinServe.Infrastructure.Services;

public class PasswordPolicyService
{
    private readonly IConfiguration _config;

    public PasswordPolicyService(IConfiguration config)
    {
        _config = config;
    }

    public (bool IsValid, string Message) ValidatePassword(string password)
    {
        var minLength = _config.GetValue<int>("Security:PasswordPolicy:MinLength", 8);
        var requireUpper = _config.GetValue<bool>("Security:PasswordPolicy:RequireUppercase", true);
        var requireLower = _config.GetValue<bool>("Security:PasswordPolicy:RequireLowercase", true);
        var requireDigit = _config.GetValue<bool>("Security:PasswordPolicy:RequireDigit", true);
        var requireSpecial = _config.GetValue<bool>("Security:PasswordPolicy:RequireSpecial", true);
        var noWhitespace = _config.GetValue<bool>("Security:PasswordPolicy:NoWhitespace", true);

        if (string.IsNullOrWhiteSpace(password))
            return (false, "Password cannot be empty.");

        if (password.Length < minLength)
            return (false, $"Password must be at least {minLength} characters long.");

        if (requireUpper && !Regex.IsMatch(password, @"[A-Z]"))
            return (false, "Password must contain at least one uppercase letter.");

        if (requireLower && !Regex.IsMatch(password, @"[a-z]"))
            return (false, "Password must contain at least one lowercase letter.");

        if (requireDigit && !Regex.IsMatch(password, @"[0-9]"))
            return (false, "Password must contain at least one digit.");

        if (requireSpecial && !Regex.IsMatch(password, @"[!@#$%^&*(),.?""':{}|<>_\-+=]"))
            return (false, "Password must contain at least one special character.");

        if (noWhitespace && Regex.IsMatch(password, @"\s"))
            return (false, "Password must not contain spaces.");

        return (true, "Password meets complexity requirements.");
    }
}
