using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace BaseCore.APIService.Controllers
{
    [Route("api/payments")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;

        public PaymentsController(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var order = await _dbContext.TicketOrders
                .Include(item => item.Payments)
                .FirstOrDefaultAsync(item => item.Id == dto.TicketOrderId && item.UserId == userId);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            if (order.Status == "Paid")
            {
                return BadRequest(new { message = "Order has already been paid" });
            }

            var payment = new Payment
            {
                TicketOrderId = order.Id,
                PaymentCode = BuildCode("PAY"),
                Method = string.IsNullOrWhiteSpace(dto.Method) ? "Manual" : dto.Method.Trim(),
                Provider = dto.Provider?.Trim() ?? "",
                Status = "Pending",
                Amount = order.TotalAmount,
                TransactionId = dto.TransactionId?.Trim() ?? "",
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Payments.Add(payment);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, ToPaymentResponse(payment));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            var payment = await _dbContext.Payments
                .Include(item => item.TicketOrder)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (payment == null)
            {
                return NotFound(new { message = "Payment not found" });
            }

            if (!isAdmin && payment.TicketOrder.UserId != userId)
            {
                return Forbid();
            }

            return Ok(ToPaymentResponse(payment));
        }

        [HttpPost("{id:int}/confirm")]
        public async Task<IActionResult> ConfirmPayment(int id, [FromBody] ConfirmPaymentDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            var payment = await _dbContext.Payments
                .Include(item => item.TicketOrder)
                    .ThenInclude(order => order.Items)
                .Include(item => item.TicketOrder)
                    .ThenInclude(order => order.ETickets)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (payment == null)
            {
                return NotFound(new { message = "Payment not found" });
            }

            if (!isAdmin && payment.TicketOrder.UserId != userId)
            {
                return Forbid();
            }

            if (payment.Status == "Paid")
            {
                return Ok(new
                {
                    payment = ToPaymentResponse(payment),
                    tickets = payment.TicketOrder.ETickets.Select(ToETicketResponse)
                });
            }

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            payment.Status = "Paid";
            payment.PaidAt = DateTime.UtcNow;
            payment.TransactionId = string.IsNullOrWhiteSpace(dto.TransactionId)
                ? payment.TransactionId
                : dto.TransactionId.Trim();

            payment.TicketOrder.Status = "Paid";
            await IssueTickets(payment.TicketOrder);

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            await _dbContext.Entry(payment.TicketOrder)
                .Collection(item => item.ETickets)
                .LoadAsync();

            return Ok(new
            {
                payment = ToPaymentResponse(payment),
                tickets = payment.TicketOrder.ETickets.Select(ToETicketResponse)
            });
        }

        private async Task IssueTickets(TicketOrder order)
        {
            var existingItemIds = await _dbContext.ETickets
                .Where(item => item.TicketOrderId == order.Id)
                .Select(item => item.TicketOrderItemId)
                .ToListAsync();

            foreach (var item in order.Items)
            {
                var issuedCount = existingItemIds.Count(id => id == item.Id);
                for (var index = issuedCount; index < item.Quantity; index++)
                {
                    var ticketCode = BuildCode("ETK");
                    _dbContext.ETickets.Add(new ETicket
                    {
                        TicketOrderId = order.Id,
                        TicketOrderItemId = item.Id,
                        UserId = order.UserId,
                        TicketCode = ticketCode,
                        QrCodePayload = JsonSerializer.Serialize(new
                        {
                            type = "football-ticket",
                            ticketCode,
                            orderId = order.Id,
                            orderItemId = item.Id
                        }),
                        HolderName = order.CustomerName,
                        Status = "Issued",
                        IssuedAt = DateTime.UtcNow
                    });
                }
            }
        }

        private static string BuildCode(string prefix)
        {
            return $"{prefix}-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..(prefix.Length + 1 + 14 + 1 + 12)];
        }

        private static object ToPaymentResponse(Payment payment)
        {
            return new
            {
                payment.Id,
                payment.TicketOrderId,
                payment.PaymentCode,
                payment.Method,
                payment.Provider,
                payment.Status,
                payment.Amount,
                payment.TransactionId,
                payment.CreatedAt,
                payment.PaidAt
            };
        }

        private static object ToETicketResponse(ETicket ticket)
        {
            return new
            {
                ticket.Id,
                ticket.TicketOrderId,
                ticket.TicketOrderItemId,
                ticket.TicketCode,
                ticket.QrCodePayload,
                ticket.HolderName,
                ticket.Status,
                ticket.IssuedAt,
                ticket.UsedAt
            };
        }
    }

    public class CreatePaymentDto
    {
        public int TicketOrderId { get; set; }
        public string? Method { get; set; }
        public string? Provider { get; set; }
        public string? TransactionId { get; set; }
    }

    public class ConfirmPaymentDto
    {
        public string? TransactionId { get; set; }
    }
}
