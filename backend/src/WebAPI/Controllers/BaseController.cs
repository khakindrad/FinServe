using Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace WebAPI.Controllers;

public abstract class BaseController : ControllerBase
{
    protected IActionResult Success<T>(T? data = null) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.OK, null, data);
        return Ok(response);
    }

    protected IActionResult Success<T>(string message, T? data = null) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.OK, message, data);
        return Ok(response);
    }

    protected IActionResult Created<T>(T data, string actionName, object route) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.Created, null, data);
        return CreatedAtAction(actionName, route, response);
    }

    protected IActionResult Created<T>(T data, string message, string actionName, object route) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.Created, message, data);
        return CreatedAtAction(actionName, route, response);
    }

    protected IActionResult Created<T>(T data, string message) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.Created, message, data);
        return CreatedAtAction(null, null, response);
    }

    protected IActionResult Fail(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
    {
        var response = new ApiResponse<string>(statusCode, message);
        return StatusCode((int)statusCode, response);
    }

    protected IActionResult BadRequest(string message)
    {
        var response = new ApiResponse<string>(HttpStatusCode.BadRequest, message);
        return StatusCode((int)HttpStatusCode.BadRequest, response);
    }

    protected IActionResult NotFound(string message)
    {
        var response = new ApiResponse<string>(HttpStatusCode.NotFound, message);
        return StatusCode((int)HttpStatusCode.NotFound, response);
    }

    protected IActionResult Unauthorized(string message)
    {
        var response = new ApiResponse<string>(HttpStatusCode.Unauthorized, message);
        return StatusCode((int)HttpStatusCode.Unauthorized, response);
    }

    protected IActionResult Forbid(string message)
    {
        var response = new ApiResponse<string>(HttpStatusCode.Forbidden, message);
        return StatusCode((int)HttpStatusCode.Forbidden, response);
    }

    protected IActionResult Ok(string message)
    {
        var response = new ApiResponse<string>(HttpStatusCode.OK, message);
        return StatusCode((int)HttpStatusCode.OK, response);
    }

    protected IActionResult Ok<T>(T data) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.OK, null, data);
        return StatusCode((int)HttpStatusCode.OK, response);
    }

    protected IActionResult Ok<T>(string message, T data) where T : class
    {
        var response = new ApiResponse<T>(HttpStatusCode.OK, message, data);
        return StatusCode((int)HttpStatusCode.OK, response);
    }

    protected IActionResult Fail<T>(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) where T : class
    {
        var response = new ApiResponse<T>(statusCode, message);
        return StatusCode((int)statusCode, response);
    }

    protected IActionResult Error(string message, string? details = null)
    {
        var response = new ApiResponse<string>(HttpStatusCode.InternalServerError, message + ": " + details);
        return StatusCode(500, response);
    }
}
