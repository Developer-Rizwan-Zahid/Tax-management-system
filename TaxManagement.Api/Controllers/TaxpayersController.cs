using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxManagement.Api.Data;
using TaxManagement.Api.Models;

namespace TaxManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxpayersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TaxpayersController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: /api/taxpayers
    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<IEnumerable<Taxpayer>>> GetTaxpayers()
    {
        var taxpayers = await _db.Taxpayers
            .AsNoTracking()
            .ToListAsync();
        return Ok(taxpayers);
    }

    // GET: /api/taxpayers/{id}
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<Taxpayer>> GetTaxpayer(Guid id)
    {
        var taxpayer = await _db.Taxpayers
            .Include(t => t.IncomeEntries)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (taxpayer == null) return NotFound();
        return Ok(taxpayer);
    }

    // POST: /api/taxpayers
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Taxpayer>> CreateTaxpayer([FromBody] Taxpayer model)
    {
        model.Id = Guid.NewGuid();
        _db.Taxpayers.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTaxpayer), new { id = model.Id }, model);
    }

    // PUT: /api/taxpayers/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTaxpayer(Guid id, [FromBody] Taxpayer model)
    {
        var existing = await _db.Taxpayers.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = model.Name;
        existing.Cnic = model.Cnic;
        existing.Contact = model.Contact;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/taxpayers/{id}
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTaxpayer(Guid id)
    {
        var existing = await _db.Taxpayers.FindAsync(id);
        if (existing == null) return NotFound();

        _db.Taxpayers.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}





