namespace BaseCore.Entities
{
    public class MatchSeatInventory
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int SeatPlaceId { get; set; }
        public int TicketListingId { get; set; }
        public string Status { get; set; } = "Available";
        public DateTime? HoldExpiresAt { get; set; }
        public string? HeldByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public FootballMatch Match { get; set; }
        public SeatPlace SeatPlace { get; set; }
        public TicketListing TicketListing { get; set; }
        public User? HeldByUser { get; set; }
    }
}
