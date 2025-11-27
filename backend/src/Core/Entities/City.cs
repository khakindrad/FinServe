namespace Core.Entities;

public sealed class City : BaseEntity
{
    public required string Name { get; set; }
    public required int StateId { get; set; }
    public State State { get; set; } = null!;
}
