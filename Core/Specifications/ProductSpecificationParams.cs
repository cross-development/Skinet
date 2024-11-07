namespace Core.Specifications;

public class ProductSpecificationParams : PagingParams
{
    private string? _search = null;
    private List<string> _types = [];
    private List<string> _brands = [];

    public string? Sort { get; set; }

    public string Search
    {
        get => _search ?? "";
        set => _search = value.ToLower();
    }

    public List<string> Types
    {
        get => _types;
        set
        {
            _types = value
                .SelectMany(brand => brand.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .ToList();
        }
    }

    public List<string> Brands
    {
        get => _brands;
        set
        {
            _brands = value
                .SelectMany(brand => brand.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .ToList();
        }
    }
}