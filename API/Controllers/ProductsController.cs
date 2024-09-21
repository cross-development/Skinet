using Microsoft.AspNetCore.Mvc;
using Core.Specifications;
using Core.Interfaces;
using Core.Entities;

namespace API.Controllers;

public class ProductsController(IGenericRepository<Product> repository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
       [FromQuery] ProductSpecificationParams productSpecParams)
    {
        var specification = new ProductSpecification(productSpecParams);

        return await CreatePagedResult(repository, specification, 
            productSpecParams.PageIndex, productSpecParams.PageSize);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await repository.GetByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        repository.Add(product);

        var wasSuccessfullySaved = await repository.SaveAllAsync();

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

        var isProductExist = repository.Exists(id);

        if (!isProductExist)
        {
            return NotFound();
        }

        repository.Update(product);

        var wasSuccessfullySaved = await repository.SaveAllAsync();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem updating the product");
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await repository.GetByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        repository.Remove(product);

        var wasSuccessfullySaved = await repository.SaveAllAsync();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem deleting the product");
        }

        return NoContent();
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IEnumerable<string>>> GetBrands()
    {
        var specification = new BrandListSpecification();

        var brands = await repository.GetAllWithSpecAsync(specification);

        return Ok(brands);
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<string>>> GetTypes()
    {
        var specification = new TypeListSpecification();

        var types = await repository.GetAllWithSpecAsync(specification);

        return Ok(types);
    }
}
