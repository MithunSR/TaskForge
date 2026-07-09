using TaskForge.Application.DTOs;

namespace TaskForge.Api.Services;

public interface ITaskNotifier
{
    Task TaskCreated(TaskDto task);
    Task TaskUpdated(TaskDto task);
    Task TaskDeleted(Guid taskId, Guid ownerId);
}