using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class SeedFullPremierLeagueClubsAndStadiums : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Clubs",
                columns: new[] { "Id", "City", "Country", "IsActive", "LogoUrl", "Name" },
                values: new object[,]
                {
                    { 7, "Bournemouth", "England", true, "/template-football/images/epl-teams/ImageLoGo/AFC-Bournemouth-logo.png", "AFC Bournemouth" },
                    { 8, "Birmingham", "England", true, "/template-football/images/epl-teams/ImageLoGo/Aston-Villa-FC-logo.png", "Aston Villa" },
                    { 9, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/Brentford-FC-logo.png", "Brentford" },
                    { 10, "Brighton and Hove", "England", true, "/template-football/images/epl-teams/ImageLoGo/Brighton-Hove-Albion-logo.png", "Brighton & Hove Albion" },
                    { 11, "Burnley", "England", true, "/template-football/images/epl-teams/ImageLoGo/Burnley-FC-logo-1.png", "Burnley" },
                    { 12, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/Crystal-Palace-FC-logo.png", "Crystal Palace" },
                    { 13, "Liverpool", "England", true, "/template-football/images/epl-teams/ImageLoGo/Everton-FC-logo.png", "Everton" },
                    { 14, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/Fulham-FC-logo.png", "Fulham" },
                    { 15, "Leeds", "England", true, "/template-football/images/epl-teams/ImageLoGo/Leeds-United-FC-logo.png", "Leeds United" },
                    { 16, "Newcastle upon Tyne", "England", true, "/template-football/images/epl-teams/ImageLoGo/Newcastle-United-logo.png", "Newcastle United" },
                    { 17, "Nottingham", "England", true, "/template-football/images/epl-teams/ImageLoGo/Nottingham-Forest-FC-logo.png", "Nottingham Forest" },
                    { 18, "Sunderland", "England", true, "/template-football/images/epl-teams/ImageLoGo/Sunderland-logo.png", "Sunderland" },
                    { 19, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/West-Ham-United-FC-logo.png", "West Ham United" },
                    { 20, "Wolverhampton", "England", true, "/template-football/images/epl-teams/ImageLoGo/Wolverhampton-Wanderers-logo.png", "Wolverhampton Wanderers" }
                });

            migrationBuilder.InsertData(
                table: "Stadiums",
                columns: new[] { "Id", "Capacity", "City", "Country", "ImageUrl", "Name" },
                values: new object[,]
                {
                    { 4, 61276, "Liverpool", "England", "/template-football/images/bg-breadcrumbs-1-1920x726.jpg", "Anfield" },
                    { 5, 40343, "London", "England", "/template-football/images/slider-1-slide-1-1920x671.jpg", "Stamford Bridge" },
                    { 6, 62850, "London", "England", "/template-football/images/slider-1-slide-2-1920x671.jpg", "Tottenham Hotspur Stadium" },
                    { 7, 11307, "Bournemouth", "England", "/template-football/images/slider-1-slide-3-1920x671.jpg", "Vitality Stadium" },
                    { 8, 42657, "Birmingham", "England", "/template-football/images/post-slide-1-769x397.jpg", "Villa Park" },
                    { 9, 17250, "London", "England", "/template-football/images/post-slide-2-769x397.jpg", "Gtech Community Stadium" },
                    { 10, 31800, "Brighton and Hove", "England", "/template-football/images/post-slide-3-769x397.jpg", "American Express Stadium" },
                    { 11, 21944, "Burnley", "England", "/template-football/images/gallery-soccer-1-original.jpg", "Turf Moor" },
                    { 12, 25486, "London", "England", "/template-football/images/gallery-soccer-2-original.jpg", "Selhurst Park" },
                    { 13, 52888, "Liverpool", "England", "/template-football/images/gallery-soccer-3-original.jpg", "Hill Dickinson Stadium" },
                    { 14, 25700, "London", "England", "/template-football/images/gallery-soccer-4-original.jpg", "Craven Cottage" },
                    { 15, 37890, "Leeds", "England", "/template-football/images/gallery-soccer-5-original.jpg", "Elland Road" },
                    { 16, 52305, "Newcastle upon Tyne", "England", "/template-football/images/gallery-soccer-6-original.jpg", "St James' Park" },
                    { 17, 30445, "Nottingham", "England", "/template-football/images/who-s-denilo-SuBb_SiEEM8-unsplash.jpg", "The City Ground" },
                    { 18, 48707, "Sunderland", "England", "/template-football/images/mario-klassen-70YxSTWa2Zw-unsplash.jpg", "Stadium of Light" },
                    { 19, 62500, "London", "England", "/template-football/images/banner-free-01.jpg", "London Stadium" },
                    { 20, 31750, "Wolverhampton", "England", "/template-football/images/banner-free-02.jpg", "Molineux Stadium" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Clubs",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Stadiums",
                keyColumn: "Id",
                keyValue: 20);
        }
    }
}
