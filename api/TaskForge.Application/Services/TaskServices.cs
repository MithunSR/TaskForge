using System.Security.Claims;
using TaskForge.Application.DTOs;
using TaskForge.Application.Interfaces;

namespace TaskForge.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;

    public TaskService(ITaskRepository taskRepository) => _taskRepository = taskRepository;

    private static Guid GetUserId(ClaimsPrincipal user)
    {
        var value = user.FindFirst("sub")?.Value
            ?? throw new InvalidOperationException("Token is missing the 'sub' claim.");
        return Guid.Parse(value);
    }

    private static bool IsAdmin(ClaimsPrincipal user) => user.IsInRole("Admin");

    public async Task<TaskDto> CreateAsync(CreateTaskDto dto, ClaimsPrincipal currentUser)
    {
        // Admins may assign a task to any user; a standard User always owns their own tasks.
        var ownerId = IsAdmin(currentUser) && dto.OwnerId.HasValue
            ? dto.OwnerId.Value
            : GetUserId(currentUser);

        return await _taskRepository.CreateAsync(dto, ownerId);
    }

    public async Task<TaskDto?> GetByIdAsync(Guid id, ClaimsPrincipal currentUser)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task is null) return null;

        if (!IsAdmin(currentUser) && task.OwnerId != GetUserId(currentUser))
            throw new UnauthorizedAccessException();

        return task;
    }

    public async Task<PagedResult<TaskDto>> GetPagedAsync(int? statusId, Guid? ownerFilter, int page, int pageSize, ClaimsPrincipal currentUser)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        // A standard User can ONLY ever see their own tasks — forced from their token,
        // never trusted from a query parameter regardless of what the client sends.
        Guid? ownerId = IsAdmin(currentUser) ? ownerFilter : GetUserId(currentUser);

        return await _taskRepository.GetPagedAsync(ownerId, statusId, page, pageSize);
    }

    public async Task UpdateAsync(Guid id, UpdateTaskDto dto, ClaimsPrincipal currentUser)
    {
        var existing = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException();

        if (!IsAdmin(currentUser) && existing.OwnerId != GetUserId(currentUser))
            throw new UnauthorizedAccessException();

        await _taskRepository.UpdateAsync(id, dto);
    }

    public async Task DeleteAsync(Guid id, ClaimsPrincipal currentUser)
    {
        var existing = await _taskRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException();

        if (!IsAdmin(currentUser) && existing.OwnerId != GetUserId(currentUser))
            throw new UnauthorizedAccessException();

        await _taskRepository.DeleteAsync(id);
    }

    public async Task<List<TaskStatusDto>> GetStatusesAsync() =>
        await _taskRepository.GetStatusesAsync();
}