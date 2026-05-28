namespace BaseCore.Entities
{
    public class Stadium
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public string Country { get; set; } = "";
        public int Capacity { get; set; }
        public string ImageUrl { get; set; } = "";

        public List<StadiumSection> Sections { get; set; } = new();
        public List<SeatBlock> SeatBlocks { get; set; } = new();
        public List<SeatPlace> SeatPlaces { get; set; } = new();
    }
}
