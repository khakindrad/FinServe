namespace Application.Dtos.Menus;

public sealed record CreateMenuDto(string Mame, int? ParentMenuId, string? Route, string? Icon, int Order);
