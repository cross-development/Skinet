using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Core.Entities.OrderAggregate;
using Core.Specifications;
using Core.Interfaces;
using Core.Entities;
using API.Extensions;
using API.SignalR;

namespace API.Controllers;

public class PaymentsController(
    IPaymentService paymentService,
    IUnitOfWork unitOfWork,
    ILogger<PaymentsController> logger,
    IConfiguration configuration,
    IHubContext<NotificationHub> notificationHubContext) : BaseApiController
{
    private readonly string _webhookSecret = configuration["StripeSettings:WebhookSecret"]!;

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
        var deliveryMethods = await unitOfWork.Repository<DeliveryMethod>().GetAllAsync();

        return Ok(deliveryMethods);
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();

        try
        {
            var stripeEvent = ConstructStripeEvent(json);

            if (stripeEvent.Data.Object is not PaymentIntent intent)
            {
                return BadRequest("Invalid event data");
            }

            await HandlePaymentIntentSucceeded(intent);

            return Ok();
        }
        catch (StripeException e)
        {
            logger.LogError(e, "Stripe webhook error");

            return StatusCode(StatusCodes.Status500InternalServerError, "Stripe webhook error");
        }
        catch (Exception e)
        {
            logger.LogError(e, "An unexpected error occurred");

            return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred");
        }
    }

    private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
    {
        if (intent.Status == "succeeded")
        {
            var specification = new OrderSpecification(intent.Id, true);

            var order = await unitOfWork.Repository<Order>().GetEntityWithSpecAsync(specification)
                        ?? throw new Exception("Order not found");

            order.Status = (long)order.GetTotal() * 100 != intent.Amount
                ? OrderStatus.PaymentMismatch
                : OrderStatus.PaymentReceived;

            await unitOfWork.Complete();

            var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);

            if (!string.IsNullOrEmpty(connectionId))
            {
                await notificationHubContext.Clients
                    .Client(connectionId)
                    .SendAsync("OrderCompleteNotification", order.ToDto());
            }
        }
    }

    private Event ConstructStripeEvent(string json)
    {
        try
        {
            return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _webhookSecret);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to construct stripe event");

            throw new StripeException("Invalid signature");
        }
    }
}
