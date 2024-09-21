using Core.Entities;

namespace Core.Specifications;

public class ProductSpecification : BaseSpecification<Product>
{
    public ProductSpecification(ProductSpecificationParams productSpecParams) : base(product =>
        (string.IsNullOrEmpty(productSpecParams.Search) || product.Name.ToLower().Contains(productSpecParams.Search)) &&
        (productSpecParams.Brands.Count == 0 || productSpecParams.Brands.Contains(product.Brand)) &&
        (productSpecParams.Types.Count == 0 || productSpecParams.Types.Contains(product.Type))
    )
    {
        ApplyPaging(productSpecParams.PageSize * (productSpecParams.PageIndex - 1), productSpecParams.PageSize);

        switch (productSpecParams.Sort)
        {
            case "priceAsc":
                AddOrderBy(product => product.Price);
                break;
            case "priceDesc":
                AddOrderByDescending(product => product.Price);
                break;
            default:
                AddOrderBy(product => product.Name);
                break;
        }
    }
}