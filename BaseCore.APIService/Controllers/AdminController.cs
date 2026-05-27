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
                .Include(item => item.Season)
                .Include(item => item.Round)
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
                    item.SeasonId,
                    Season = item.Season.Name,
                    item.RoundId,
                    RoundNumber = item.Round.RoundNumber,
                    RoundName = item.Round.Name,
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
            var resolved = await ResolveMatchSeasonRound(dto);
            if (resolved.Result != null)
            {
                return resolved.Result;
            }

            var validation = await ValidateMatchDto(dto, resolved.SeasonId, resolved.RoundId);
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
                SeasonId = resolved.SeasonId,
                RoundId = resolved.RoundId,
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

            var resolved = await ResolveMatchSeasonRound(dto);
            if (resolved.Result != null)
            {
                return resolved.Result;
            }

            var validation = await ValidateMatchDto(dto, resolved.SeasonId, resolved.RoundId, id);
            if (validation != null)
            {
                return validation;
            }

            match.Slug = dto.Slug.Trim();
            match.Competition = dto.Competition?.Trim() ?? "Premier League";
            match.HomeTeamId = dto.HomeTeamId;
            match.AwayTeamId = dto.AwayTeamId;
            match.StadiumId = dto.StadiumId;
            match.SeasonId = resolved.SeasonId;
            match.RoundId = resolved.RoundId;
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

        [HttpGet("seasons")]
        public async Task<IActionResult> GetSeasons()
        {
            var seasons = await _dbContext.Seasons
                .Include(item => item.Rounds)
                .AsNoTracking()
                .OrderByDescending(item => item.StartDate)
                .Select(item => new
                {
                    item.Id,
                    item.Name,
                    item.StartDate,
                    item.EndDate,
                    item.IsActive,
                    item.CreatedAt,
                    item.UpdatedAt,
                    RoundCount = item.Rounds.Count
                })
                .ToListAsync();

            return Ok(seasons);
        }

        [HttpPost("seasons")]
        public async Task<IActionResult> CreateSeason([FromBody] SaveSeasonDto dto)
        {
            var validation = await ValidateSeasonDto(dto);
            if (validation != null)
            {
                return validation;
            }

            var season = new Season
            {
                Name = dto.Name.Trim(),
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Seasons.Add(season);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSeasons), new { id = season.Id }, season);
        }

        [HttpPut("seasons/{id:int}")]
        public async Task<IActionResult> UpdateSeason(int id, [FromBody] SaveSeasonDto dto)
        {
            var season = await _dbContext.Seasons.FindAsync(id);
            if (season == null)
            {
                return NotFound(new { message = "Season not found" });
            }

            var validation = await ValidateSeasonDto(dto, id);
            if (validation != null)
            {
                return validation;
            }

            season.Name = dto.Name.Trim();
            season.StartDate = dto.StartDate;
            season.EndDate = dto.EndDate;
            season.IsActive = dto.IsActive;
            season.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return Ok(season);
        }

        [HttpGet("rounds")]
        public async Task<IActionResult> GetRounds([FromQuery] int? seasonId = null, [FromQuery] string? season = null)
        {
            var query = _dbContext.MatchRounds
                .Include(item => item.Season)
                .Include(item => item.Matches)
                .AsNoTracking()
                .AsQueryable();

            if (seasonId.HasValue)
            {
                query = query.Where(item => item.SeasonId == seasonId.Value);
            }

            if (!string.IsNullOrWhiteSpace(season))
            {
                var normalizedSeason = season.Trim();
                query = query.Where(item => item.Season.Name == normalizedSeason);
            }

            var rounds = await query
                .OrderBy(item => item.Season.Name)
                .ThenBy(item => item.RoundNumber)
                .Select(item => new
                {
                    item.Id,
                    item.SeasonId,
                    Season = item.Season.Name,
                    item.RoundNumber,
                    item.Name,
                    item.StartDate,
                    item.EndDate,
                    item.CreatedAt,
                    item.UpdatedAt,
                    MatchCount = item.Matches.Count
                })
                .ToListAsync();

            return Ok(rounds);
        }

        [HttpGet("clubs")]
        public async Task<IActionResult> GetClubs()
        {
            var clubs = await _dbContext.Teams
                .AsNoTracking()
                .OrderBy(item => item.Name)
                .Select(item => new
                {
                    item.Id,
                    item.Name,
                    item.City,
                    item.Country,
                    item.LogoUrl,
                    item.IsActive
                })
                .ToListAsync();

            return Ok(clubs);
        }

        [HttpPost("rounds")]
        public async Task<IActionResult> CreateRound([FromBody] SaveMatchRoundDto dto)
        {
            var validation = await ValidateRoundDto(dto);
            if (validation != null)
            {
                return validation;
            }

            var round = new MatchRound
            {
                SeasonId = dto.SeasonId,
                RoundNumber = dto.RoundNumber,
                Name = string.IsNullOrWhiteSpace(dto.Name) ? $"Vòng {dto.RoundNumber}" : dto.Name.Trim(),
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.MatchRounds.Add(round);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRounds), new { id = round.Id }, round);
        }

        [HttpPut("rounds/{id:int}")]
        public async Task<IActionResult> UpdateRound(int id, [FromBody] SaveMatchRoundDto dto)
        {
            var round = await _dbContext.MatchRounds.FindAsync(id);
            if (round == null)
            {
                return NotFound(new { message = "Round not found" });
            }

            var validation = await ValidateRoundDto(dto, id);
            if (validation != null)
            {
                return validation;
            }

            round.SeasonId = dto.SeasonId;
            round.RoundNumber = dto.RoundNumber;
            round.Name = string.IsNullOrWhiteSpace(dto.Name) ? $"Vòng {dto.RoundNumber}" : dto.Name.Trim();
            round.StartDate = dto.StartDate;
            round.EndDate = dto.EndDate;
            round.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return Ok(round);
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

        private async Task<(int SeasonId, int RoundId, IActionResult? Result)> ResolveMatchSeasonRound(SaveMatchDto dto)
        {
            var seasonId = dto.SeasonId;
            var roundId = dto.RoundId;

            if (seasonId <= 0)
            {
                seasonId = await _dbContext.Seasons
                    .Where(item => item.IsActive)
                    .OrderByDescending(item => item.StartDate)
                    .Select(item => item.Id)
                    .FirstOrDefaultAsync();
            }

            if (seasonId <= 0)
            {
                return (0, 0, BadRequest(new { message = "Season is required" }));
            }

            if (roundId <= 0)
            {
                roundId = await _dbContext.MatchRounds
                    .Where(item => item.SeasonId == seasonId)
                    .OrderBy(item => item.RoundNumber)
                    .Select(item => item.Id)
                    .FirstOrDefaultAsync();
            }

            if (roundId <= 0)
            {
                return (seasonId, 0, BadRequest(new { message = "Round is required" }));
            }

            return (seasonId, roundId, null);
        }

        private async Task<IActionResult?> ValidateMatchDto(SaveMatchDto dto, int seasonId, int roundId, int? currentId = null)
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

            if (!await _dbContext.Seasons.AnyAsync(item => item.Id == seasonId))
            {
                return BadRequest(new { message = "Season not found" });
            }

            var round = await _dbContext.MatchRounds
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == roundId);

            if (round == null)
            {
                return BadRequest(new { message = "Round not found" });
            }

            if (round.SeasonId != seasonId)
            {
                return BadRequest(new { message = "Round must belong to selected season" });
            }

            var slugExists = await _dbContext.Matches
                .AnyAsync(item => item.Slug == dto.Slug.Trim() && (!currentId.HasValue || item.Id != currentId.Value));

            if (slugExists)
            {
                return Conflict(new { message = "Match slug already exists" });
            }

            var roundMatchCount = await _dbContext.Matches
                .CountAsync(item => item.RoundId == roundId && (!currentId.HasValue || item.Id != currentId.Value));

            if (roundMatchCount >= 10)
            {
                return Conflict(new { message = "Round already has the maximum 10 matches" });
            }

            var teamAlreadyInRound = await _dbContext.Matches
                .AnyAsync(item => item.RoundId == roundId
                    && (!currentId.HasValue || item.Id != currentId.Value)
                    && (item.HomeTeamId == dto.HomeTeamId
                        || item.AwayTeamId == dto.HomeTeamId
                        || item.HomeTeamId == dto.AwayTeamId
                        || item.AwayTeamId == dto.AwayTeamId));

            if (teamAlreadyInRound)
            {
                return Conflict(new { message = "A team can only appear once in the same round" });
            }

            return null;
        }

        private async Task<IActionResult?> ValidateSeasonDto(SaveSeasonDto dto, int? currentId = null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Season name is required" });
            }

            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest(new { message = "Season end date must be after start date" });
            }

            var exists = await _dbContext.Seasons
                .AnyAsync(item => item.Name == dto.Name.Trim() && (!currentId.HasValue || item.Id != currentId.Value));

            if (exists)
            {
                return Conflict(new { message = "Season already exists" });
            }

            return null;
        }

        private async Task<IActionResult?> ValidateRoundDto(SaveMatchRoundDto dto, int? currentId = null)
        {
            if (dto.SeasonId <= 0 || !await _dbContext.Seasons.AnyAsync(item => item.Id == dto.SeasonId))
            {
                return BadRequest(new { message = "Season not found" });
            }

            if (dto.RoundNumber <= 0)
            {
                return BadRequest(new { message = "Round number must be greater than zero" });
            }

            if (dto.EndDate <= dto.StartDate)
            {
                return BadRequest(new { message = "Round end date must be after start date" });
            }

            var exists = await _dbContext.MatchRounds
                .AnyAsync(item => item.SeasonId == dto.SeasonId
                    && item.RoundNumber == dto.RoundNumber
                    && (!currentId.HasValue || item.Id != currentId.Value));

            if (exists)
            {
                return Conflict(new { message = "Round number already exists in this season" });
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
        public int SeasonId { get; set; }
        public int RoundId { get; set; }
        public DateTime KickoffTime { get; set; }
        public string? Status { get; set; }
        public bool IsFeatured { get; set; }
    }

    public class SaveSeasonDto
    {
        public string Name { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class SaveMatchRoundDto
    {
        public int SeasonId { get; set; }
        public int RoundNumber { get; set; }
        public string? Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
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
