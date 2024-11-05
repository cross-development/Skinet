using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Core.Entities.OrderAggregate;

namespace Infrastructure.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.OwnsOne(order => order.ShippingAddress, navigationBuilder => navigationBuilder.WithOwner());
        builder.OwnsOne(order => order.PaymentSummary, navigationBuilder => navigationBuilder.WithOwner());

        builder.Property(order => order.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(order => order.Discount).HasColumnType("decimal(18,2)");
        builder.Property(order => order.OrderDate).HasConversion(
            orderDate => orderDate.ToUniversalTime(),
            orderDate => DateTime.SpecifyKind(orderDate, DateTimeKind.Utc));
        builder.Property(order => order.Status).HasConversion(
            orderStatus => orderStatus.ToString(),
            orderStatus => (OrderStatus)Enum.Parse(typeof(OrderStatus), orderStatus));

        builder.HasMany(order => order.OrderItems).WithOne().OnDelete(DeleteBehavior.Cascade);
    }
}