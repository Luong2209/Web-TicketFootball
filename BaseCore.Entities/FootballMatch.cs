namespace BaseCore.Entities
{
    public class FootballMatch
    {
        public int Id { get; set; }
        public string Slug { get; set; } = "";
        public string Competition { get; set; } = "Premier League";
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        public int StadiumId { get; set; }
        public int SeasonId { get; set; }
        public int RoundId { get; set; }
        public DateTime KickoffTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public bool IsFeatured { get; set; }

        public Team HomeTeam { get; set; }
        public Team AwayTeam { get; set; }
        public Stadium Stadium { get; set; }
        public Season Season { get; set; }
        public MatchRound Round { get; set; }
        public List<TicketListing> TicketListings { get; set; } = new();
    }
}
