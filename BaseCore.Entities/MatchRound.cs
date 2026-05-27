namespace BaseCore.Entities
{
    public class MatchRound
    {
        public int Id { get; set; }
        public int SeasonId { get; set; }
        public int RoundNumber { get; set; }
        public string Name { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Season Season { get; set; }
        public List<FootballMatch> Matches { get; set; } = new();
    }
}
