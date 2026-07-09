namespace TaskForge.Application.DTOs;

public record CreateTaskDto(string Title, string? Description, int StatusId, DateTime? DueDate, Guid? OwnerId);
public record UpdateTaskDto(string Title, string? Description, int StatusId, DateTime? DueDate);
public record TaskDto(Guid Id, string Title, string? Description, int StatusId, string StatusName, DateTime? DueDate, Guid OwnerId);
public record TaskStatusDto(int Id, string Name);
public record PagedResult<T>(List<T> Items, int Page, int PageSize, long TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}