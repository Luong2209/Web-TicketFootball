using BaseCore.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/matches")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;

        public MatchesController(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] bool featuredOnly = false,
            [FromQuery] string? season = null,
            [FromQuery] int? seasonId = null,
            [FromQuery] int? round = null,
            [FromQuery] int? roundId = null)
        {
            var query = _dbContext.Matches
                .Include(match => match.HomeTeam)
                .Include(match => match.AwayTeam)
                .Include(match => match.Stadium)
                .Include(match => match.Season)
                .Include(match => match.Round)
                .AsNoTracking()
                .AsQueryable();

            if (featuredOnly)
            {
                query = query.Where(match => match.IsFeatured);
            }

            if (seasonId.HasValue)
            {
                query = query.Where(match => match.SeasonId == seasonId.Value);
            }

            if (!string.IsNullOrWhiteSpace(season))
            {
                var normalizedSeason = season.Trim();
                query = query.Where(match => match.Season.Name == normalizedSeason);
            }

            if (roundId.HasValue)
            {
                query = query.Where(match => match.RoundId == roundId.Value);
            }

            if (round.HasValue)
            {
                query = query.Where(match => match.Round.RoundNumber == round.Value);
            }

            var matches = await query
                .OrderBy(match => match.KickoffTime)
                .Select(match => new
                {
                    match.Id,
                    match.Slug,
                    match.Competition,
                    match.SeasonId,
                    Season = match.Season.Name,
                    match.RoundId,
                    RoundNumber = match.Round.RoundNumber,
                    RoundName = match.Round.Name,
                    match.KickoffTime,
                    match.Status,
                    match.IsFeatured,
                    HomeTeam = new { match.HomeTeam.Id, match.HomeTeam.Name, match.HomeTeam.LogoUrl },
                    AwayTeam = new { match.AwayTeam.Id, match.AwayTeam.Name, match.AwayTeam.LogoUrl },
                    Stadium = new { match.Stadium.Id, match.Stadium.Name, match.Stadium.City, match.Stadium.Country }
                })
                .ToListAsync();

            return Ok(matches);
        }

        [HttpGet("rounds")]
        public async Task<IActionResult> GetRounds([FromQuery] string? season = null, [FromQuery] int? seasonId = null)
        {
            var query = _dbContext.MatchRounds
                .Include(round => round.Season)
                .Include(round => round.Matches)
                .AsNoTracking()
                .AsQueryable();

            if (seasonId.HasValue)
            {
                query = query.Where(round => round.SeasonId == seasonId.Value);
            }

            if (!string.IsNullOrWhiteSpace(season))
            {
                var normalizedSeason = season.Trim();
                query = query.Where(round => round.Season.Name == normalizedSeason);
            }

            var rounds = await query
                .OrderBy(round => round.Season.Name)
                .ThenBy(round => round.RoundNumber)
                .Select(round => new
                {
                    round.Id,
                    round.SeasonId,
                    Season = round.Season.Name,
                    round.RoundNumber,
                    round.Name,
                    round.StartDate,
                    round.EndDate,
                    MatchCount = round.Matches.Count
                })
                .ToListAsync();

            return Ok(rounds);
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var match = await _dbContext.Matches
                .Include(item => item.HomeTeam)
                .Include(item => item.AwayTeam)
                .Include(item => item.Stadium)
                .Include(item => item.Season)
                .Include(item => item.Round)
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Slug == slug);

            if (match == null)
            {
                return NotFound(new { message = "Match not found" });
            }

            return Ok(new
            {
                match.Id,
                match.Slug,
                match.Competition,
                match.SeasonId,
                Season = match.Season.Name,
                match.RoundId,
                RoundNumber = match.Round.RoundNumber,
                RoundName = match.Round.Name,
                match.KickoffTime,
                match.Status,
                HomeTeam = new { match.HomeTeam.Id, match.HomeTeam.Name, match.HomeTeam.LogoUrl },
                AwayTeam = new { match.AwayTeam.Id, match.AwayTeam.Name, match.AwayTeam.LogoUrl },
                Stadium = new { match.Stadium.Id, match.Stadium.Name, match.Stadium.City, match.Stadium.Country, match.Stadium.Capacity, match.Stadium.ImageUrl }
            });
        }

        [HttpGet("{slug}/tickets")]
        public async Task<IActionResult> GetTickets(string slug)
        {
            var match = await _dbContext.Matches
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Slug == slug);

            if (match == null)
            {
                return NotFound(new { message = "Match not found" });
            }

            var sections = await _dbContext.StadiumSections
                .Where(section => section.StadiumId == match.StadiumId)
                .AsNoTracking()
                .Select(section => new
                {
                    section.Id,
                    section.Code,
                    section.Name,
                    section.Tier,
                    section.Capacity,
                    section.BasePrice,
                    section.MapX,
                    section.MapY,
                    section.MapWidth,
                    section.MapHeight
                })
                .ToListAsync();

            var listings = await _dbContext.TicketListings
                .Include(listing => listing.StadiumSection)
                .Where(listing => listing.MatchId == match.Id && listing.AvailableQuantity > 0)
                .AsNoTracking()
                .OrderBy(listing => listing.UnitPrice)
                .Select(listing => new
                {
                    listing.Id,
                    listing.Title,
                    listing.RowLabel,
                    listing.SellerName,
                    listing.TicketType,
                    listing.UnitPrice,
                    listing.AvailableQuantity,
                    listing.DeliveryMethod,
                    listing.IsVerified,
                    Section = new
                    {
                        listing.StadiumSection.Id,
                        listing.StadiumSection.Code,
                        listing.StadiumSection.Name,
                        listing.StadiumSection.Tier
                    }
                })
                .ToListAsync();

            return Ok(new { sections, listings });
        }
    }
}
