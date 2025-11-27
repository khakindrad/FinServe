using Core.Entities;

namespace Application.Dtos.Auth;

public sealed record RegisterResponseDto(string Email, string Mobile, Gender Gender, DateOnly DateOfBirth, string FirstName, string? MiddleName, string LastName, int CountryId, int CityId, int StateId, string Address, string PinCode);
