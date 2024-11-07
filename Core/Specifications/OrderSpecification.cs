using Core.Entities.OrderAggregate;

namespace Core.Specifications;

public class OrderSpecification : BaseSpecification<Order>
{
    public OrderSpecification(string email)
        : base(order => order.BuyerEmail == email)
    {
        AddInclude(order => order.OrderItems);
        AddInclude(order => order.DeliveryMethod);
        AddOrderByDescending(order => order.OrderDate);
    }

    public OrderSpecification(string email, int id)
        : base(order => order.BuyerEmail == email && order.Id == id)
    {
        AddInclude("OrderItems");
        AddInclude("DeliveryMethod");
    }

    public OrderSpecification(string paymentIntentId, bool isPaymentIntent)
        : base(order => order.PaymentIntentId == paymentIntentId)
    {
        AddInclude("OrderItems");
        AddInclude("DeliveryMethod");
    }

    public OrderSpecification(OrderSpecificationParams specificationParams)
        : base(order => string.IsNullOrEmpty(specificationParams.Status)
                        || order.Status == ParseStatus(specificationParams.Status))
    {
        AddInclude("OrderItems");
        AddInclude("DeliveryMethod");
        ApplyPaging(specificationParams.PageSize * (specificationParams.PageIndex - 1), specificationParams.PageSize);
        AddOrderByDescending(order => order.OrderDate);
    }

    public OrderSpecification(int id) : base(order => order.Id == id)
    {
        AddInclude("OrderItems");
        AddInclude("DeliveryMethod");
    }

    private static OrderStatus? ParseStatus(string status)
    {
        if (Enum.TryParse<OrderStatus>(status, true, out var result))
        {
            return result;
        }

        return null;
    }
}