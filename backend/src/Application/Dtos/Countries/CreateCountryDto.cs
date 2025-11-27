namespace Application.Dtos.Countries;

public sealed record CreateCountryDto(string Name, string IsoCode, string MobileCode);
