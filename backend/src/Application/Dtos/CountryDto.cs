namespace Application.Dtos;

public class CountryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IsoCode { get; set; } = string.Empty;
    public string MobileCode { get; set; } = string.Empty;
}
