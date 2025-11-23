using Common;
using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class AdminSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Ensure DB is created
        await context.Database.MigrateAsync();

        // 1 Create Admin Role
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (adminRole == null)
        {
            adminRole = new Role
            {
                Id = 1,
                Name = "Admin",
                Description = "Platform administrator"
            };

            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
        }

        // 2️ Create Admin User
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@finserve.com");
        if (adminUser == null)
        {
            var hasher = new PasswordHasher<User>();

            adminUser = new User
            {
                Id = 1,
                Email = "admin@finserve.com",
                Mobile = "9999999999",
                Gender = Gender.PerferNotToSay,
                DateOfBirth = DateTimeUtil.DateOnly,
                FirstName = "System",
                LastName = "Administrator",
                CountryId = 1,
                StateId = 1,
                CityId = 1,
                Address = "123 Admin St, Metropolis",
                PinCode = "400001",
                //UserRoles = 1,
                IsActive = true,
                IsApproved = true,
                EmailVerified = true,
                MobileVerified = true,
                // Hash Password
                PasswordHash = string.Empty,
                PasswordLastChanged = DateTime.UtcNow
            };

            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@FinServe123!");

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }

        // 3️ Assign Admin Role to Admin User (if not already)
        bool isAssigned = await context.UserRoles
            .AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id);

        if (!isAssigned)
        {
            context.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });

            await context.SaveChangesAsync();
        }

        // 4️ Assign ALL menus to Admin Role
        var allMenus = await context.RoleMenus.Select(m => m.RoleMenuId).ToListAsync();

        foreach (var menuId in allMenus)
        {
            bool alreadyAssigned = await context.RoleMenus
                .AnyAsync(rm => rm.RoleId == adminRole.Id && rm.MenuId == menuId);

            if (!alreadyAssigned)
            {
                context.RoleMenus.Add(new RoleMenu
                {
                    RoleId = adminRole.Id,
                    MenuId = menuId
                });
            }
        }

        await context.SaveChangesAsync();
    }
}
