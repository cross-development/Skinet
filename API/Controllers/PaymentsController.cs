using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Interfaces;
using Core.Entities;

namespace API.Controllers;

public class PaymentsController(
    IPaymentService paymentService,
    IGenericRepository<DeliveryMethod> deliveryRepository)
    : BaseApiController
{
    [Authorize]
    [HttpPost("{cartId}")]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
    {
        var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);

        if (cart == null)
        {
            return BadRequest("Problem with your cart");
        }

        return Ok(cart);
    }

    [HttpGet("delivery-methods")]
    public async Task<ActionResult<IEnumerable<DeliveryMethod>>> GetDeliveryMethods()
    {
        var deliveryMethods = await deliveryRepository.GetAllAsync();

        return Ok(deliveryMethods);
    }
}
