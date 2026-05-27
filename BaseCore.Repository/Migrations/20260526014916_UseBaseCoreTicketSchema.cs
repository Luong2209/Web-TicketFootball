using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UseBaseCoreTicketSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stadiums",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    City = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stadiums", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    City = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TicketOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    CustomerEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    CustomerPhone = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketOrders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StadiumSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StadiumId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Tier = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MapX = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    MapY = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    MapWidth = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    MapHeight = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StadiumSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StadiumSections_Stadiums_StadiumId",
                        column: x => x.StadiumId,
                        principalTable: "Stadiums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Competition = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    HomeTeamId = table.Column<int>(type: "int", nullable: false),
                    AwayTeamId = table.Column<int>(type: "int", nullable: false),
                    StadiumId = table.Column<int>(type: "int", nullable: false),
                    KickoffTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matches_Stadiums_StadiumId",
                        column: x => x.StadiumId,
                        principalTable: "Stadiums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Teams_AwayTeamId",
                        column: x => x.AwayTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Teams_HomeTeamId",
                        column: x => x.HomeTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TicketListings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    StadiumSectionId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    RowLabel = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SellerName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    TicketType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AvailableQuantity = table.Column<int>(type: "int", nullable: false),
                    DeliveryMethod = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketListings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketListings_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TicketListings_StadiumSections_StadiumSectionId",
                        column: x => x.StadiumSectionId,
                        principalTable: "StadiumSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TicketOrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TicketOrderId = table.Column<int>(type: "int", nullable: false),
                    TicketListingId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketOrderItems_TicketListings_TicketListingId",
                        column: x => x.TicketListingId,
                        principalTable: "TicketListings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TicketOrderItems_TicketOrders_TicketOrderId",
                        column: x => x.TicketOrderId,
                        principalTable: "TicketOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Stadiums",
                columns: new[] { "Id", "Capacity", "City", "Country", "ImageUrl", "Name" },
                values: new object[,]
                {
                    { 1, 74310, "Manchester", "England", "/template-football/images/alessio-festa-_ElVbiXREBM-unsplash.jpg", "Old Trafford" },
                    { 2, 60704, "London", "England", "/template-football/images/william-hadley-JytQXLPXpNM-unsplash.jpg", "Emirates Stadium" },
                    { 3, 53400, "Manchester", "England", "/template-football/images/james-kirkup-LbT_j62t94U-unsplash.jpg", "Etihad Stadium" }
                });

            migrationBuilder.InsertData(
                table: "Teams",
                columns: new[] { "Id", "City", "Country", "IsActive", "LogoUrl", "Name" },
                values: new object[,]
                {
                    { 1, "Manchester", "England", true, "/template-football/images/epl-teams/ImageLoGo/Manchester-United-FC-logo.png", "Manchester United" },
                    { 2, "Liverpool", "England", true, "/template-football/images/epl-teams/ImageLoGo/Liverpool-FC-logo.png", "Liverpool" },
                    { 3, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/Arsenal-FC-logo.png", "Arsenal" },
                    { 4, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/Chelsea-FC-logo.png", "Chelsea" },
                    { 5, "Manchester", "England", true, "/template-football/images/epl-teams/ImageLoGo/Manchester-City-FC-logo.png", "Manchester City" },
                    { 6, "London", "England", true, "/template-football/images/epl-teams/ImageLoGo/Tottenham-Hotspur-logo.png", "Tottenham Hotspur" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Contact", "Created", "Email", "Image", "IsActive", "Name", "Password", "Phone", "Position", "Salt", "UserName", "UserType" },
                values: new object[] { "11111111-1111-1111-1111-111111111111", "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "admin@robotvibot.com", "", true, "Administrator", "admin123", "0123456789", "System Administrator", new byte[0], "admin", 1 });

            migrationBuilder.InsertData(
                table: "Matches",
                columns: new[] { "Id", "AwayTeamId", "Competition", "HomeTeamId", "IsFeatured", "KickoffTime", "Slug", "StadiumId", "Status" },
                values: new object[,]
                {
                    { 1, 2, "Premier League", 1, true, new DateTime(2026, 5, 3, 15, 30, 0, 0, DateTimeKind.Unspecified), "man-utd-liverpool", 1, "Scheduled" },
                    { 2, 4, "Premier League", 3, true, new DateTime(2026, 5, 10, 18, 0, 0, 0, DateTimeKind.Unspecified), "arsenal-chelsea", 2, "Scheduled" },
                    { 3, 6, "Premier League", 5, true, new DateTime(2026, 5, 17, 16, 30, 0, 0, DateTimeKind.Unspecified), "man-city-tottenham", 3, "Scheduled" }
                });

            migrationBuilder.InsertData(
                table: "StadiumSections",
                columns: new[] { "Id", "BasePrice", "Capacity", "Code", "MapHeight", "MapWidth", "MapX", "MapY", "Name", "StadiumId", "Tier" },
                values: new object[,]
                {
                    { 1, 590m, 120, "E335", 8m, 8m, 91m, 44m, "East Stand E335", 1, "standard" },
                    { 2, 632m, 90, "E132", 8m, 8m, 82m, 86m, "Away Section E132", 1, "away" },
                    { 3, 1050m, 100, "N1405", 10m, 7m, 83m, 32m, "North Stand N1405", 1, "best" },
                    { 4, 3795m, 48, "N3406", 10m, 7m, 45m, 12m, "VIP Hospitality N3406", 1, "vip" },
                    { 5, 8000m, 24, "S221", 6m, 7m, 42m, 94m, "South VIP Box S221", 1, "vip" }
                });

            migrationBuilder.InsertData(
                table: "TicketListings",
                columns: new[] { "Id", "AvailableQuantity", "DeliveryMethod", "IsVerified", "MatchId", "RowLabel", "SellerName", "StadiumSectionId", "TicketType", "Title", "UnitPrice" },
                values: new object[,]
                {
                    { 1, 36, "Mobile Tickets", true, 1, "Row 7", "Club Ticket Office", 1, "standard", "E335", 590m },
                    { 2, 24, "Mobile Tickets", true, 1, "Block E132", "Club Ticket Office", 2, "away", "Away Section", 632m },
                    { 3, 28, "Mobile Tickets", true, 1, "Lower Tier", "Seat Market", 3, "best", "N1405", 1050m },
                    { 4, 12, "Mobile Tickets", true, 1, "Hospitality", "Club Partner", 4, "vip", "N3406 VIP", 3795m },
                    { 5, 8, "Mobile Tickets", true, 1, "Director Seats", "Hospitality Direct", 5, "vip", "S221 VIP Box", 8000m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Matches_AwayTeamId",
                table: "Matches",
                column: "AwayTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_HomeTeamId",
                table: "Matches",
                column: "HomeTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_Slug",
                table: "Matches",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matches_StadiumId",
                table: "Matches",
                column: "StadiumId");

            migrationBuilder.CreateIndex(
                name: "IX_StadiumSections_StadiumId_Code",
                table: "StadiumSections",
                columns: new[] { "StadiumId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_Name",
                table: "Teams",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketListings_MatchId",
                table: "TicketListings",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketListings_StadiumSectionId",
                table: "TicketListings",
                column: "StadiumSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketOrderItems_TicketListingId",
                table: "TicketOrderItems",
                column: "TicketListingId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketOrderItems_TicketOrderId",
                table: "TicketOrderItems",
                column: "TicketOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketOrders_UserId",
                table: "TicketOrders",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TicketOrderItems");

            migrationBuilder.DropTable(
                name: "TicketListings");

            migrationBuilder.DropTable(
                name: "TicketOrders");

            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "StadiumSections");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropTable(
                name: "Stadiums");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "11111111-1111-1111-1111-111111111111");
        }
    }
}
