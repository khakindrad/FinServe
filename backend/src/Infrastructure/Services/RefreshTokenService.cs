using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace Infrastructure.Services;
public class RefreshTokenService
{
    private readonly AppDbContext _db;
    public RefreshTokenService(AppDbContext db) { _db = db; }

    private string GenerateRandomToken(int size = 64) => Convert.ToBase64String(RandomNumberGenerator.GetBytes(size));

    public async Task<RefreshToken> CreateRefreshTokenAsync(int userId, string createdByIp, int days = 30)
    {
        var token = GenerateRandomToken(64);
        var rt = new RefreshToken { UserId = userId, Token = token, CreatedByIp = createdByIp, ExpiresAt = DateTime.UtcNow.AddDays(days) };
        _db.RefreshTokens.Add(rt);
        await _db.SaveChangesAsync();
        return rt;
    }

    public async Task<RefreshToken?> GetValidRefreshTokenAsync(string token) =>
        await _db.RefreshTokens.Include(r => r.User).Where(r => r.Token == token && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow).FirstOrDefaultAsync();

    public async Task RevokeAsync(RefreshToken rt, string? reason = null, string? replacedBy = null)
    {
        rt.RevokedAt = DateTime.UtcNow;
        rt.ReasonRevoked = reason;
        rt.ReplacedByToken = replacedBy;
        await _db.SaveChangesAsync();
    }
}
