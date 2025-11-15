using Core.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace Infrastructure.Services;

public class PasswordHistoryService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public PasswordHistoryService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<bool> IsPasswordReusedAsync(User user, string newPassword)
    {
        var lastN = _config.GetValue("Security:PasswordHistoryCount", 5);
        var histories = await _db.PasswordHistories
            .Where(p => p.UserId == user.Id)
            .OrderByDescending(p => p.CreatedAt)
            .Take(lastN)
            .ToListAsync();

        foreach (var old in histories)
        {
            if (VerifyHashedPassword(old.PasswordHash, newPassword))
                return true;
        }

        return false;
    }

    public async Task AddToHistoryAsync(User user)
    {
        var history = new PasswordHistory
        {
            UserId = user.Id,
            PasswordHash = user.PasswordHash,
            CreatedAt = DateTime.UtcNow
        };
        _db.PasswordHistories.Add(history);
        await _db.SaveChangesAsync();
    }

    private bool VerifyHashedPassword(string hash, string password)
    {
        try
        {
            var bytes = Convert.FromBase64String(hash);
            var salt = new byte[16];
            Buffer.BlockCopy(bytes, 1, salt, 0, 16);
            var stored = new byte[32];
            Buffer.BlockCopy(bytes, 17, stored, 0, 32);
            var derived = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(stored, derived);
        }
        catch { return false; }
    }
}
