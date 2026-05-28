namespace BaseCore.Entities
{
    public class SeatPlace
    {
        public int Id { get; set; }
        public int StadiumId { get; set; }
        public int StadiumSectionId { get; set; }
        public int? SeatBlockId { get; set; }
        public string RowLabel { get; set; } = "";
        public int SeatNumber { get; set; }
        public string Code { get; set; } = "";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Stadium Stadium { get; set; }
        public StadiumSection StadiumSection { get; set; }
        public SeatBlock? SeatBlock { get; set; }
        public List<MatchSeatInventory> MatchSeatInventories { get; set; } = new();
        public List<TicketOrderSeat> TicketOrderSeats { get; set; } = new();
    }
}
