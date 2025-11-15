namespace Core.Entities;

public class Country
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IsoCode { get; set; } = string.Empty;
    public string MobileCode { get; set; } = string.Empty;

    public ICollection<State> States { get; set; } = new List<State>();
}
