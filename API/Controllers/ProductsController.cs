using Microsoft.AspNetCore.Mvc;
using Core.Interfaces;
using Core.Entities;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductRepository productRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(string? brand, string? type)
    {
        var products = await productRepository.GetProductsAsync(brand, type);

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await productRepository.GetProductByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        productRepository.AddProduct(product);

        var wasSuccessfullySaved = await productRepository.SaveChangesAsync();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem creating product");
        }

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (product.Id != id)
        {
            return BadRequest("Cannot update this product");
        }

        var isProductExist = productRepository.ProductExists(id);

        if (!isProductExist)
        {
            return NotFound();
        }

        productRepository.UpdateProduct(product);

        var wasSuccessfullySaved = await productRepository.SaveChangesAsync();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem updating the product");
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await productRepository.GetProductByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        productRepository.DeleteProduct(product);

        var wasSuccessfullySaved = await productRepository.SaveChangesAsync();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem deleting the product");
        }

        return NoContent();
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IEnumerable<string>>> GetBrands()
    {
        var brands = await productRepository.GetBrandsAsync();

        return Ok(brands);
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<string>>> GetTypes()
    {
        var types = await productRepository.GetTypesAsync();

        return Ok(types);
    }
}
