using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace BaseCore.APIService.Controllers
{
    [Route("api/checkins")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CheckinsController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;

        public CheckinsController(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost]
        public async Task<IActionResult> CheckIn([FromBody] CheckinTicketDto dto)
        {
            var checkedByUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(checkedByUserId))
            {
                return Unauthorized();
            }

            var ticketCode = ResolveTicketCode(dto);
            if (string.IsNullOrWhiteSpace(ticketCode))
            {
                return BadRequest(new { message = "Ticket code or QR payload is required" });
            }

            var ticket = await _dbContext.ETickets
                .Include(item => item.TicketOrder)
                .Include(item => item.TicketOrderItem)
                    .ThenInclude(item => item.TicketListing)
                    .ThenInclude(item => item.Match)
                .FirstOrDefaultAsync(item => item.TicketCode == ticketCode || item.QrCodePayload == dto.QrCodePayload);

            if (ticket == null)
            {
                return NotFound(new { message = "E-ticket not found" });
            }

            if (ticket.Status == "Used")
            {
                return Conflict(new { message = "Ticket has already been checked in", ticketCode = ticket.TicketCode, usedAt = ticket.UsedAt });
            }

            if (ticket.Status != "Issued")
            {
                return BadRequest(new { message = $"Ticket is not valid for check-in. Current status: {ticket.Status}" });
            }

            ticket.Status = "Used";
            ticket.UsedAt = DateTime.UtcNow;

            var checkin = new BaseCore.Entities.TicketCheckin
            {
                ETicketId = ticket.Id,
                CheckinCode = $"CHK-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..31],
                Gate = dto.Gate?.Trim() ?? "",
                DeviceId = dto.DeviceId?.Trim() ?? "",
                CheckedByUserId = checkedByUserId,
                Status = "Success",
                CheckedAt = DateTime.UtcNow,
                Note = dto.Note?.Trim() ?? ""
            };

            _dbContext.TicketCheckins.Add(checkin);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                checkin.Id,
                checkin.CheckinCode,
                checkin.Status,
                checkin.CheckedAt,
                ticket = new
                {
                    ticket.Id,
                    ticket.TicketCode,
                    ticket.HolderName,
                    ticket.Status,
                    matchId = ticket.TicketOrderItem.TicketListing.MatchId
                }
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetCheckins([FromQuery] int? ticketId = null)
        {
            var query = _dbContext.TicketCheckins
                .Include(item => item.ETicket)
                .AsNoTracking()
                .AsQueryable();

            if (ticketId.HasValue)
            {
                query = query.Where(item => item.ETicketId == ticketId.Value);
            }

            var checkins = await query
                .OrderByDescending(item => item.CheckedAt)
                .Select(item => new
                {
                    item.Id,
                    item.ETicketId,
                    item.CheckinCode,
                    item.Gate,
                    item.DeviceId,
                    item.CheckedByUserId,
                    item.Status,
                    item.CheckedAt,
                    item.Note,
                    TicketCode = item.ETicket.TicketCode
                })
                .ToListAsync();

            return Ok(checkins);
        }

        private static string ResolveTicketCode(CheckinTicketDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.TicketCode))
            {
                return dto.TicketCode.Trim();
            }

            if (string.IsNullOrWhiteSpace(dto.QrCodePayload))
            {
                return "";
            }

            try
            {
                using var json = JsonDocument.Parse(dto.QrCodePayload);
                if (json.RootElement.TryGetProperty("ticketCode", out var value))
                {
                    return value.GetString() ?? "";
                }
            }
            catch (JsonException)
            {
                return "";
            }

            return "";
        }
    }

    public class CheckinTicketDto
    {
        public string? TicketCode { get; set; }
        public string? QrCodePayload { get; set; }
        public string? Gate { get; set; }
        public string? DeviceId { get; set; }
        public string? Note { get; set; }
    }
}
