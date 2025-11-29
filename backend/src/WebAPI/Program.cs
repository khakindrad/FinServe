using Common.Configurations;
using Common.Helper;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Debugging;
using System.Runtime;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using WebAPI.HostedServices;
using WebAPI.Middleware;
using WebAPI.Services;
using DateTimeUtil = Common.DateTimeUtil;

internal sealed class Program
{
    private const string _appName = "Fin Serve API";
    private const string _stopCommand = "STOP";
    private static Serilog.ILogger _logger;
    public static async Task Main(string[] args)
    {
        try
        {
            var mainThreadName = "Main Thread";
            Thread.CurrentThread.Name = mainThreadName;

            var builder = WebApplication.CreateBuilder(args);

            var processPath = Path.GetDirectoryName(Environment.ProcessPath) ?? throw new InvalidOperationException("Unable to determine process path");

            Directory.SetCurrentDirectory(processPath);

            //Adding Json Files
            builder.Configuration
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

            //Adding Configuration Options into DI
            builder.Services.AddOptions<AppConfig>().BindConfiguration(AppConfig.SectionName).ValidateOnStart();

            var appConfig = builder.Configuration.GetSection(AppConfig.SectionName).Get<AppConfig>() ?? throw new InvalidOperationException("AppConfig section is not defined.");

            GCSettings.LatencyMode = appConfig.GCLatencyMode;

            SelfLog.Enable(msg => Console.Error.WriteLine($"Serilog SelfLog: {msg}"));

            builder.Host.UseSerilog((ctx, lc) => lc
                .ReadFrom.Configuration(ctx.Configuration));

            builder.WebHost.CaptureStartupErrors(true);

            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;

            var conn = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new Exception("Missing DefaultConnection");
            builder.Services.AddDbContext<AppDbContext>(opt => opt.UseMySql(conn, ServerVersion.AutoDetect(conn)));

            builder.Services.AddMemoryCache();
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddSingleton<IHostLifetime, CustomConsoleLiftime>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<RefreshTokenService>();
            builder.Services.AddScoped<IEmailSender, EmailSender>();
            builder.Services.AddScoped<MfaService>();
            builder.Services.AddScoped<PasswordResetService>();
            builder.Services.AddScoped<PasswordPolicyService>();
            builder.Services.AddScoped<PasswordHistoryService>();
            // Infrastructure services
            builder.Services.AddScoped<PasswordExpiryNotificationService>();
            builder.Services.AddHostedService<PasswordExpiryHostedService>();

            builder.Services.AddScoped<IUserRoleService, UserRoleService>();
            builder.Services.AddScoped<IMenuService, MenuService>();
            builder.Services.AddScoped<ISmsSender, TestSmsSender>();
            builder.Services.AddScoped<IMobileVerificationService, MobileVerificationService>();

            // Read CORS config from appsettings.json
            var corsSettings = builder.Configuration.GetSection("Cors");
            var allowedOrigins = corsSettings.GetSection("AllowedOrigins").Get<string[]>();
            var allowCredentials = corsSettings.GetValue<bool>("AllowCredentials");

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AppCorsPolicy", policy =>
                {
                    policy.WithOrigins(allowedOrigins)   // Use origins from appsettings.json
                          .AllowAnyHeader()
                          .AllowAnyMethod();

                    if (allowCredentials)
                        policy.AllowCredentials();        // Only enable if needed
                });
            });

            builder.Services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                        RoleClaimType = ClaimTypes.Role,
                    };
                });

            builder.Services.AddAuthorization();

            builder.Services.AddControllers()
                .AddJsonOptions(o =>
                {
                    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                    //o.JsonSerializerOptions.Converters.Add(new DateOnlyConverter());
                    o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "FinServe API", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Id = "Bearer",
                                Type = ReferenceType.SecurityScheme
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            // global exception handler (must be early in pipeline)
            app.UseGlobalExceptionHandler();

            //Get Required Services
            T GetService<T>() where T : notnull
            {
                return app.Services.GetRequiredService<T>();
            }

            _logger = GetService<Serilog.ILogger>().ForContext<Program>();

            //using (var scope = app.Services.CreateScope())
            //{
            //    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            //    db.Database.Migrate(); // creates DB if missing and applies migrations
            //}

            // SEED DATABASE
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await AdminSeeder.SeedAsync(db).ConfigureAwait(true);
            }

            //if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseSerilogRequestLogging();
            app.UseCors("AppCorsPolicy");
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Lifetime.ApplicationStarted.Register(() => OnApplicationStarted(app));
            app.Lifetime.ApplicationStopping.Register(OnApplicationStopping);
            app.Lifetime.ApplicationStopped.Register(OnApplicationStopped);

            app.Run();
        }
        catch (Exception ex)
        {
            _logger.Fatal(ex, "Application start-up failed");
            Console.WriteLine(ex.Message);
            Console.Read();
        }
        finally
        {
            OnApplicationStopping();
            OnApplicationStopped();
        }
    }

    private static void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
    {
        var exception = e.ExceptionObject as Exception;

        if (exception is not null)
        {
            _logger.Fatal(exception, "Unhandled exception");
            Console.WriteLine(exception.Message);
        }
        else
        {
            Console.WriteLine("Unhandled exception occurred, but it could not be cast to Exception type. {0}", e.ToString());
        }
        Log.CloseAndFlush();
    }

    //private static void OnCancelKeyPressed(object? sender, ConsoleCancelEventArgs e)
    //{
    //    _logger.Information("Ctrl+C has beed pressed, Ignoring the event.");
    //    e.Cancel = true;
    //}

    private static void OnApplicationStarted(WebApplication app)
    {
        _logger.Information("Now listening on:{0}", app.Urls);
        _logger.Information("Hosting environment:{0}", app.Environment.EnvironmentName);
        _logger.Information("Content root path:{0}", app.Environment.ContentRootPath);
        _logger.Information("Application started. {_appName} at {Now} Enter {_stopCommand} to shut down.", _appName, DateTimeUtil.Now, _stopCommand);

        //Console.CancelKeyPress += OnCancelKeyPressed;

        var isAppStopped = ConsoleHelper.WaitConsoleForUserCommand(_stopCommand);

        if (isAppStopped)
        {
            _logger.Information("{0} triggered. Stopping and Exiting application", _stopCommand);
            app.Lifetime.StopApplication();
        }
    }

    private static void OnApplicationStopping()
    {
        _logger.Information("Application stopping. {_appName} at {Now}.", _appName, DateTimeUtil.Now);
        HandleCleanupBeforeExit();
    }

    private static void OnApplicationStopped()
    {
        _logger.Information("Application stopped. {_appName} at {Now}.", _appName, DateTimeUtil.Now);
        ExitApplication();
    }

    private static void ExitApplication()
    {
        Environment.Exit(0);
    }

    private static void HandleCleanupBeforeExit()
    {
        Log.CloseAndFlush();
    }
}
