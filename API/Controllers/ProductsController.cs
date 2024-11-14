using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Specifications;
using Core.Interfaces;
using Core.Entities;
using API.RequestHelpers;

namespace API.Controllers;

public class ProductsController(IUnitOfWork unitOfWork) : BaseApiController
{
    [ResponseCache(Duration = 600)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
       [FromQuery] ProductSpecificationParams productSpecParams)
    {
        var specification = new ProductSpecification(productSpecParams);

        return await CreatePagedResult(unitOfWork.Repository<Product>(), specification,
            productSpecParams.PageIndex, productSpecParams.PageSize);
    }

    [ResponseCache(Duration = 600)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await unitOfWork.Repository<Product>().GetByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        unitOfWork.Repository<Product>().Add(product);

        var wasSuccessfullySaved = await unitOfWork.Complete();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem creating product");
        }

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (product.Id != id)
        {
            return BadRequest("Cannot update this product");
        }

        var isProductExist = unitOfWork.Repository<Product>().Exists(id);

        if (!isProductExist)
        {
            return NotFound();
        }

        unitOfWork.Repository<Product>().Update(product);

        var wasSuccessfullySaved = await unitOfWork.Complete();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem updating the product");
        }

        return NoContent();
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await unitOfWork.Repository<Product>().GetByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        unitOfWork.Repository<Product>().Remove(product);

        var wasSuccessfullySaved = await unitOfWork.Complete();

        if (!wasSuccessfullySaved)
        {
            return BadRequest("Problem deleting the product");
        }

        return NoContent();
    }

    [ResponseCache(Duration = 10000)]
    [HttpGet("brands")]
    public async Task<ActionResult<IEnumerable<string>>> GetBrands()
    {
        var specification = new BrandListSpecification();

        var brands = await unitOfWork.Repository<Product>().GetAllWithSpecAsync(specification);

        return Ok(brands);
    }

    [ResponseCache(Duration = 10000)]
    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<string>>> GetTypes()
    {
        var specification = new TypeListSpecification();

        var types = await unitOfWork.Repository<Product>().GetAllWithSpecAsync(specification);

        return Ok(types);
    }
}
