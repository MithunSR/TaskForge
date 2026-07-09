using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskForge.Api.Hubs;

[Authorize]
public class TaskHub : Hub
{
    // No custom methods needed — clients only ever receive broadcasts,
    // they never call methods on this hub directly.
}