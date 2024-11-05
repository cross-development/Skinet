using Microsoft.Extensions.Configuration;
using Stripe;
using Core.Entities;
using Core.Interfaces;

namespace Infrastructure.Services;

public class CouponService : ICouponService
{
    public CouponService(IConfiguration configuration)
    {
        StripeConfiguration.ApiKey = configuration["StripeSettings:SecretKey"];
    }

    public async Task<AppCoupon?> GetCouponFromPromoCode(string code)
    {
        var promotionService = new PromotionCodeService();

        var options = new PromotionCodeListOptions
        {
            Code = code
        };

        var promotionCodes = await promotionService.ListAsync(options);

        var promotionCode = promotionCodes.FirstOrDefault();

        if (promotionCode is { Coupon: not null })
        {
            return new AppCoupon
            {
                CouponId = promotionCode.Coupon.Id,
                Name = promotionCode.Coupon.Name,
                AmountOff = promotionCode.Coupon.AmountOff,
                PercentOff = promotionCode.Coupon.PercentOff,
                PromotionCode = promotionCode.Code
            };
        }

        return null;
    }
}