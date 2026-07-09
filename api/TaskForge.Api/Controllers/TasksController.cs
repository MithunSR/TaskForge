using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.Api.Services;
using TaskForge.Application.DTOs;
using TaskForge.Application.Interfaces;

namespace TaskForge.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ITaskNotifier _taskNotifier;

    public TasksController(ITaskService taskService, ITaskNotifier taskNotifier)
    {
        _taskService = taskService;
        _taskNotifier = taskNotifier;
    }

    [HttpGet("statuses")]
    public async Task<IActionResult> GetStatuses()
    {
        var statuses = await _taskService.GetStatusesAsync();
        return Ok(statuses);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTaskDto dto)
    {
        var task = await _taskService.CreateAsync(dto, User);
        await _taskNotifier.TaskCreated(task);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var task = await _taskService.GetByIdAsync(id, User);
        if (task is null) return NotFound();
        return Ok(task);
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int? statusId,
        [FromQuery] Guid? ownerId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _taskService.GetPagedAsync(statusId, ownerId, page, pageSize, User);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateTaskDto dto)
    {
        await _taskService.UpdateAsync(id, dto, User);
        var updated = await _taskService.GetByIdAsync(id, User);
        await _taskNotifier.TaskUpdated(updated!);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _taskService.GetByIdAsync(id, User);
        await _taskService.DeleteAsync(id, User);
        if (existing is not null)
        {
            await _taskNotifier.TaskDeleted(existing.Id, existing.OwnerId);
        }
        return NoContent();
    }
}