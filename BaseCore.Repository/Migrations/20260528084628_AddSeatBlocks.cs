using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSeatBlocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SeatBlockId",
                table: "SeatPlaces",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SeatBlocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StadiumId = table.Column<int>(type: "int", nullable: false),
                    StadiumSectionId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeatBlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SeatBlocks_Seats_StadiumSectionId",
                        column: x => x.StadiumSectionId,
                        principalTable: "Seats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SeatBlocks_Stadiums_StadiumId",
                        column: x => x.StadiumId,
                        principalTable: "Stadiums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SeatPlaces_SeatBlockId_RowLabel_SeatNumber",
                table: "SeatPlaces",
                columns: new[] { "SeatBlockId", "RowLabel", "SeatNumber" },
                unique: true,
                filter: "[SeatBlockId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SeatBlocks_StadiumId",
                table: "SeatBlocks",
                column: "StadiumId");

            migrationBuilder.CreateIndex(
                name: "IX_SeatBlocks_StadiumSectionId_Code",
                table: "SeatBlocks",
                columns: new[] { "StadiumSectionId", "Code" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SeatPlaces_SeatBlocks_SeatBlockId",
                table: "SeatPlaces",
                column: "SeatBlockId",
                principalTable: "SeatBlocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql("""
DECLARE @BlockTemplates table
(
    SectionSelector nvarchar(30) NOT NULL,
    BlockCode nvarchar(30) NOT NULL
);

INSERT INTO @BlockTemplates (SectionSelector, BlockCode)
VALUES
    (N'best', N'A101'), (N'best', N'A102'), (N'best', N'A103'), (N'best', N'A104'), (N'best', N'A105'), (N'best', N'A106'), (N'best', N'A107'), (N'best', N'A108'),
    (N'best', N'A201'), (N'best', N'A202'), (N'best', N'A203'), (N'best', N'A204'), (N'best', N'A205'), (N'best', N'A206'), (N'best', N'A207'), (N'best', N'A208'),
    (N'standard', N'B101'), (N'standard', N'B102'), (N'standard', N'B103'), (N'standard', N'B104'), (N'standard', N'B105'), (N'standard', N'B106'),
    (N'standard', N'B201'), (N'standard', N'B202'), (N'standard', N'B203'), (N'standard', N'B204'), (N'standard', N'B205'), (N'standard', N'B206'),
    (N'standard', N'B301'), (N'standard', N'B302'), (N'standard', N'B303'), (N'standard', N'B304'), (N'standard', N'B305'), (N'standard', N'B306'),
    (N'west', N'C101'), (N'west', N'C102'), (N'west', N'C103'), (N'west', N'C104'), (N'west', N'C105'), (N'west', N'C106'),
    (N'west', N'C201'), (N'west', N'C202'), (N'west', N'C203'), (N'west', N'C204'), (N'west', N'C205'), (N'west', N'C206'),
    (N'west', N'C301'), (N'west', N'C302'), (N'west', N'C303'), (N'west', N'C304'), (N'west', N'C305'), (N'west', N'C306'),
    (N'south', N'D101'), (N'south', N'D102'), (N'south', N'D103'), (N'south', N'D104'), (N'south', N'D105'), (N'south', N'D106'), (N'south', N'D107'), (N'south', N'D108'),
    (N'south', N'D201'), (N'south', N'D202'), (N'south', N'D203'), (N'south', N'D204'), (N'south', N'D205'), (N'south', N'D206'), (N'south', N'D207'), (N'south', N'D208'),
    (N'home', N'H101'), (N'home', N'H102'), (N'home', N'H103'), (N'home', N'H104'), (N'home', N'H105'),
    (N'home', N'H201'), (N'home', N'H202'), (N'home', N'H203'), (N'home', N'H204'), (N'home', N'H205'),
    (N'away', N'AW101'), (N'away', N'AW102'), (N'away', N'AW103'), (N'away', N'AW104'), (N'away', N'AW105'),
    (N'away', N'AW201'), (N'away', N'AW202'), (N'away', N'AW203'), (N'away', N'AW204'), (N'away', N'AW205'),
    (N'vip', N'VIP1'), (N'vip', N'VIP2'), (N'vip', N'VIP3'), (N'vip', N'VIP4'), (N'vip', N'VIP5'), (N'vip', N'VIP6'), (N'vip', N'VIP7'), (N'vip', N'VIP8'),
    (N'vip', N'VIP9'), (N'vip', N'VIP10'), (N'vip', N'VIP11'), (N'vip', N'VIP12'), (N'vip', N'VIP13'), (N'vip', N'VIP14'), (N'vip', N'VIP15'), (N'vip', N'VIP16');

DECLARE @Rows table (RowLabel nvarchar(20) NOT NULL);
DECLARE @SeatNumbers table (SeatNumber int NOT NULL);

INSERT INTO @Rows (RowLabel) VALUES (N'A'), (N'B'), (N'C'), (N'D');
INSERT INTO @SeatNumbers (SeatNumber) VALUES (1), (2), (3), (4), (5), (6);

;WITH SectionTargets AS
(
    SELECT
        section.Id AS StadiumSectionId,
        section.StadiumId,
        CASE
            WHEN section.Tier = N'best' OR section.Code LIKE N'N%' THEN N'best'
            WHEN section.Tier = N'away' OR section.Name LIKE N'%Away%' THEN N'away'
            WHEN section.Tier = N'vip' THEN N'vip'
            WHEN section.Code LIKE N'W%' OR section.Name LIKE N'%West%' THEN N'west'
            WHEN section.Code LIKE N'S%' OR section.Name LIKE N'%South%' THEN N'south'
            WHEN section.Code LIKE N'H%' OR section.Name LIKE N'%Home%' THEN N'home'
            ELSE N'standard'
        END AS SectionSelector
    FROM [Seats] section
)
INSERT INTO [SeatBlocks] ([StadiumId], [StadiumSectionId], [Code], [Name], [IsActive], [CreatedAt], [UpdatedAt])
SELECT
    target.StadiumId,
    target.StadiumSectionId,
    template.BlockCode,
    CONCAT(N'Block ', template.BlockCode),
    CAST(1 AS bit),
    SYSUTCDATETIME(),
    NULL
FROM SectionTargets target
INNER JOIN @BlockTemplates template ON template.SectionSelector = target.SectionSelector
WHERE NOT EXISTS
(
    SELECT 1
    FROM [SeatBlocks] existing
    WHERE existing.[StadiumSectionId] = target.StadiumSectionId
      AND existing.[Code] = template.BlockCode
);

INSERT INTO [SeatPlaces] ([StadiumId], [StadiumSectionId], [SeatBlockId], [RowLabel], [SeatNumber], [Code], [IsActive], [CreatedAt], [UpdatedAt])
SELECT
    block.StadiumId,
    block.StadiumSectionId,
    block.Id,
    rowSource.RowLabel,
    numberSource.SeatNumber,
    CONCAT(block.Code, N'-', rowSource.RowLabel, N'-', RIGHT(CONCAT(N'0', CONVERT(nvarchar(2), numberSource.SeatNumber)), 2)),
    CAST(1 AS bit),
    SYSUTCDATETIME(),
    NULL
FROM [SeatBlocks] block
CROSS JOIN @Rows rowSource
CROSS JOIN @SeatNumbers numberSource
WHERE NOT EXISTS
(
    SELECT 1
    FROM [SeatPlaces] existing
    WHERE existing.[SeatBlockId] = block.Id
      AND existing.[RowLabel] = rowSource.RowLabel
      AND existing.[SeatNumber] = numberSource.SeatNumber
);

INSERT INTO [MatchSeatInventories] ([MatchId], [SeatPlaceId], [TicketListingId], [Status], [HoldExpiresAt], [HeldByUserId], [CreatedAt], [UpdatedAt])
SELECT
    listing.MatchId,
    seat.Id,
    listing.Id,
    N'Available',
    NULL,
    NULL,
    SYSUTCDATETIME(),
    NULL
FROM [Tickets] listing
INNER JOIN [SeatPlaces] seat ON seat.StadiumSectionId = listing.StadiumSectionId
WHERE seat.SeatBlockId IS NOT NULL
  AND listing.AvailableQuantity > 0
  AND NOT EXISTS
  (
      SELECT 1
      FROM [MatchSeatInventories] existing
      WHERE existing.MatchId = listing.MatchId
        AND existing.SeatPlaceId = seat.Id
  );
""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
DELETE inventory
FROM [MatchSeatInventories] inventory
INNER JOIN [SeatPlaces] seat ON seat.Id = inventory.SeatPlaceId
WHERE seat.SeatBlockId IS NOT NULL
  AND inventory.Status = N'Available'
  AND inventory.HeldByUserId IS NULL
  AND inventory.HoldExpiresAt IS NULL
  AND NOT EXISTS (SELECT 1 FROM [TicketOrderSeats] orderSeat WHERE orderSeat.SeatPlaceId = inventory.SeatPlaceId);

DELETE seat
FROM [SeatPlaces] seat
WHERE seat.SeatBlockId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM [MatchSeatInventories] inventory WHERE inventory.SeatPlaceId = seat.Id)
  AND NOT EXISTS (SELECT 1 FROM [TicketOrderSeats] orderSeat WHERE orderSeat.SeatPlaceId = seat.Id);

UPDATE [SeatPlaces]
SET [SeatBlockId] = NULL
WHERE [SeatBlockId] IS NOT NULL;
""");

            migrationBuilder.DropForeignKey(
                name: "FK_SeatPlaces_SeatBlocks_SeatBlockId",
                table: "SeatPlaces");

            migrationBuilder.DropTable(
                name: "SeatBlocks");

            migrationBuilder.DropIndex(
                name: "IX_SeatPlaces_SeatBlockId_RowLabel_SeatNumber",
                table: "SeatPlaces");

            migrationBuilder.DropColumn(
                name: "SeatBlockId",
                table: "SeatPlaces");
        }
    }
}
