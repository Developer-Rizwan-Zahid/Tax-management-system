using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxManagement.Api.Data;
using TaxManagement.Api.Models;

namespace TaxManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxSlabsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TaxSlabsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: /api/taxslabs
    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<IEnumerable<TaxSlab>>> GetSlabs()
    {
        var slabs = await _db.TaxSlabs
            .OrderBy(s => s.FromAmount)
            .ToListAsync();
        return Ok(slabs);
    }

    // POST: /api/taxslabs
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TaxSlab>> CreateSlab([FromBody] TaxSlab model)
    {
        _db.TaxSlabs.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSlabs), new { id = model.Id }, model);
    }

    // PUT: /api/taxslabs/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSlab(int id, [FromBody] TaxSlab model)
    {
        var existing = await _db.TaxSlabs.FindAsync(id);
        if (existing == null) return NotFound();

        existing.FromAmount = model.FromAmount;
        existing.ToAmount = model.ToAmount;
        existing.RatePercent = model.RatePercent;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/taxslabs/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSlab(int id)
    {
        var existing = await _db.TaxSlabs.FindAsync(id);
        if (existing == null) return NotFound();

        _db.TaxSlabs.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}





