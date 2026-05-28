using BaseCore.APIService.Services;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/tickets")]
    [ApiController]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;
        private readonly SeatHoldService _seatHoldService;

        public TicketsController(SqlServerDbContext dbContext, SeatHoldService seatHoldService)
        {
            _dbContext = dbContext;
            _seatHoldService = seatHoldService;
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
                        ticket.SeatCode,
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
                    ticket.SeatCode,
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

            if (dto == null || dto.Items == null || dto.Items.Count == 0)
            {
                return BadRequest(new { message = "Order must contain at least one ticket listing" });
            }

            await _seatHoldService.ReleaseExpiredSeatHoldsAsync();
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable);

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

                var requestedSeatPlaceIds = item.SeatPlaceIds ?? new List<int>();
                var hasSeatPlaces = requestedSeatPlaceIds.Count > 0;
                var quantity = hasSeatPlaces ? requestedSeatPlaceIds.Count : item.Quantity;

                if (quantity <= 0)
                {
                    return BadRequest(new { message = "Ticket quantity must be greater than zero" });
                }

                if (hasSeatPlaces && item.Quantity != requestedSeatPlaceIds.Count)
                {
                    return BadRequest(new { message = "Ticket quantity must match seatPlaceIds count" });
                }

                if (hasSeatPlaces && requestedSeatPlaceIds.Distinct().Count() != requestedSeatPlaceIds.Count)
                {
                    return BadRequest(new { message = "seatPlaceIds must not contain duplicates" });
                }

                if (listing.AvailableQuantity < quantity)
                {
                    return BadRequest(new { message = $"Not enough tickets available for {listing.Title}" });
                }

                var orderItem = new TicketOrderItem
                {
                    TicketListingId = listing.Id,
                    Quantity = quantity,
                    UnitPrice = listing.UnitPrice
                };

                if (hasSeatPlaces)
                {
                    var inventories = await _dbContext.MatchSeatInventories
                        .Include(inventory => inventory.SeatPlace)
                        .Where(inventory => inventory.MatchId == listing.MatchId
                            && inventory.TicketListingId == listing.Id
                            && requestedSeatPlaceIds.Contains(inventory.SeatPlaceId))
                        .ToListAsync();

                    if (inventories.Count != requestedSeatPlaceIds.Count)
                    {
                        return BadRequest(new { message = "One or more seats are invalid for this ticket listing" });
                    }

                    if (inventories.Any(inventory => inventory.SeatPlace.StadiumSectionId != listing.StadiumSectionId))
                    {
                        return BadRequest(new { message = "One or more seats do not belong to this ticket listing section" });
                    }

                    var now = DateTime.UtcNow;
                    var unavailableSeat = inventories.FirstOrDefault(inventory =>
                        inventory.Status == "Sold"
                        || (inventory.Status == "Held"
                            && (inventory.HeldByUserId != userId
                                || !inventory.HoldExpiresAt.HasValue
                                || inventory.HoldExpiresAt <= now))
                        || (inventory.Status != "Available" && inventory.Status != "Held"));

                    if (unavailableSeat != null)
                    {
                        return Conflict(new
                        {
                            message = $"Seat {unavailableSeat.SeatPlace.Code} is not available",
                            seatPlaceId = unavailableSeat.SeatPlaceId,
                            status = unavailableSeat.Status
                        });
                    }

                    foreach (var inventory in inventories.OrderBy(inventory => requestedSeatPlaceIds.IndexOf(inventory.SeatPlaceId)))
                    {
                        orderItem.TicketOrderSeats.Add(new TicketOrderSeat
                        {
                            SeatPlaceId = inventory.SeatPlaceId,
                            SeatCode = inventory.SeatPlace.Code,
                            CreatedAt = now
                        });

                        inventory.Status = "Sold";
                        inventory.HeldByUserId = null;
                        inventory.HoldExpiresAt = null;
                        inventory.UpdatedAt = now;
                    }
                }

                listing.AvailableQuantity -= quantity;
                totalAmount += listing.UnitPrice * quantity;
                orderItems.Add(orderItem);
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

        [HttpPost("seat-holds")]
        public async Task<IActionResult> HoldSeats([FromBody] HoldSeatsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            if (dto == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            var seatPlaceIds = (dto.SeatPlaceIds ?? new List<int>()).Distinct().ToList();
            if (dto.MatchId <= 0 || dto.TicketListingId <= 0 || seatPlaceIds.Count == 0)
            {
                return BadRequest(new { message = "matchId, ticketListingId and seatPlaceIds are required" });
            }

            await _seatHoldService.ReleaseExpiredSeatHoldsAsync();
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var listing = await _dbContext.TicketListings
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == dto.TicketListingId);

            if (listing == null)
            {
                return BadRequest(new { message = $"Ticket listing {dto.TicketListingId} not found" });
            }

            if (listing.MatchId != dto.MatchId)
            {
                return BadRequest(new { message = "Ticket listing does not belong to this match" });
            }

            var inventories = await _dbContext.MatchSeatInventories
                .Include(inventory => inventory.SeatPlace)
                .Where(inventory => inventory.MatchId == dto.MatchId
                    && inventory.TicketListingId == dto.TicketListingId
                    && seatPlaceIds.Contains(inventory.SeatPlaceId))
                .ToListAsync();

            if (inventories.Count != seatPlaceIds.Count)
            {
                return BadRequest(new { message = "One or more seats are invalid for this match and ticket listing" });
            }

            if (inventories.Any(inventory => inventory.SeatPlace.StadiumSectionId != listing.StadiumSectionId))
            {
                return BadRequest(new { message = "One or more seats do not belong to this ticket listing section" });
            }

            var unavailableSeat = inventories.FirstOrDefault(inventory =>
                inventory.Status != "Available"
                && !(inventory.Status == "Held" && inventory.HeldByUserId == userId));

            if (unavailableSeat != null)
            {
                return Conflict(new
                {
                    message = $"Seat {unavailableSeat.SeatPlace.Code} is not available",
                    seatPlaceId = unavailableSeat.SeatPlaceId,
                    status = unavailableSeat.Status
                });
            }

            var holdExpiresAt = DateTime.UtcNow.AddMinutes(10);
            var now = DateTime.UtcNow;
            foreach (var inventory in inventories)
            {
                inventory.Status = "Held";
                inventory.HeldByUserId = userId;
                inventory.HoldExpiresAt = holdExpiresAt;
                inventory.UpdatedAt = now;
            }

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                Status = "Held",
                HoldExpiresAt = holdExpiresAt,
                SeatPlaceIds = seatPlaceIds
            });
        }

        [HttpDelete("seat-holds")]
        public async Task<IActionResult> CancelSeatHolds([FromBody] CancelSeatHoldsDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            if (dto == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            var seatPlaceIds = (dto.SeatPlaceIds ?? new List<int>()).Distinct().ToList();
            if (dto.MatchId <= 0 || seatPlaceIds.Count == 0)
            {
                return BadRequest(new { message = "matchId and seatPlaceIds are required" });
            }

            await _seatHoldService.ReleaseExpiredSeatHoldsAsync();

            var inventories = await _dbContext.MatchSeatInventories
                .Where(inventory => inventory.MatchId == dto.MatchId
                    && seatPlaceIds.Contains(inventory.SeatPlaceId))
                .ToListAsync();

            if (inventories.Count != seatPlaceIds.Count)
            {
                return BadRequest(new { message = "One or more seats are invalid for this match" });
            }

            var notHeldByUser = inventories.FirstOrDefault(inventory =>
                inventory.Status != "Held" || inventory.HeldByUserId != userId);

            if (notHeldByUser != null)
            {
                return Conflict(new
                {
                    message = "Only the user holding a seat can cancel its hold",
                    seatPlaceId = notHeldByUser.SeatPlaceId,
                    status = notHeldByUser.Status
                });
            }

            var now = DateTime.UtcNow;
            foreach (var inventory in inventories)
            {
                inventory.Status = "Available";
                inventory.HeldByUserId = null;
                inventory.HoldExpiresAt = null;
                inventory.UpdatedAt = now;
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                Status = "Available",
                SeatPlaceIds = seatPlaceIds
            });
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
        public List<int> SeatPlaceIds { get; set; } = new();
    }

    public class HoldSeatsDto
    {
        public int MatchId { get; set; }
        public int TicketListingId { get; set; }
        public List<int> SeatPlaceIds { get; set; } = new();
    }

    public class CancelSeatHoldsDto
    {
        public int MatchId { get; set; }
        public List<int> SeatPlaceIds { get; set; } = new();
    }
}
