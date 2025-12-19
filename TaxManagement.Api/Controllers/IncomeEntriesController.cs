using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxManagement.Api.Data;
using TaxManagement.Api.Models;

namespace TaxManagement.Api.Controllers;

[ApiController]
[Route("api/taxpayers/{taxpayerId:guid}/incomes")]
public class IncomeEntriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public IncomeEntriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: /api/taxpayers/{id}/incomes
    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<IEnumerable<IncomeEntry>>> GetIncomes(Guid taxpayerId)
    {
        var incomes = await _db.IncomeEntries
            .Where(i => i.TaxpayerId == taxpayerId)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
        return Ok(incomes);
    }

    // POST: /api/taxpayers/{id}/incomes
    [HttpPost]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<IncomeEntry>> CreateIncome(Guid taxpayerId, [FromBody] IncomeEntry model)
    {
        var taxpayerExists = await _db.Taxpayers.AnyAsync(t => t.Id == taxpayerId);
        if (!taxpayerExists) return NotFound("Taxpayer not found");

        model.Id = Guid.NewGuid();
        model.TaxpayerId = taxpayerId;
        // Ensure DateTime is stored as UTC to satisfy PostgreSQL 'timestamp with time zone'
        if (model.Date.Kind == DateTimeKind.Unspecified)
        {
            model.Date = DateTime.SpecifyKind(model.Date, DateTimeKind.Utc);
        }

        _db.IncomeEntries.Add(model);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncomes), new { taxpayerId }, model);
    }

    // PUT: /api/taxpayers/{id}/incomes/{incomeId}
    [HttpPut("{incomeId:guid}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> UpdateIncome(Guid taxpayerId, Guid incomeId, [FromBody] IncomeEntry model)
    {
        var existing = await _db.IncomeEntries
            .FirstOrDefaultAsync(i => i.Id == incomeId && i.TaxpayerId == taxpayerId);
        if (existing == null) return NotFound();

        var date = model.Date;
        if (date.Kind == DateTimeKind.Unspecified)
        {
            date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
        }

        existing.Date = date;
        existing.Type = model.Type;
        existing.Amount = model.Amount;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/taxpayers/{id}/incomes/{incomeId}
    [HttpDelete("{incomeId:guid}")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> DeleteIncome(Guid taxpayerId, Guid incomeId)
    {
        var existing = await _db.IncomeEntries
            .FirstOrDefaultAsync(i => i.Id == incomeId && i.TaxpayerId == taxpayerId);
        if (existing == null) return NotFound();

        _db.IncomeEntries.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}







