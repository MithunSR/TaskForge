using TaskForge.Application.DTOs;

namespace TaskForge.Application.Interfaces;

public interface ITaskRepository
{
    Task<TaskDto> CreateAsync(CreateTaskDto dto, Guid ownerId);
    Task<TaskDto?> GetByIdAsync(Guid id);
    Task<PagedResult<TaskDto>> GetPagedAsync(Guid? ownerId, int? statusId, int page, int pageSize);
    Task UpdateAsync(Guid id, UpdateTaskDto dto);
    Task DeleteAsync(Guid id);
    Task<List<TaskStatusDto>> GetStatusesAsync();
}