using Core.Entities;

namespace Core.Interfaces;

public interface IGenericRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task<T?> GetEntityWithSpecAsync(ISpecification<T> specification);
    Task<IReadOnlyList<T>> GetAllWithSpecAsync(ISpecification<T> specification);
    Task<TResult?> GetEntityWithSpecAsync<TResult>(ISpecification<T, TResult> specification);
    Task<IReadOnlyList<TResult>> GetAllWithSpecAsync<TResult>(ISpecification<T, TResult> specification);
    void Add(T entity);
    void Update(T entity);
    void Remove(T entity);
    bool Exists(int id);
    Task<int> CountAsync(ISpecification<T> specification);
}