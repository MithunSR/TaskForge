using Microsoft.AspNetCore.SignalR;
using TaskForge.Api.Hubs;
using TaskForge.Application.DTOs;

namespace TaskForge.Api.Services;

public class TaskNotifier : ITaskNotifier
{
    private readonly IHubContext<TaskHub> _hubContext;

    public TaskNotifier(IHubContext<TaskHub> hubContext) => _hubContext = hubContext;

    public Task TaskCreated(TaskDto task) =>
        _hubContext.Clients.All.SendAsync("TaskCreated", task);

    public Task TaskUpdated(TaskDto task) =>
        _hubContext.Clients.All.SendAsync("TaskUpdated", task);

    public Task TaskDeleted(Guid taskId, Guid ownerId) =>
        _hubContext.Clients.All.SendAsync("TaskDeleted", new { taskId, ownerId });
}