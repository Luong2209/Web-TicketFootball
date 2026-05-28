namespace BaseCore.Entities
{
    public class SeatBlock
    {
        public int Id { get; set; }
        public int StadiumId { get; set; }
        public int StadiumSectionId { get; set; }
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Stadium Stadium { get; set; }
        public StadiumSection StadiumSection { get; set; }
        public List<SeatPlace> SeatPlaces { get; set; } = new();
    }
}
