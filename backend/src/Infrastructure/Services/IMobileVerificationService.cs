using Application.Dtos;

namespace Infrastructure.Services;

public interface IMobileVerificationService
{
    Task<ApiResponse<string>> SendOtpAsync(int userId);
    Task<ApiResponse<string>> VerifyOtpAsync(int userId, string otp);
}
