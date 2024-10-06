using Microsoft.Extensions.Configuration;
using Stripe;
using Core.Interfaces;
using Core.Entities;

namespace Infrastructure.Services;

public class PaymentService(
    IConfiguration configuration,
    ICartService cartService,
    IGenericRepository<Core.Entities.Product> productRepository,
    IGenericRepository<DeliveryMethod> deliveryRepository)
    : IPaymentService
{
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = configuration["StripeSettings:SecretKey"];

        var cart = await cartService.GetCartAsync(cartId);

        if (cart == null)
        {
            return null;
        }

        var shippingPrice = 0m;

        if (cart.DeliveryMethodId.HasValue)
        {
            var deliveryMethod = await deliveryRepository.GetByIdAsync((int)cart.DeliveryMethodId);

            if (deliveryMethod == null)
            {
                return null;
            }

            shippingPrice = deliveryMethod.Price;
        }

        foreach (var item in cart.Items)
        {
            var productItem = await productRepository.GetByIdAsync(item.ProductId);

            if (productItem == null)
            {
                return null;
            }

            if (item.Price != productItem.Price)
            {
                item.Price = productItem.Price;
            }
        }

        var paymentIntentService = new PaymentIntentService();

        var amount = (long)cart.Items.Sum(item => item.Quantity * (item.Price * 100)) + (long)shippingPrice * 100;

        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            PaymentIntent? intent = null;

            var options = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };

            intent = await paymentIntentService.CreateAsync(options);
            cart.PaymentIntentId = intent.Id;
            cart.ClientSecret = intent.ClientSecret;
        }
        else
        {
            var options = new PaymentIntentUpdateOptions
            {
                Amount = amount,
            };

            await paymentIntentService.UpdateAsync(cart.PaymentIntentId, options);
        }

        await cartService.SetCartAsync(cart);

        return cart;
    }
}