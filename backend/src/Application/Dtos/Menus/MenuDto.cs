namespace Application.Dtos.Menus;

public sealed record MenuDto(int MenuId, string Name, string? Route, string? Icon, int Order, List<MenuDto> Children);
