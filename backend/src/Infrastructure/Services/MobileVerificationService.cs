using Application.Dtos;
using Common;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Serilog;
using System.Net;
using System.Security.Cryptography;

namespace Infrastructure.Services;

public sealed class MobileVerificationService : BaseService, IMobileVerificationService
{
    private readonly AppDbContext _db;
    private readonly ISmsSender _smsSender;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;

    public MobileVerificationService(ILogger logger, AppDbContext context, IUserRepository userRepository, ISmsSender smsSender, IConfiguration config)
        : base(logger.ForContext<MobileVerificationService>(), null)
    {
        _db = context;
        _userRepository = userRepository;
        _smsSender = smsSender;
        _config = config;
    }

    public static string GenerateOtp(int digits)
    {
        var rng = RandomNumberGenerator.GetInt32(0, (int)Math.Pow(10, digits));
        return rng.ToString($"D{digits}");
    }

    public async Task<ApiResponse<string>> SendOtpAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return new ApiResponse<string>(HttpStatusCode.NotFound, "User not found.");

        if (user.MobileVerified)
            return new ApiResponse<string>(HttpStatusCode.BadRequest, "Mobile already verified.");

        var otpLength = _config.GetValue("Sms:OtpLength", 6);

        var token = GenerateOtp(otpLength);

        var expiryMinutes = _config.GetValue("Sms:VerificationExpiryMinute", 15);

        var record = new MobileVerificationToken
        {
            MobileNumber = user.Mobile,
            Token = token,
            ExpiryTime = DateTime.UtcNow.AddMinutes(expiryMinutes),
            IsUsed = false
        };

        _db.MobileVerificationTokens.Add(record);
        await _db.SaveChangesAsync();

        //await _smsSender.SendSmsAsync(user.Mobile, $"Your OTP is {token}, valid till {expiryMinutes} minutes only.");
        await _smsSender.SendSmsAsync(user.FullName, user.Email, token, expiryMinutes);

        return new ApiResponse<string>(HttpStatusCode.OK, "OTP sent successfully.");
    }

    public async Task<ApiResponse<string>> VerifyOtpAsync(int userId, string otp)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return new ApiResponse<string>(HttpStatusCode.NotFound, "User not found.");

        var record = await _db.MobileVerificationTokens
           .Where(x => x.MobileNumber == user.Mobile && x.Token == otp && !x.IsUsed)
           .OrderByDescending(x => x.Id)
           .FirstOrDefaultAsync();

        if (record == null)
            return new ApiResponse<string>(HttpStatusCode.BadRequest, "Invalid or already used token.");

        if (record.ExpiryTime < DateTime.UtcNow)
            return new ApiResponse<string>(HttpStatusCode.BadRequest, "OTP expired.");

        record.IsUsed = true;
        await _db.SaveChangesAsync();

        // Mark user verified
        user.MobileVerified = true;
        await _db.SaveChangesAsync();

        return new ApiResponse<string>(HttpStatusCode.OK, "Mobile number verified successfully!");
    }
}
