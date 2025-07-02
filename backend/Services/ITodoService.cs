using backend.Entities;
using backend.Models;

namespace backend.Services;

public interface ITodoService
{
    Task<Todo?> CreateTodoAsync(Guid userId, string name);
    Task<Todo[]?> GetTodosAsync(Guid userId);
    Task<Todo?> PatchTodoCompletionAsync(Guid userId, Guid todoId);
    Task<Todo?> PatchTodoNameAsync(Guid userId, Guid todoId);
    Task<Guid?> DeleteTodoAsync(Guid userId, Guid todoId);
}
