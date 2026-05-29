using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddNewsArticles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NewsArticles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(220)", maxLength: 220, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Season = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsArticles", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "NewsArticles",
                columns: new[] { "Id", "Category", "ImageUrl", "IsFeatured", "PublishedAt", "Season", "Slug", "Summary", "Title" },
                values: new object[,]
                {
                    { 1, "Premier League", "/template-football/images/news-newcastle-brighton.webp", true, new DateTime(2026, 5, 1, 9, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "newcastle-vs-brighton-team-news-live", "Live updates and team news as Newcastle prepare to face Brighton in a key Premier League match.", "Newcastle vs Brighton team news LIVE!" },
                    { 2, "Premier League", "/template-football/images/news-brentford-west-ham.webp", true, new DateTime(2026, 5, 1, 10, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "brentford-vs-west-ham-team-news-live", "Follow the latest lineup updates before Brentford meet West Ham in London.", "Brentford vs West Ham team news LIVE!" },
                    { 3, "Premier League", "/template-football/images/news-arsenal-fatigue.jpg", true, new DateTime(2026, 5, 2, 9, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "arsenal-warrior-spirit-fatigue", "Arsenal look for resilience and rotation as a demanding run tests their squad depth.", "Arsenal summoning warrior spirit in fight against fatigue" },
                    { 4, "Premier League", "/template-football/images/news-carrick-liverpool.jpg", true, new DateTime(2026, 5, 2, 11, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "carrick-man-utd-liverpool-favourites", "The former midfielder reflects on the intensity, history and emotion of the fixture.", "Carrick: Man Utd games vs Liverpool some of my favourites" },
                    { 5, "Premier League", "/template-football/images/news-fernandes-radar.jpg", true, new DateTime(2026, 5, 3, 9, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "fernandes-chasing-de-bruyne-henry-record", "Bruno Fernandes continues to climb the Premier League creative charts with another standout season.", "Fernandes chasing down De Bruyne and Henry record" },
                    { 6, "Premier League", "/template-football/images/news-neville-slot-carrick.jpg", true, new DateTime(2026, 5, 3, 12, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "neville-man-utd-liverpool-carrick-slot", "The rivalry returns with major pressure on both dugouts as the season reaches a decisive stage.", "Neville: Man Utd vs Liverpool huge for Carrick and Slot" },
                    { 7, "Premier League", "/template-football/images/news-2-2-368x287.jpg", true, new DateTime(2026, 5, 4, 9, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "leeds-burnley-nine-point-gap", "Leeds strengthen their survival hopes with a commanding result against a direct rival.", "Leeds as good as safe? Thumping Burnley win opens nine-point gap to drop" },
                    { 8, "Premier League", "/template-football/images/news-mount-man-utd.jpg", true, new DateTime(2026, 5, 4, 12, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "mount-man-utd-title-challengers", "The midfielder believes United can take another step forward with a stronger campaign.", "Mount expects Man Utd to be title challengers next season" },
                    { 9, "Premier League", "/template-football/images/news-de-zerbi-spurs.jpg", true, new DateTime(2026, 5, 5, 9, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "de-zerbi-spurs-negativity", "De Zerbi calls for focus and belief as Spurs try to change the mood around their season.", "'We're not relegated yet' - De Zerbi wants to end Spurs negativity" },
                    { 10, "Premier League", "/template-football/images/news-chelsea-forest-watch.jpg", true, new DateTime(2026, 5, 5, 12, 0, 0, 0, DateTimeKind.Unspecified), "2025-2026", "chelsea-nottingham-forest-how-to-watch", "Chelsea and Nottingham Forest meet in a key Premier League fixture on Monday afternoon.", "How to watch Chelsea vs Nott'm Forest at 3pm on Monday" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_NewsArticles_Slug",
                table: "NewsArticles",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NewsArticles");
        }
    }
}
