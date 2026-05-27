using BaseCore.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/news")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly SqlServerDbContext _dbContext;

        public NewsController(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool featuredOnly = false)
        {
            var query = _dbContext.NewsArticles.AsNoTracking().AsQueryable();

            if (featuredOnly)
            {
                query = query.Where(article => article.IsFeatured);
            }

            var articles = await query
                .OrderByDescending(article => article.PublishedAt)
                .Select(article => new
                {
                    article.Id,
                    article.Slug,
                    article.Title,
                    article.Summary,
                    article.ImageUrl,
                    article.Category,
                    article.Season,
                    article.PublishedAt,
                    article.IsFeatured
                })
                .ToListAsync();

            return Ok(articles);
        }
    }
}
