namespace BaseCore.Entities
{
    public class StadiumSection
    {
        public int Id { get; set; }
        public int StadiumId { get; set; }
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public string Tier { get; set; } = "standard";
        public int Capacity { get; set; }
        public decimal BasePrice { get; set; }
        public decimal MapX { get; set; }
        public decimal MapY { get; set; }
        public decimal MapWidth { get; set; }
        public decimal MapHeight { get; set; }

        public Stadium Stadium { get; set; }
        public List<SeatBlock> SeatBlocks { get; set; } = new();
        public List<TicketListing> TicketListings { get; set; } = new();
        public List<SeatPlace> SeatPlaces { get; set; } = new();
    }
}
