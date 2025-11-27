namespace Application.Dtos.Menus;

public sealed record MenuTreeDto(int Id, string Name, string Route, string Icon, int Order)
{
    public List<MenuTreeDto> Children { get; set; } = [];
}
