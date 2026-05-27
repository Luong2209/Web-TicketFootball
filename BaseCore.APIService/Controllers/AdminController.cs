using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;

        public AdminController(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("matches")]
        public async Task<IActionResult> GetMatches()
        {
            var matches = await _dbContext.Matches
                .Include(item => item.HomeTeam)
                .Include(item => item.AwayTeam)
                .Include(item => item.Stadium)
                .AsNoTracking()
                .OrderByDescending(item => item.KickoffTime)
                .Select(item => new
                {
                    item.Id,
                    item.Slug,
                    item.Competition,
                    item.HomeTeamId,
                    item.AwayTeamId,
                    item.StadiumId,
                    item.KickoffTime,
                    item.Status,
                    item.IsFeatured,
                    HomeTeam = item.HomeTeam.Name,
                    AwayTeam = item.AwayTeam.Name,
                    Stadium = item.Stadium.Name
                })
                .ToListAsync();

            return Ok(matches);
        }

        [HttpPost("matches")]
        public async Task<IActionResult> CreateMatch([FromBody] SaveMatchDto dto)
        {
            var validation = await ValidateMatchDto(dto);
            if (validation != null)
            {
                return validation;
            }

            var match = new FootballMatch
            {
                Slug = dto.Slug.Trim(),
                Competition = dto.Competition?.Trim() ?? "Premier League",
                HomeTeamId = dto.HomeTeamId,
                AwayTeamId = dto.AwayTeamId,
                StadiumId = dto.StadiumId,
                KickoffTime = dto.KickoffTime,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Scheduled" : dto.Status.Trim(),
                IsFeatured = dto.IsFeatured
            };

            _dbContext.Matches.Add(match);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMatches), new { id = match.Id }, match);
        }

        [HttpPut("matches/{id:int}")]
        public async Task<IActionResult> UpdateMatch(int id, [FromBody] SaveMatchDto dto)
        {
            var match = await _dbContext.Matches.FindAsync(id);
            if (match == null)
            {
                return NotFound(new { message = "Match not found" });
            }

            var validation = await ValidateMatchDto(dto, id);
            if (validation != null)
            {
                return validation;
            }

            match.Slug = dto.Slug.Trim();
            match.Competition = dto.Competition?.Trim() ?? "Premier League";
            match.HomeTeamId = dto.HomeTeamId;
            match.AwayTeamId = dto.AwayTeamId;
            match.StadiumId = dto.StadiumId;
            match.KickoffTime = dto.KickoffTime;
            match.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Scheduled" : dto.Status.Trim();
            match.IsFeatured = dto.IsFeatured;

            await _dbContext.SaveChangesAsync();
            return Ok(match);
        }

        [HttpDelete("matches/{id:int}")]
        public async Task<IActionResult> DeleteMatch(int id)
        {
            var match = await _dbContext.Matches.FindAsync(id);
            if (match == null)
            {
                return NotFound(new { message = "Match not found" });
            }

            _dbContext.Matches.Remove(match);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("stadiums")]
        public async Task<IActionResult> GetStadiums()
        {
            var stadiums = await _dbContext.Stadiums
                .Include(item => item.Sections)
                .AsNoTracking()
                .OrderBy(item => item.Name)
                .Select(item => new
                {
                    item.Id,
                    item.Name,
                    item.City,
                    item.Country,
                    item.Capacity,
                    item.ImageUrl,
                    SectionCount = item.Sections.Count
                })
                .ToListAsync();

            return Ok(stadiums);
        }

        [HttpPost("stadiums")]
        public async Task<IActionResult> CreateStadium([FromBody] SaveStadiumDto dto)
        {
            var stadium = new Stadium();
            ApplyStadium(stadium, dto);

            _dbContext.Stadiums.Add(stadium);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStadiums), new { id = stadium.Id }, stadium);
        }

        [HttpPut("stadiums/{id:int}")]
        public async Task<IActionResult> UpdateStadium(int id, [FromBody] SaveStadiumDto dto)
        {
            var stadium = await _dbContext.Stadiums.FindAsync(id);
            if (stadium == null)
            {
                return NotFound(new { message = "Stadium not found" });
            }

            ApplyStadium(stadium, dto);
            await _dbContext.SaveChangesAsync();

            return Ok(stadium);
        }

        [HttpGet("stadiums/{stadiumId:int}/sections")]
        public async Task<IActionResult> GetSections(int stadiumId)
        {
            var sections = await _dbContext.StadiumSections
                .Where(item => item.StadiumId == stadiumId)
                .AsNoTracking()
                .OrderBy(item => item.Code)
                .ToListAsync();

            return Ok(sections);
        }

        [HttpPost("stadiums/{stadiumId:int}/sections")]
        public async Task<IActionResult> CreateSection(int stadiumId, [FromBody] SaveSectionDto dto)
        {
            if (!await _dbContext.Stadiums.AnyAsync(item => item.Id == stadiumId))
            {
                return NotFound(new { message = "Stadium not found" });
            }

            var section = new StadiumSection { StadiumId = stadiumId };
            ApplySection(section, dto);

            _dbContext.StadiumSections.Add(section);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSections), new { stadiumId }, section);
        }

        [HttpPut("sections/{id:int}")]
        public async Task<IActionResult> UpdateSection(int id, [FromBody] SaveSectionDto dto)
        {
            var section = await _dbContext.StadiumSections.FindAsync(id);
            if (section == null)
            {
                return NotFound(new { message = "Section not found" });
            }

            ApplySection(section, dto);
            await _dbContext.SaveChangesAsync();

            return Ok(section);
        }

        [HttpDelete("sections/{id:int}")]
        public async Task<IActionResult> DeleteSection(int id)
        {
            var section = await _dbContext.StadiumSections.FindAsync(id);
            if (section == null)
            {
                return NotFound(new { message = "Section not found" });
            }

            _dbContext.StadiumSections.Remove(section);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("tickets")]
        public async Task<IActionResult> GetTicketListings([FromQuery] int? matchId = null)
        {
            var query = _dbContext.TicketListings
                .Include(item => item.Match)
                    .ThenInclude(item => item.HomeTeam)
                .Include(item => item.Match)
                    .ThenInclude(item => item.AwayTeam)
                .Include(item => item.StadiumSection)
                .AsNoTracking()
                .AsQueryable();

            if (matchId.HasValue)
            {
                query = query.Where(item => item.MatchId == matchId.Value);
            }

            var listings = await query
                .OrderBy(item => item.MatchId)
                .ThenBy(item => item.UnitPrice)
                .Select(item => new
                {
                    item.Id,
                    item.MatchId,
                    Match = item.Match.HomeTeam.Name + " vs " + item.Match.AwayTeam.Name,
                    item.StadiumSectionId,
                    Section = item.StadiumSection.Code,
                    item.Title,
                    item.RowLabel,
                    item.SellerName,
                    item.TicketType,
                    item.UnitPrice,
                    item.AvailableQuantity,
                    item.DeliveryMethod,
                    item.IsVerified
                })
                .ToListAsync();

            return Ok(listings);
        }

        [HttpPost("tickets")]
        public async Task<IActionResult> CreateTicketListing([FromBody] SaveTicketListingDto dto)
        {
            var validation = await ValidateTicketListingDto(dto);
            if (validation != null)
            {
                return validation;
            }

            var listing = new TicketListing();
            ApplyTicketListing(listing, dto);

            _dbContext.TicketListings.Add(listing);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTicketListings), new { id = listing.Id }, listing);
        }

        [HttpPut("tickets/{id:int}")]
        public async Task<IActionResult> UpdateTicketListing(int id, [FromBody] SaveTicketListingDto dto)
        {
            var listing = await _dbContext.TicketListings.FindAsync(id);
            if (listing == null)
            {
                return NotFound(new { message = "Ticket listing not found" });
            }

            var validation = await ValidateTicketListingDto(dto);
            if (validation != null)
            {
                return validation;
            }

            ApplyTicketListing(listing, dto);
            await _dbContext.SaveChangesAsync();

            return Ok(listing);
        }

        [HttpDelete("tickets/{id:int}")]
        public async Task<IActionResult> DeleteTicketListing(int id)
        {
            var listing = await _dbContext.TicketListings.FindAsync(id);
            if (listing == null)
            {
                return NotFound(new { message = "Ticket listing not found" });
            }

            _dbContext.TicketListings.Remove(listing);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders([FromQuery] string? status = null)
        {
            var query = _dbContext.TicketOrders
                .Include(item => item.User)
                .Include(item => item.Items)
                .Include(item => item.Payments)
                .Include(item => item.ETickets)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(item => item.Status == status);
            }

            var orders = await query
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new
                {
                    item.Id,
                    item.UserId,
                    UserName = item.User.UserName,
                    item.CreatedAt,
                    item.TotalAmount,
                    item.Status,
                    item.CustomerName,
                    item.CustomerEmail,
                    item.CustomerPhone,
                    ItemCount = item.Items.Count,
                    PaymentStatus = item.Payments
                        .OrderByDescending(payment => payment.CreatedAt)
                        .Select(payment => payment.Status)
                        .FirstOrDefault(),
                    ETicketCount = item.ETickets.Count
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("orders/{id:int}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _dbContext.TicketOrders
                .Include(item => item.User)
                .Include(item => item.Items)
                    .ThenInclude(item => item.TicketListing)
                    .ThenInclude(item => item.Match)
                .Include(item => item.Payments)
                .Include(item => item.ETickets)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            return Ok(new
            {
                order.Id,
                order.UserId,
                UserName = order.User.UserName,
                order.CreatedAt,
                order.TotalAmount,
                order.Status,
                order.CustomerName,
                order.CustomerEmail,
                order.CustomerPhone,
                order.Note,
                Items = order.Items.Select(item => new
                {
                    item.Id,
                    item.TicketListingId,
                    item.Quantity,
                    item.UnitPrice,
                    item.TicketListing.Title,
                    MatchSlug = item.TicketListing.Match.Slug
                }),
                Payments = order.Payments.Select(item => new
                {
                    item.Id,
                    item.PaymentCode,
                    item.Method,
                    item.Provider,
                    item.Status,
                    item.Amount,
                    item.TransactionId,
                    item.CreatedAt,
                    item.PaidAt
                }),
                ETickets = order.ETickets.Select(item => new
                {
                    item.Id,
                    item.TicketCode,
                    item.QrCodePayload,
                    item.HolderName,
                    item.Status,
                    item.IssuedAt,
                    item.UsedAt
                })
            });
        }

        [HttpPut("orders/{id:int}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _dbContext.TicketOrders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            if (string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest(new { message = "Status is required" });
            }

            order.Status = dto.Status.Trim();
            await _dbContext.SaveChangesAsync();

            return Ok(new { order.Id, order.Status });
        }

        private async Task<IActionResult?> ValidateMatchDto(SaveMatchDto dto, int? currentId = null)
        {
            if (string.IsNullOrWhiteSpace(dto.Slug))
            {
                return BadRequest(new { message = "Slug is required" });
            }

            if (dto.HomeTeamId == dto.AwayTeamId)
            {
                return BadRequest(new { message = "Home team and away team must be different" });
            }

            var teamIds = new[] { dto.HomeTeamId, dto.AwayTeamId };
            var teamCount = await _dbContext.Teams.CountAsync(item => teamIds.Contains(item.Id));
            if (teamCount != 2)
            {
                return BadRequest(new { message = "Home team or away team not found" });
            }

            if (!await _dbContext.Stadiums.AnyAsync(item => item.Id == dto.StadiumId))
            {
                return BadRequest(new { message = "Stadium not found" });
            }

            var slugExists = await _dbContext.Matches
                .AnyAsync(item => item.Slug == dto.Slug.Trim() && (!currentId.HasValue || item.Id != currentId.Value));

            if (slugExists)
            {
                return Conflict(new { message = "Match slug already exists" });
            }

            return null;
        }

        private async Task<IActionResult?> ValidateTicketListingDto(SaveTicketListingDto dto)
        {
            if (!await _dbContext.Matches.AnyAsync(item => item.Id == dto.MatchId))
            {
                return BadRequest(new { message = "Match not found" });
            }

            if (!await _dbContext.StadiumSections.AnyAsync(item => item.Id == dto.StadiumSectionId))
            {
                return BadRequest(new { message = "Stadium section not found" });
            }

            if (dto.UnitPrice < 0 || dto.AvailableQuantity < 0)
            {
                return BadRequest(new { message = "Price and quantity must not be negative" });
            }

            return null;
        }

        private static void ApplyStadium(Stadium stadium, SaveStadiumDto dto)
        {
            stadium.Name = dto.Name?.Trim() ?? "";
            stadium.City = dto.City?.Trim() ?? "";
            stadium.Country = dto.Country?.Trim() ?? "";
            stadium.Capacity = dto.Capacity;
            stadium.ImageUrl = dto.ImageUrl?.Trim() ?? "";
        }

        private static void ApplySection(StadiumSection section, SaveSectionDto dto)
        {
            section.Code = dto.Code?.Trim() ?? "";
            section.Name = dto.Name?.Trim() ?? "";
            section.Tier = string.IsNullOrWhiteSpace(dto.Tier) ? "standard" : dto.Tier.Trim();
            section.Capacity = dto.Capacity;
            section.BasePrice = dto.BasePrice;
            section.MapX = dto.MapX;
            section.MapY = dto.MapY;
            section.MapWidth = dto.MapWidth;
            section.MapHeight = dto.MapHeight;
        }

        private static void ApplyTicketListing(TicketListing listing, SaveTicketListingDto dto)
        {
            listing.MatchId = dto.MatchId;
            listing.StadiumSectionId = dto.StadiumSectionId;
            listing.Title = dto.Title?.Trim() ?? "";
            listing.RowLabel = dto.RowLabel?.Trim() ?? "";
            listing.SellerName = dto.SellerName?.Trim() ?? "";
            listing.TicketType = string.IsNullOrWhiteSpace(dto.TicketType) ? "standard" : dto.TicketType.Trim();
            listing.UnitPrice = dto.UnitPrice;
            listing.AvailableQuantity = dto.AvailableQuantity;
            listing.DeliveryMethod = string.IsNullOrWhiteSpace(dto.DeliveryMethod) ? "Mobile Tickets" : dto.DeliveryMethod.Trim();
            listing.IsVerified = dto.IsVerified;
        }
    }

    public class SaveMatchDto
    {
        public string Slug { get; set; } = "";
        public string? Competition { get; set; }
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        public int StadiumId { get; set; }
        public DateTime KickoffTime { get; set; }
        public string? Status { get; set; }
        public bool IsFeatured { get; set; }
    }

    public class SaveStadiumDto
    {
        public string? Name { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public int Capacity { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class SaveSectionDto
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Tier { get; set; }
        public int Capacity { get; set; }
        public decimal BasePrice { get; set; }
        public decimal MapX { get; set; }
        public decimal MapY { get; set; }
        public decimal MapWidth { get; set; }
        public decimal MapHeight { get; set; }
    }

    public class SaveTicketListingDto
    {
        public int MatchId { get; set; }
        public int StadiumSectionId { get; set; }
        public string? Title { get; set; }
        public string? RowLabel { get; set; }
        public string? SellerName { get; set; }
        public string? TicketType { get; set; }
        public decimal UnitPrice { get; set; }
        public int AvailableQuantity { get; set; }
        public string? DeliveryMethod { get; set; }
        public bool IsVerified { get; set; } = true;
    }

    public class UpdateOrderStatusDto
    {
        public string? Status { get; set; }
    }
}
