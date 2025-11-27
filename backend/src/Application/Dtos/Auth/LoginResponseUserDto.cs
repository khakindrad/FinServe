using Application.Dtos.Menus;

namespace Application.Dtos.Auth;

public sealed record LoginResponseUserDto(int Id, string FullName, string Email, bool EmailVerified, bool MobileVerified, string? ProfileImageUrl, IList<string> Roles, List<MenuTreeDto>? Menus);
