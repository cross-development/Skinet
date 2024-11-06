using System.Reflection;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Core.Entities;

namespace Infrastructure.Data;

public static class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context, UserManager<AppUser> userManager)
    {
        var hasAppAdmin = userManager.Users.Any(user => user.UserName == "admin@test.com");

        if (!hasAppAdmin)
        {
            var user = new AppUser
            {
                UserName = "admin@test.com",
                Email = "admin@test.com"
            };

            await userManager.CreateAsync(user, "Pa$$w0rd");
            await userManager.AddToRoleAsync(user, "Admin");
        }

        var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync(path + @"/Data/SeedData/products.json");

            var products = JsonSerializer.Deserialize<List<Product>>(productsData);

            if (products == null)
            {
                return;
            }

            context.Products.AddRange(products);

            await context.SaveChangesAsync();
        }

        if (!context.DeliveryMethods.Any())
        {
            var deliveryData = await File.ReadAllTextAsync(path + @"/Data/SeedData/delivery.json");

            var deliveryMethods = JsonSerializer.Deserialize<List<DeliveryMethod>>(deliveryData);

            if (deliveryMethods == null)
            {
                return;
            }

            context.DeliveryMethods.AddRange(deliveryMethods);

            await context.SaveChangesAsync();
        }
    }
}