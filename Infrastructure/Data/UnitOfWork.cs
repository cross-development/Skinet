using System.Collections.Concurrent;
using Core.Entities;
using Core.Interfaces;

namespace Infrastructure.Data;

public class UnitOfWork(StoreContext context) : IUnitOfWork
{
    private readonly ConcurrentDictionary<string, object> _repositories = new();

    public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity
    {
        var typeName = typeof(TEntity).Name;

        return (IGenericRepository<TEntity>)_repositories.GetOrAdd(typeName, value =>
        {
            var repositoryType = typeof(GenericRepository<>).MakeGenericType(typeof(TEntity));

            return Activator.CreateInstance(repositoryType, context) ??
                   throw new InvalidOperationException($"Could not create repository instance for {value}");
        });
    }

    public async Task<bool> Complete()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void Dispose()
    {
        context.Dispose();
    }
}