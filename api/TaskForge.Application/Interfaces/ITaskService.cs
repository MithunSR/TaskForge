 using System.Security.Claims;
using TaskForge.Application.DTOs;

namespace TaskForge.Application.Interfaces;

public interface ITaskService
{
    Task<TaskDto> CreateAsync(CreateTaskDto dto, ClaimsPrincipal currentUser);
    Task<TaskDto?> GetByIdAsync(Guid id, ClaimsPrincipal currentUser);
    Task<PagedResult<TaskDto>> GetPagedAsync(int? statusId, Guid? ownerFilter, int page, int pageSize, ClaimsPrincipal currentUser);
    Task UpdateAsync(Guid id, UpdateTaskDto dto, ClaimsPrincipal currentUser);
    Task DeleteAsync(Guid id, ClaimsPrincipal currentUser);
    Task<List<TaskStatusDto>> GetStatusesAsync();
}