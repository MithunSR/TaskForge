using FluentValidation;
using TaskForge.Application.DTOs;

namespace TaskForge.Application.Validators;

public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.StatusId).GreaterThan(0).WithMessage("A valid status must be selected.");
    }
}