namespace Core.Entities;

public sealed class Country : BaseEntity
{
    public required string Name { get; set; }
    public required string IsoCode { get; set; }
    public required string MobileCode { get; set; }

    public ICollection<State> States { get; set; } = new List<State>();
}
