using System.Net;

namespace Application.Dtos;

public sealed class ApiResponse<T> where T : class
{
    public int StatusCode { get; }
    public HttpStatusCode HttpStatusCode { get; }
    public string? Message { get; }

    public T? Data { get; }

    public ApiResponse(HttpStatusCode statusCode, string? message = null, T? data = null)
    {
        StatusCode = (int)statusCode;
        HttpStatusCode = statusCode;
        Message = message;
        Data = data;
    }
}