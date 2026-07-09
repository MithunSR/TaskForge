using System.Net;
using System.Text.Json;
using Npgsql;

namespace TaskForge.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException)
        {
            await WriteError(context, HttpStatusCode.NotFound, "The requested resource was not found.");
        }
        catch (UnauthorizedAccessException)
        {
            await WriteError(context, HttpStatusCode.Forbidden, "You do not have permission to perform this action.");
        }
        catch (PostgresException ex) when (ex.SqlState == "23505")
        {
            await WriteError(context, HttpStatusCode.Conflict, "A record with this value already exists.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred.");
            await WriteError(context, HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again.");
        }
    }

    private static async Task WriteError(HttpContext context, HttpStatusCode statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        var payload = JsonSerializer.Serialize(new { error = message });
        await context.Response.WriteAsync(payload);
    }
}