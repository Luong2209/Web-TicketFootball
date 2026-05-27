using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/tickets")]
    [ApiController]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;

        public TicketsController(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var orders = await _dbContext.TicketOrders
                .Include(order => order.Items)
                    .ThenInclude(item => item.TicketListing)
                    .ThenInclude(listing => listing.Match)
                .Include(order => order.Payments)
                .Include(order => order.ETickets)
                .Where(order => order.UserId == userId)
                .OrderByDescending(order => order.CreatedAt)
                .AsNoTracking()
                .Select(order => new
                {
                    order.Id,
                    order.CreatedAt,
                    order.TotalAmount,
                    order.Status,
                    Payments = order.Payments.Select(payment => new
                    {
                        payment.Id,
                        payment.PaymentCode,
                        payment.Method,
                        payment.Provider,
                        payment.Status,
                        payment.Amount,
                        payment.TransactionId,
                        payment.CreatedAt,
                        payment.PaidAt
                    }),
                    ETickets = order.ETickets.Select(ticket => new
                    {
                        ticket.Id,
                        ticket.TicketCode,
                        ticket.QrCodePayload,
                        ticket.HolderName,
                        ticket.Status,
                        ticket.IssuedAt,
                        ticket.UsedAt
                    }),
                    Items = order.Items.Select(item => new
                    {
                        item.Id,
                        item.Quantity,
                        item.UnitPrice,
                        Listing = new
                        {
                            item.TicketListing.Id,
                            item.TicketListing.Title,
                            item.TicketListing.RowLabel,
                            MatchSlug = item.TicketListing.Match.Slug
                        }
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("etickets")]
        public async Task<IActionResult> GetMyETickets()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var tickets = await _dbContext.ETickets
                .Include(ticket => ticket.TicketOrderItem)
                    .ThenInclude(item => item.TicketListing)
                    .ThenInclude(listing => listing.Match)
                    .ThenInclude(match => match.HomeTeam)
                .Include(ticket => ticket.TicketOrderItem)
                    .ThenInclude(item => item.TicketListing)
                    .ThenInclude(listing => listing.Match)
                    .ThenInclude(match => match.AwayTeam)
                .Include(ticket => ticket.TicketOrderItem)
                    .ThenInclude(item => item.TicketListing)
                    .ThenInclude(listing => listing.StadiumSection)
                .Where(ticket => ticket.UserId == userId)
                .AsNoTracking()
                .OrderByDescending(ticket => ticket.IssuedAt)
                .Select(ticket => new
                {
                    ticket.Id,
                    ticket.TicketOrderId,
                    ticket.TicketOrderItemId,
                    ticket.TicketCode,
                    ticket.QrCodePayload,
                    ticket.HolderName,
                    ticket.Status,
                    ticket.IssuedAt,
                    ticket.UsedAt,
                    Listing = new
                    {
                        ticket.TicketOrderItem.TicketListing.Id,
                        ticket.TicketOrderItem.TicketListing.Title,
                        ticket.TicketOrderItem.TicketListing.RowLabel,
                        Section = ticket.TicketOrderItem.TicketListing.StadiumSection.Code
                    },
                    Match = new
                    {
                        ticket.TicketOrderItem.TicketListing.Match.Id,
                        ticket.TicketOrderItem.TicketListing.Match.Slug,
                        HomeTeam = ticket.TicketOrderItem.TicketListing.Match.HomeTeam.Name,
                        AwayTeam = ticket.TicketOrderItem.TicketListing.Match.AwayTeam.Name,
                        ticket.TicketOrderItem.TicketListing.Match.KickoffTime
                    }
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpPost("orders")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateTicketOrderDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            if (dto.Items.Count == 0)
            {
                return BadRequest(new { message = "Order must contain at least one ticket listing" });
            }

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            var listingIds = dto.Items.Select(item => item.TicketListingId).Distinct().ToList();
            var listings = await _dbContext.TicketListings
                .Where(listing => listingIds.Contains(listing.Id))
                .ToDictionaryAsync(listing => listing.Id);

            decimal totalAmount = 0;
            var orderItems = new List<TicketOrderItem>();

            foreach (var item in dto.Items)
            {
                if (!listings.TryGetValue(item.TicketListingId, out var listing))
                {
                    return BadRequest(new { message = $"Ticket listing {item.TicketListingId} not found" });
                }

                if (item.Quantity <= 0)
                {
                    return BadRequest(new { message = "Ticket quantity must be greater than zero" });
                }

                if (listing.AvailableQuantity < item.Quantity)
                {
                    return BadRequest(new { message = $"Not enough tickets available for {listing.Title}" });
                }

                listing.AvailableQuantity -= item.Quantity;
                totalAmount += listing.UnitPrice * item.Quantity;
                orderItems.Add(new TicketOrderItem
                {
                    TicketListingId = listing.Id,
                    Quantity = item.Quantity,
                    UnitPrice = listing.UnitPrice
                });
            }

            var order = new TicketOrder
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "Pending",
                CustomerName = dto.CustomerName ?? "",
                CustomerEmail = dto.CustomerEmail ?? "",
                CustomerPhone = dto.CustomerPhone ?? "",
                Note = dto.Note ?? "",
                Items = orderItems
            };

            _dbContext.TicketOrders.Add(order);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetMyOrders), new { id = order.Id }, new { order.Id, order.TotalAmount, order.Status });
        }
    }

    public class CreateTicketOrderDto
    {
        public List<CreateTicketOrderItemDto> Items { get; set; } = new();
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? Note { get; set; }
    }

    public class CreateTicketOrderItemDto
    {
        public int TicketListingId { get; set; }
        public int Quantity { get; set; }
    }
}
