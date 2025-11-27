using Core.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly string? _currentUser;
    // Runtime constructor (with IHttpContextAccessor)
    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor accessor)
        : base(options)
    {
        _currentUser = accessor.HttpContext?.User?.Identity?.Name;
    }

    // Design-time constructor (for migrations)
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<PasswordHistory> PasswordHistories { get; set; } = null!;
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;
    public DbSet<LoginHistory> LoginHistory { get; set; }
    public DbSet<DashboardAlert> DashboardAlerts { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<MenuMaster> MenuMaster { get; set; } = null!;
    public DbSet<RoleMenu> RoleMenus { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }
    public DbSet<MobileVerificationToken> MobileVerificationTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(b =>
        {
            b.HasKey(r => r.Id);
            b.Property(r => r.Name).IsRequired().HasMaxLength(100);
            b.HasData(
                new Role { Id = 1, Name = "Admin", Description = "Platform administrator", IsActive = true },
                new Role { Id = 2, Name = "Employee", Description = "Internal employee", IsActive = true },
                new Role { Id = 3, Name = "Dealer", Description = "Car dealer" , IsActive = true },
                new Role { Id = 4, Name = "Banker", Description = "Bank representative" , IsActive = true },
                new Role { Id = 5, Name = "Customer", Description = "End customer" , IsActive = true }
            );
        });

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.Property(u => u.Email).IsRequired().HasMaxLength(200);
            b.HasMany(u => u.UserRoles);
        });

        modelBuilder.Entity<PasswordResetToken>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasOne(p => p.User)
             .WithMany()
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DashboardAlert>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.Title).HasMaxLength(200).IsRequired();
            b.Property(a => a.Message).IsRequired();
            b.HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        //modelBuilder.Entity<LoginHistory>(b =>
        //{
        //    b.HasKey(l => l.Id);
        //    b.Property(l => l.Email).HasMaxLength(200);
        //    b.Property(l => l.IpAddress).HasMaxLength(50);
        //    b.Property(l => l.Device).HasMaxLength(255);
        //    b.Property(l => l.Status).HasMaxLength(20).HasDefaultValue("SUCCESS");
        //    b.Property(l => l.Message).HasMaxLength(255);
        //    b.Property(l => l.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        //    b.HasOne(l => l.User)
        //        .WithMany()
        //        .HasForeignKey(l => l.UserId)
        //        .OnDelete(DeleteBehavior.SetNull);
        //});
        modelBuilder.Entity<Country>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
            b.Property(c => c.IsoCode).HasMaxLength(10);
            b.Property(c => c.MobileCode).HasMaxLength(10);
        });

        modelBuilder.Entity<State>(b =>
        {
            b.HasKey(s => s.Id);
            b.Property(s => s.Name).HasMaxLength(100).IsRequired();
            b.HasOne(s => s.Country)
                .WithMany(c => c.States)
                .HasForeignKey(s => s.CountryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<City>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
            b.HasOne(c => c.State)
                .WithMany(s => s.Cities)
                .HasForeignKey(c => c.StateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Country>().HasData(
            new Country { Id = 1, Name = "India", IsoCode = "IN", MobileCode = "+91" },
            new Country { Id = 2, Name = "United States", IsoCode = "US", MobileCode = "+1" }
            );

        modelBuilder.Entity<State>().HasData(
            new State { Id = 1, Name = "Maharashtra", CountryId = 1 },
            new State { Id = 2, Name = "Gujarat", CountryId = 1 },
            new State { Id = 3, Name = "California", CountryId = 2 }
        );

        modelBuilder.Entity<City>().HasData(
            new City { Id = 1, Name = "Mumbai", StateId = 1 },
            new City { Id = 2, Name = "Pune", StateId = 1 },
            new City { Id = 3, Name = "Ahmedabad", StateId = 2 },
            new City { Id = 4, Name = "San Francisco", StateId = 3 }
        );

        // USER <--> ROLE (Join Table)
        modelBuilder.Entity<UserRole>()
            .HasKey(c => c.Id);

        modelBuilder.Entity<UserRole>()
            .HasIndex(ur => new { ur.UserId, ur.RoleId })
            .IsUnique();

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
        .HasOne(ur => ur.Role)
        .WithMany(r => r.UserRoles)
        .HasForeignKey(ur => ur.RoleId);

        // ROLE <--> MENU (Join Table)
        modelBuilder.Entity<RoleMenu>()
            .HasKey(rm => rm.Id);

        modelBuilder.Entity<RoleMenu>()
            .HasIndex(rm => new { rm.RoleId, rm.MenuId })
            .IsUnique();

        modelBuilder.Entity<RoleMenu>()
        .HasOne(rm => rm.Role)
        .WithMany(r => r.RoleMenus)
        .HasForeignKey(rm => rm.RoleId);

        modelBuilder.Entity<RoleMenu>()
        .HasOne(rm => rm.MenuMaster)
        .WithMany(m => m.RoleMenus)
        .HasForeignKey(rm => rm.MenuId);

        modelBuilder.Entity<MenuMaster>()
            .HasKey(m => m.Id);

        modelBuilder.Entity<MenuMaster>()
    .HasOne(m => m.Parent)
    .WithMany(m => m.Children)
    .HasForeignKey(m => m.ParentId)
    .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MenuMaster>().HasData(
            new MenuMaster { Id = 1, Name = "Profile", Route = "#", ParentId = null, Sequence = 1,CreatedBy = "Admin" },
            new MenuMaster { Id = 2, Name = "Masters", Route = "#", ParentId = null, Sequence = 2,CreatedBy = "Admin" },
            new MenuMaster { Id = 3, Name = "Users", Route = "#", ParentId = null, Sequence = 3, CreatedBy = "Admin" }
        );

        modelBuilder.Entity<MenuMaster>().HasData(
            //Profile Menus
            new MenuMaster { Id = 9, Name = "View Profile", Route = "/admin/dashboard/masters/menus", ParentId = 1, Sequence = 1, CreatedBy = "Admin" },
            new MenuMaster { Id = 10, Name = "Change Password", Route = "/admin/dashboard/masters/menus", ParentId = 1, Sequence = 2, CreatedBy = "Admin" },
            //Master Menus
            new MenuMaster { Id = 4, Name = "Countries", Route = "/admin/masters/countries", ParentId = 2, Sequence = 1, CreatedBy = "Admin" },
            new MenuMaster { Id = 5, Name = "States", Route = "/admin/masters/states", ParentId = 2, Sequence = 2, CreatedBy = "Admin" },
            new MenuMaster { Id = 6, Name = "Cities", Route = "/admin/masters/cities", ParentId = 2, Sequence = 3, CreatedBy = "Admin" },
            new MenuMaster { Id = 7, Name = "Roles", Route = "/admin/masters/roles", ParentId = 2, Sequence = 4, CreatedBy = "Admin" },
            new MenuMaster { Id = 8, Name = "Menus", Route = "/admin/masters/menus", ParentId = 2, Sequence = 5, CreatedBy = "Admin" },            
            //Users Menu
            new MenuMaster { Id = 11, Name = "Users", Route = "/admin/user-management/all-users", ParentId = 3, Sequence = 1, CreatedBy = "Admin" },
            new MenuMaster { Id = 12, Name = "Approve Users", Route = "/admin/user-management/approve-user", ParentId = 3, Sequence = 2, CreatedBy = "Admin" },
            new MenuMaster { Id = 13, Name = "Unlock Users", Route = "/admin/user-management/unlock-user", ParentId = 3, Sequence = 3, CreatedBy = "Admin" },
            new MenuMaster { Id = 14, Name = "Assign Roles", Route = "/admin/user-management/assign-roles", ParentId = 3, Sequence = 4, CreatedBy = "Admin" }
        );
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedTime = DateTime.UtcNow;
                entry.Entity.LastUpdatedTime = DateTime.UtcNow;
                entry.Entity.CreatedBy = _currentUser;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastUpdatedTime = DateTime.UtcNow;
                entry.Entity.LastUpdatedBy = _currentUser;

                // Prevent overwriting Create fields
                entry.Property(x => x.CreatedTime).IsModified = false;
                entry.Property(x => x.CreatedBy).IsModified = false;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
