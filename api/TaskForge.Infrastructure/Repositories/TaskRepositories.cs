using Dapper;
using TaskForge.Application.DTOs;
using TaskForge.Application.Interfaces;
using TaskForge.Infrastructure.Data;

namespace TaskForge.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly IDbConnectionFactory _factory;

    public TaskRepository(IDbConnectionFactory factory) => _factory = factory;
public async Task<TaskDto> CreateAsync(CreateTaskDto dto, Guid ownerId)
{
    using var connection = _factory.CreateConnection();
    return await connection.QuerySingleAsync<TaskDto>(
        @"SELECT id AS ""Id"", title AS ""Title"", description AS ""Description"",
                 status_id AS ""StatusId"", status_name AS ""StatusName"",
                 due_date::timestamp AS ""DueDate"", owner_id AS ""OwnerId""
          FROM fn_create_task(@Title, @Description, @StatusId, @DueDate::date, @OwnerId)",
        new { dto.Title, dto.Description, dto.StatusId, dto.DueDate, OwnerId = ownerId });
}

public async Task<TaskDto?> GetByIdAsync(Guid id)
{
    using var connection = _factory.CreateConnection();
    return await connection.QuerySingleOrDefaultAsync<TaskDto>(
        @"SELECT id AS ""Id"", title AS ""Title"", description AS ""Description"",
                 status_id AS ""StatusId"", status_name AS ""StatusName"",
                 due_date::timestamp AS ""DueDate"", owner_id AS ""OwnerId""
          FROM fn_get_task_by_id(@Id)",
        new { Id = id });
}

public async Task<PagedResult<TaskDto>> GetPagedAsync(Guid? ownerId, int? statusId, int page, int pageSize)
{
    using var connection = _factory.CreateConnection();

    var rows = (await connection.QueryAsync<TaskDto>(
        @"SELECT id AS ""Id"", title AS ""Title"", description AS ""Description"",
                 status_id AS ""StatusId"", status_name AS ""StatusName"",
                 due_date::timestamp AS ""DueDate"", owner_id AS ""OwnerId""
          FROM fn_get_tasks_paged(@OwnerId, @StatusId, @Page, @PageSize)",
        new { OwnerId = ownerId, StatusId = statusId, Page = page, PageSize = pageSize })).ToList();

    long totalCount = await connection.ExecuteScalarAsync<long>(
        @"SELECT COUNT(*) FROM tasks
          WHERE (@OwnerId::uuid IS NULL OR owner_id = @OwnerId)
            AND (@StatusId::int IS NULL OR status_id = @StatusId)",
        new { OwnerId = ownerId, StatusId = statusId });

    return new PagedResult<TaskDto>(rows, page, pageSize, totalCount);
}

   public async Task UpdateAsync(Guid id, UpdateTaskDto dto)
{
    using var connection = _factory.CreateConnection();
    await connection.ExecuteAsync(
        "CALL sp_update_task(@Id, @Title, @Description, @StatusId, @DueDate::date)",
        new { Id = id, dto.Title, dto.Description, dto.StatusId, dto.DueDate });
}

    public async Task DeleteAsync(Guid id)
    {
        using var connection = _factory.CreateConnection();
        await connection.ExecuteAsync("CALL sp_delete_task(@Id)", new { Id = id });
    }

    public async Task<List<TaskStatusDto>> GetStatusesAsync()
    {
        using var connection = _factory.CreateConnection();
        var statuses = await connection.QueryAsync<TaskStatusDto>(
            @"SELECT id AS ""Id"", name AS ""Name"" FROM fn_get_task_statuses()");
        return statuses.ToList();
    }
}