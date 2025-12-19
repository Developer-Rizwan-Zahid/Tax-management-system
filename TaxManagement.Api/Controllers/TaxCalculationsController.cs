using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxManagement.Api.Data;
using TaxManagement.Api.Models;
using TaxManagement.Api.Services;

namespace TaxManagement.Api.Controllers;

[ApiController]
[Route("api/taxpayers/{taxpayerId:guid}")]
public class TaxCalculationsController : ControllerBase
{
    private readonly ITaxCalculationService _taxCalculationService;
    private readonly ApplicationDbContext _db;
    private readonly IPdfReportService _pdfReportService;

    public TaxCalculationsController(
        ITaxCalculationService taxCalculationService,
        ApplicationDbContext db,
        IPdfReportService pdfReportService)
    {
        _taxCalculationService = taxCalculationService;
        _db = db;
        _pdfReportService = pdfReportService;
    }

    // POST: /api/taxpayers/{id}/calculate
    [HttpPost("calculate")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<TaxCalculation>> Calculate(Guid taxpayerId)
    {
        var calculation = await _taxCalculationService.CalculateTaxForTaxpayerAsync(taxpayerId);
        return Ok(calculation);
    }

    // GET: /api/taxpayers/{id}/report
    [HttpGet("report")]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> GetReport(Guid taxpayerId)
    {
        var taxpayer = await _db.Taxpayers
            .Include(t => t.IncomeEntries)
            .FirstOrDefaultAsync(t => t.Id == taxpayerId);
        if (taxpayer == null) return NotFound();

        var latestCalculation = await _db.TaxCalculations
            .Where(c => c.TaxpayerId == taxpayerId)
            .OrderByDescending(c => c.CalculatedAt)
            .FirstOrDefaultAsync();

        if (latestCalculation == null)
        {
            latestCalculation = await _taxCalculationService.CalculateTaxForTaxpayerAsync(taxpayerId);
        }

        var pdfBytes = _pdfReportService.GenerateTaxReportPdf(taxpayer, latestCalculation);
        return File(pdfBytes, "application/pdf", $"TaxReport_{taxpayer.Name}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf");
    }
}





