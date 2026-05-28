using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Services
{
    public class SeatHoldService
    {
        private readonly SqlServerDbContext _dbContext;

        public SeatHoldService(SqlServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task ReleaseExpiredSeatHoldsAsync()
        {
            var now = DateTime.UtcNow;
            var expiredSeats = await _dbContext.MatchSeatInventories
                .Where(seat => seat.Status == "Held"
                    && seat.HoldExpiresAt.HasValue
                    && seat.HoldExpiresAt <= now)
                .ToListAsync();

            if (expiredSeats.Count == 0)
            {
                return;
            }

            foreach (var seat in expiredSeats)
            {
                seat.Status = "Available";
                seat.HeldByUserId = null;
                seat.HoldExpiresAt = null;
                seat.UpdatedAt = now;
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}
