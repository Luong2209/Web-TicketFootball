using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository
{
    /// <summary>
    /// Entity Framework Core DbContext for SQL Server
    /// Used for teaching EF Core concepts (Bài 10)
    /// </summary>
    public class SqlServerDbContext : DbContext
    {
        public SqlServerDbContext(DbContextOptions<SqlServerDbContext> options) : base(options)
        {
        }

        // DbSet for each entity
        public DbSet<User> Users { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Stadium> Stadiums { get; set; }
        public DbSet<StadiumSection> StadiumSections { get; set; }
        public DbSet<FootballMatch> Matches { get; set; }
        public DbSet<TicketListing> TicketListings { get; set; }
        public DbSet<TicketOrder> TicketOrders { get; set; }
        public DbSet<TicketOrderItem> TicketOrderItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ETicket> ETickets { get; set; }
        public DbSet<TicketCheckin> TicketCheckins { get; set; }
        public DbSet<NewsArticle> NewsArticles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                //entity.HasKey(e => e.Guid);
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Password).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.HasIndex(e => e.UserName).IsUnique();
            });

            modelBuilder.Entity<Team>(entity =>
            {
                entity.ToTable("Clubs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.City).HasMaxLength(80);
                entity.Property(e => e.Country).HasMaxLength(80);
                entity.Property(e => e.LogoUrl).HasMaxLength(500);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<Stadium>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(160).IsRequired();
                entity.Property(e => e.City).HasMaxLength(80);
                entity.Property(e => e.Country).HasMaxLength(80);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
            });

            modelBuilder.Entity<StadiumSection>(entity =>
            {
                entity.ToTable("Seats");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Code).HasMaxLength(30).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Tier).HasMaxLength(40).IsRequired();
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);
                entity.Property(e => e.MapX).HasPrecision(6, 2);
                entity.Property(e => e.MapY).HasPrecision(6, 2);
                entity.Property(e => e.MapWidth).HasPrecision(6, 2);
                entity.Property(e => e.MapHeight).HasPrecision(6, 2);
                entity.HasIndex(e => new { e.StadiumId, e.Code }).IsUnique();
                entity.HasOne(e => e.Stadium)
                      .WithMany(s => s.Sections)
                      .HasForeignKey(e => e.StadiumId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<FootballMatch>(entity =>
            {
                entity.ToTable("Matches");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Slug).HasMaxLength(160).IsRequired();
                entity.Property(e => e.Competition).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasOne(e => e.HomeTeam)
                      .WithMany()
                      .HasForeignKey(e => e.HomeTeamId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.AwayTeam)
                      .WithMany()
                      .HasForeignKey(e => e.AwayTeamId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Stadium)
                      .WithMany()
                      .HasForeignKey(e => e.StadiumId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketListing>(entity =>
            {
                entity.ToTable("Tickets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(160).IsRequired();
                entity.Property(e => e.RowLabel).HasMaxLength(80);
                entity.Property(e => e.SellerName).HasMaxLength(160);
                entity.Property(e => e.TicketType).HasMaxLength(40);
                entity.Property(e => e.DeliveryMethod).HasMaxLength(80);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.HasOne(e => e.Match)
                      .WithMany(m => m.TicketListings)
                      .HasForeignKey(e => e.MatchId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.StadiumSection)
                      .WithMany(s => s.TicketListings)
                      .HasForeignKey(e => e.StadiumSectionId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketOrder>(entity =>
            {
                entity.ToTable("Orders");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.Property(e => e.CustomerName).HasMaxLength(120);
                entity.Property(e => e.CustomerEmail).HasMaxLength(160);
                entity.Property(e => e.CustomerPhone).HasMaxLength(40);
                entity.Property(e => e.Note).HasMaxLength(500);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketOrderItem>(entity =>
            {
                entity.ToTable("OrderItems");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.HasOne(e => e.TicketOrder)
                      .WithMany(o => o.Items)
                      .HasForeignKey(e => e.TicketOrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.TicketListing)
                      .WithMany(l => l.TicketOrderItems)
                      .HasForeignKey(e => e.TicketListingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.HasIndex(e => new { e.UserId, e.Status });
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.HasIndex(e => new { e.CartId, e.TicketListingId }).IsUnique();
                entity.HasOne(e => e.Cart)
                      .WithMany(c => c.Items)
                      .HasForeignKey(e => e.CartId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.TicketListing)
                      .WithMany(l => l.CartItems)
                      .HasForeignKey(e => e.TicketListingId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PaymentCode).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Method).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Provider).HasMaxLength(80);
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.TransactionId).HasMaxLength(120);
                entity.HasIndex(e => e.PaymentCode).IsUnique();
                entity.HasOne(e => e.TicketOrder)
                      .WithMany(o => o.Payments)
                      .HasForeignKey(e => e.TicketOrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ETicket>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.TicketCode).HasMaxLength(80).IsRequired();
                entity.Property(e => e.QrCodePayload).HasMaxLength(1000).IsRequired();
                entity.Property(e => e.HolderName).HasMaxLength(120);
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.HasIndex(e => e.TicketCode).IsUnique();
                entity.HasOne(e => e.TicketOrder)
                      .WithMany(o => o.ETickets)
                      .HasForeignKey(e => e.TicketOrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.TicketOrderItem)
                      .WithMany(i => i.ETickets)
                      .HasForeignKey(e => e.TicketOrderItemId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketCheckin>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CheckinCode).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Gate).HasMaxLength(40);
                entity.Property(e => e.DeviceId).HasMaxLength(120);
                entity.Property(e => e.CheckedByUserId).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(40).IsRequired();
                entity.Property(e => e.Note).HasMaxLength(500);
                entity.HasIndex(e => e.CheckinCode).IsUnique();
                entity.HasOne(e => e.ETicket)
                      .WithMany(t => t.Checkins)
                      .HasForeignKey(e => e.ETicketId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CheckedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.CheckedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<NewsArticle>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Slug).HasMaxLength(180).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(220).IsRequired();
                entity.Property(e => e.Summary).HasMaxLength(1000);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.Category).HasMaxLength(80);
                entity.Property(e => e.Season).HasMaxLength(40);
                entity.HasIndex(e => e.Slug).IsUnique();
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Admin User
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = "11111111-1111-1111-1111-111111111111",
                    UserName = "admin",
                    Password = "admin123",
                    Salt = Array.Empty<byte>(),
                    Name = "Administrator",
                    Email = "admin@robotvibot.com",
                    Phone = "0123456789",
                    Position = "System Administrator",
                    Contact = "",
                    Image = "",
                    IsActive = true,
                    UserType = 1,
                    Created = new DateTime(2026, 1, 1)
                },
                new User
                {
                    Id = "22222222-2222-2222-2222-222222222222",
                    UserName = "user",
                    Password = "user123",
                    Salt = Array.Empty<byte>(),
                    Name = "Default User",
                    Email = "user@basecore.local",
                    Phone = "0987654321",
                    Position = "Customer",
                    Contact = "",
                    Image = "",
                    IsActive = true,
                    UserType = 0,
                    Created = new DateTime(2026, 1, 1)
                }
            );

            SeedTicketData(modelBuilder);
        }

        private void SeedTicketData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Team>().HasData(
                new Team { Id = 1, Name = "Manchester United", City = "Manchester", Country = "England", LogoUrl = "/template-football/images/epl-teams/ImageLoGo/Manchester-United-FC-logo.png" },
                new Team { Id = 2, Name = "Liverpool", City = "Liverpool", Country = "England", LogoUrl = "/template-football/images/epl-teams/ImageLoGo/Liverpool-FC-logo.png" },
                new Team { Id = 3, Name = "Arsenal", City = "London", Country = "England", LogoUrl = "/template-football/images/epl-teams/ImageLoGo/Arsenal-FC-logo.png" },
                new Team { Id = 4, Name = "Chelsea", City = "London", Country = "England", LogoUrl = "/template-football/images/epl-teams/ImageLoGo/Chelsea-FC-logo.png" },
                new Team { Id = 5, Name = "Manchester City", City = "Manchester", Country = "England", LogoUrl = "/template-football/images/epl-teams/ImageLoGo/Manchester-City-FC-logo.png" },
                new Team { Id = 6, Name = "Tottenham Hotspur", City = "London", Country = "England", LogoUrl = "/template-football/images/epl-teams/ImageLoGo/Tottenham-Hotspur-logo.png" }
            );

            modelBuilder.Entity<Stadium>().HasData(
                new Stadium { Id = 1, Name = "Old Trafford", City = "Manchester", Country = "England", Capacity = 74310, ImageUrl = "/template-football/images/alessio-festa-_ElVbiXREBM-unsplash.jpg" },
                new Stadium { Id = 2, Name = "Emirates Stadium", City = "London", Country = "England", Capacity = 60704, ImageUrl = "/template-football/images/william-hadley-JytQXLPXpNM-unsplash.jpg" },
                new Stadium { Id = 3, Name = "Etihad Stadium", City = "Manchester", Country = "England", Capacity = 53400, ImageUrl = "/template-football/images/james-kirkup-LbT_j62t94U-unsplash.jpg" }
            );

            modelBuilder.Entity<StadiumSection>().HasData(
                new StadiumSection { Id = 1, StadiumId = 1, Code = "E335", Name = "East Stand E335", Tier = "standard", Capacity = 120, BasePrice = 590, MapX = 91, MapY = 44, MapWidth = 8, MapHeight = 8 },
                new StadiumSection { Id = 2, StadiumId = 1, Code = "E132", Name = "Away Section E132", Tier = "away", Capacity = 90, BasePrice = 632, MapX = 82, MapY = 86, MapWidth = 8, MapHeight = 8 },
                new StadiumSection { Id = 3, StadiumId = 1, Code = "N1405", Name = "North Stand N1405", Tier = "best", Capacity = 100, BasePrice = 1050, MapX = 83, MapY = 32, MapWidth = 7, MapHeight = 10 },
                new StadiumSection { Id = 4, StadiumId = 1, Code = "N3406", Name = "VIP Hospitality N3406", Tier = "vip", Capacity = 48, BasePrice = 3795, MapX = 45, MapY = 12, MapWidth = 7, MapHeight = 10 },
                new StadiumSection { Id = 5, StadiumId = 1, Code = "S221", Name = "South VIP Box S221", Tier = "vip", Capacity = 24, BasePrice = 8000, MapX = 42, MapY = 94, MapWidth = 7, MapHeight = 6 }
            );

            modelBuilder.Entity<FootballMatch>().HasData(
                new FootballMatch { Id = 1, Slug = "man-utd-liverpool", Competition = "Premier League", HomeTeamId = 1, AwayTeamId = 2, StadiumId = 1, KickoffTime = new DateTime(2026, 5, 3, 15, 30, 0), Status = "Scheduled", IsFeatured = true },
                new FootballMatch { Id = 2, Slug = "arsenal-chelsea", Competition = "Premier League", HomeTeamId = 3, AwayTeamId = 4, StadiumId = 2, KickoffTime = new DateTime(2026, 5, 10, 18, 0, 0), Status = "Scheduled", IsFeatured = true },
                new FootballMatch { Id = 3, Slug = "man-city-tottenham", Competition = "Premier League", HomeTeamId = 5, AwayTeamId = 6, StadiumId = 3, KickoffTime = new DateTime(2026, 5, 17, 16, 30, 0), Status = "Scheduled", IsFeatured = true }
            );

            modelBuilder.Entity<TicketListing>().HasData(
                new TicketListing { Id = 1, MatchId = 1, StadiumSectionId = 1, Title = "E335", RowLabel = "Row 7", SellerName = "Club Ticket Office", TicketType = "standard", UnitPrice = 590, AvailableQuantity = 36 },
                new TicketListing { Id = 2, MatchId = 1, StadiumSectionId = 2, Title = "Away Section", RowLabel = "Block E132", SellerName = "Club Ticket Office", TicketType = "away", UnitPrice = 632, AvailableQuantity = 24 },
                new TicketListing { Id = 3, MatchId = 1, StadiumSectionId = 3, Title = "N1405", RowLabel = "Lower Tier", SellerName = "Seat Market", TicketType = "best", UnitPrice = 1050, AvailableQuantity = 28 },
                new TicketListing { Id = 4, MatchId = 1, StadiumSectionId = 4, Title = "N3406 VIP", RowLabel = "Hospitality", SellerName = "Club Partner", TicketType = "vip", UnitPrice = 3795, AvailableQuantity = 12 },
                new TicketListing { Id = 5, MatchId = 1, StadiumSectionId = 5, Title = "S221 VIP Box", RowLabel = "Director Seats", SellerName = "Hospitality Direct", TicketType = "vip", UnitPrice = 8000, AvailableQuantity = 8 }
            );

            modelBuilder.Entity<NewsArticle>().HasData(
                new NewsArticle { Id = 1, Slug = "newcastle-vs-brighton-team-news-live", ImageUrl = "/template-football/images/news-newcastle-brighton.webp", Title = "Newcastle vs Brighton team news LIVE!", Summary = "Live updates and team news as Newcastle prepare to face Brighton in a key Premier League match.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 1, 9, 0, 0) },
                new NewsArticle { Id = 2, Slug = "brentford-vs-west-ham-team-news-live", ImageUrl = "/template-football/images/news-brentford-west-ham.webp", Title = "Brentford vs West Ham team news LIVE!", Summary = "Follow the latest lineup updates before Brentford meet West Ham in London.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 1, 10, 0, 0) },
                new NewsArticle { Id = 3, Slug = "arsenal-warrior-spirit-fatigue", ImageUrl = "/template-football/images/news-arsenal-fatigue.jpg", Title = "Arsenal summoning warrior spirit in fight against fatigue", Summary = "Arsenal look for resilience and rotation as a demanding run tests their squad depth.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 2, 9, 0, 0) },
                new NewsArticle { Id = 4, Slug = "carrick-man-utd-liverpool-favourites", ImageUrl = "/template-football/images/news-carrick-liverpool.jpg", Title = "Carrick: Man Utd games vs Liverpool some of my favourites", Summary = "The former midfielder reflects on the intensity, history and emotion of the fixture.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 2, 11, 0, 0) },
                new NewsArticle { Id = 5, Slug = "fernandes-chasing-de-bruyne-henry-record", ImageUrl = "/template-football/images/news-fernandes-radar.jpg", Title = "Fernandes chasing down De Bruyne and Henry record", Summary = "Bruno Fernandes continues to climb the Premier League creative charts with another standout season.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 3, 9, 0, 0) },
                new NewsArticle { Id = 6, Slug = "neville-man-utd-liverpool-carrick-slot", ImageUrl = "/template-football/images/news-neville-slot-carrick.jpg", Title = "Neville: Man Utd vs Liverpool huge for Carrick and Slot", Summary = "The rivalry returns with major pressure on both dugouts as the season reaches a decisive stage.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 3, 12, 0, 0) },
                new NewsArticle { Id = 7, Slug = "leeds-burnley-nine-point-gap", ImageUrl = "/template-football/images/news-2-2-368x287.jpg", Title = "Leeds as good as safe? Thumping Burnley win opens nine-point gap to drop", Summary = "Leeds strengthen their survival hopes with a commanding result against a direct rival.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 4, 9, 0, 0) },
                new NewsArticle { Id = 8, Slug = "mount-man-utd-title-challengers", ImageUrl = "/template-football/images/news-mount-man-utd.jpg", Title = "Mount expects Man Utd to be title challengers next season", Summary = "The midfielder believes United can take another step forward with a stronger campaign.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 4, 12, 0, 0) },
                new NewsArticle { Id = 9, Slug = "de-zerbi-spurs-negativity", ImageUrl = "/template-football/images/news-de-zerbi-spurs.jpg", Title = "'We're not relegated yet' - De Zerbi wants to end Spurs negativity", Summary = "De Zerbi calls for focus and belief as Spurs try to change the mood around their season.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 5, 9, 0, 0) },
                new NewsArticle { Id = 10, Slug = "chelsea-nottingham-forest-how-to-watch", ImageUrl = "/template-football/images/news-chelsea-forest-watch.jpg", Title = "How to watch Chelsea vs Nott'm Forest at 3pm on Monday", Summary = "Chelsea and Nottingham Forest meet in a key Premier League fixture on Monday afternoon.", Category = "Premier League", Season = "2025-2026", PublishedAt = new DateTime(2026, 5, 5, 12, 0, 0) }
            );
        }
    }
}
