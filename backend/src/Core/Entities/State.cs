namespace Core.Entities;

public sealed class State : BaseEntity
{
    public required string Name { get; set; }
    public required int CountryId { get; set; }
    public Country Country { get; set; } = null!;
    public ICollection<City> Cities { get; set; } = new List<City>();
}
