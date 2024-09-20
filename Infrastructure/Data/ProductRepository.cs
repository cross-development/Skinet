using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Core.Entities;

namespace Infrastructure.Data;

public class ProductRepository(StoreContext context) : IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetProductsAsync(string? brand, string? type)
    {
        var query = context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(product => product.Brand == brand);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(product => product.Type == type);
        }

        return await query.ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await context.Products.FindAsync(id);
    }

    public async Task<IReadOnlyList<string>> GetBrandsAsync()
    {
        return await context.Products.Select(product => product.Brand)
            .Distinct()
            .ToListAsync();
    }

    public async Task<IReadOnlyList<string>> GetTypesAsync()
    {
        return await context.Products.Select(product => product.Type)
            .Distinct()
            .ToListAsync();
    }

    public void AddProduct(Product product)
    {
        context.Products.Add(product);
    }

    public void UpdateProduct(Product product)
    {
        context.Entry(product).State = EntityState.Modified;
    }

    public void DeleteProduct(Product product)
    {
        context.Products.Remove(product);
    }

    public bool ProductExists(int id)
    {
        return context.Products.Any(product => product.Id == id);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}