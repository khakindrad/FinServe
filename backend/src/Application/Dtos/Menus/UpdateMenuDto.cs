namespace Application.Dtos.Menus;

public sealed record UpdateMenuDto(string? Name, int? ParentMenuId, string? Route, string? Icon, int? Order);
