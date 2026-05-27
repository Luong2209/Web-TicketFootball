namespace BaseCore.Entities
{
    public class Season
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<MatchRound> Rounds { get; set; } = new();
        public List<FootballMatch> Matches { get; set; } = new();
    }
}
