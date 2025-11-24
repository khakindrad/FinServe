using Core.Entities;

namespace Application.Dtos;

public sealed class RegisterResponseDto
{
    public required string Email { get; set; }
    public required string Mobile { get; set; }
    public required Gender Gender { get; set; }
    public required DateOnly DateOfBirth { get; set; }
    public required string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public required string LastName { get; set; }
    public required int CountryId { get; set; }
    public required int CityId { get; set; }
    public required int StateId { get; set; }
    public required string Address { get; set; }
    public required string PinCode { get; set; }
}