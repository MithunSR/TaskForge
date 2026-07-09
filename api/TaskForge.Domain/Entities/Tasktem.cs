public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = default!;
    public DateTime? DueDate { get; set; }
    public Guid OwnerId { get; set; }
}