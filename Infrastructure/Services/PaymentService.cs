using Microsoft.Extensions.Configuration;
using Stripe;
using Core.Interfaces;
using Core.Entities;

namespace Infrastructure.Services;

public class PaymentService(IConfiguration configuration, ICartService cartService, IUnitOfWork unitOfWork)
    : IPaymentService
{
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = configuration["StripeSettings:SecretKey"];

        var cart = await cartService.GetCartAsync(cartId)
                   ?? throw new Exception("Cart unavailable");

        var shippingPrice = await GetShippingPriceAsync(cart) ?? 0;

        await ValidateCartItemsInCartAsync(cart);

        var subtotal = CalculateSubtotal(cart);

        if (cart.Coupon != null)
        {
            subtotal = await ApplyDiscountAsync(cart.Coupon, subtotal);
        }

        var total = subtotal + shippingPrice;

        await CreateUpdatePaymentIntentAsync(cart, total);

        await cartService.SetCartAsync(cart);

        return cart;
    }

    private async Task CreateUpdatePaymentIntentAsync(ShoppingCart cart, long total)
    {
        var service = new PaymentIntentService();

        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = total,
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };

            var intent = await service.CreateAsync(options);
            cart.PaymentIntentId = intent.Id;
            cart.ClientSecret = intent.ClientSecret;
        }
        else
        {
            var options = new PaymentIntentUpdateOptions
            {
                Amount = total
            };

            await service.UpdateAsync(cart.PaymentIntentId, options);
        }
    }

    private async Task<long> ApplyDiscountAsync(AppCoupon appCoupon, long amount)
    {
        var couponService = new Stripe.CouponService();

        var coupon = await couponService.GetAsync(appCoupon.CouponId);

        if (coupon.AmountOff.HasValue)
        {
            amount -= coupon.AmountOff.Value * 100;
        }

        if (coupon.PercentOff.HasValue)
        {
            var discount = amount * (coupon.PercentOff.Value / 100);
            amount -= (long)discount;
        }

        return amount;
    }

    private long CalculateSubtotal(ShoppingCart cart)
    {
        var itemTotal = cart.Items.Sum(item => item.Quantity * item.Price * 100);

        return (long)itemTotal;
    }

    private async Task ValidateCartItemsInCartAsync(ShoppingCart cart)
    {
        foreach (var cartItem in cart.Items)
        {
            var productItem = await unitOfWork.Repository<Core.Entities.Product>()
                                  .GetByIdAsync(cartItem.ProductId)
                              ?? throw new Exception("Problem getting product in cart");

            if (cartItem.Price != productItem.Price)
            {
                cartItem.Price = productItem.Price;
            }
        }
    }

    private async Task<long?> GetShippingPriceAsync(ShoppingCart cart)
    {
        if (!cart.DeliveryMethodId.HasValue)
        {
            return null;
        }

        var deliveryMethod = await unitOfWork.Repository<DeliveryMethod>()
                                 .GetByIdAsync((int)cart.DeliveryMethodId)
                             ?? throw new Exception("Problem with delivery method");

        return (long)deliveryMethod.Price * 100;
    }
}