using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSeatInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SeatCode",
                table: "ETickets",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SeatPlaces",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StadiumId = table.Column<int>(type: "int", nullable: false),
                    StadiumSectionId = table.Column<int>(type: "int", nullable: false),
                    RowLabel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SeatNumber = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeatPlaces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SeatPlaces_Seats_StadiumSectionId",
                        column: x => x.StadiumSectionId,
                        principalTable: "Seats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SeatPlaces_Stadiums_StadiumId",
                        column: x => x.StadiumId,
                        principalTable: "Stadiums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MatchSeatInventories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    SeatPlaceId = table.Column<int>(type: "int", nullable: false),
                    TicketListingId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    HoldExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HeldByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchSeatInventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchSeatInventories_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchSeatInventories_SeatPlaces_SeatPlaceId",
                        column: x => x.SeatPlaceId,
                        principalTable: "SeatPlaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MatchSeatInventories_Tickets_TicketListingId",
                        column: x => x.TicketListingId,
                        principalTable: "Tickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MatchSeatInventories_Users_HeldByUserId",
                        column: x => x.HeldByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TicketOrderSeats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderItemId = table.Column<int>(type: "int", nullable: false),
                    SeatPlaceId = table.Column<int>(type: "int", nullable: false),
                    SeatCode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketOrderSeats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketOrderSeats_OrderItems_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "OrderItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TicketOrderSeats_SeatPlaces_SeatPlaceId",
                        column: x => x.SeatPlaceId,
                        principalTable: "SeatPlaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatchSeatInventories_HeldByUserId",
                table: "MatchSeatInventories",
                column: "HeldByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSeatInventories_MatchId_SeatPlaceId",
                table: "MatchSeatInventories",
                columns: new[] { "MatchId", "SeatPlaceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MatchSeatInventories_SeatPlaceId",
                table: "MatchSeatInventories",
                column: "SeatPlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSeatInventories_TicketListingId",
                table: "MatchSeatInventories",
                column: "TicketListingId");

            migrationBuilder.CreateIndex(
                name: "IX_SeatPlaces_StadiumId",
                table: "SeatPlaces",
                column: "StadiumId");

            migrationBuilder.CreateIndex(
                name: "IX_SeatPlaces_StadiumSectionId_Code",
                table: "SeatPlaces",
                columns: new[] { "StadiumSectionId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketOrderSeats_OrderItemId_SeatPlaceId",
                table: "TicketOrderSeats",
                columns: new[] { "OrderItemId", "SeatPlaceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketOrderSeats_SeatPlaceId",
                table: "TicketOrderSeats",
                column: "SeatPlaceId");

            migrationBuilder.Sql(@"
DECLARE @Rows table ([RowLabel] nvarchar(20) NOT NULL);
DECLARE @Numbers table ([SeatNumber] int NOT NULL);

INSERT INTO @Rows ([RowLabel])
VALUES (N'A'), (N'B'), (N'C'), (N'D');

INSERT INTO @Numbers ([SeatNumber])
VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10);

INSERT INTO [SeatPlaces] ([StadiumId], [StadiumSectionId], [RowLabel], [SeatNumber], [Code], [IsActive], [CreatedAt], [UpdatedAt])
SELECT
    section.[StadiumId],
    section.[Id],
    rowSource.[RowLabel],
    numberSource.[SeatNumber],
    CONCAT(section.[Code], N'-', rowSource.[RowLabel], numberSource.[SeatNumber]),
    CAST(1 AS bit),
    SYSUTCDATETIME(),
    NULL
FROM [Seats] section
CROSS JOIN @Rows rowSource
CROSS JOIN @Numbers numberSource
WHERE NOT EXISTS
(
    SELECT 1
    FROM [SeatPlaces] existing
    WHERE existing.[StadiumSectionId] = section.[Id]
      AND existing.[Code] = CONCAT(section.[Code], N'-', rowSource.[RowLabel], numberSource.[SeatNumber])
);

;WITH SeatRanks AS
(
    SELECT
        seat.[Id] AS [SeatPlaceId],
        seat.[StadiumSectionId],
        ROW_NUMBER() OVER (PARTITION BY seat.[StadiumSectionId] ORDER BY seat.[RowLabel], seat.[SeatNumber], seat.[Id]) AS [SeatRank]
    FROM [SeatPlaces] seat
    WHERE seat.[IsActive] = 1
),
ListingRanks AS
(
    SELECT
        listing.[Id] AS [TicketListingId],
        listing.[MatchId],
        listing.[StadiumSectionId],
        listing.[AvailableQuantity],
        COALESCE
        (
            SUM(listing.[AvailableQuantity]) OVER
            (
                PARTITION BY listing.[MatchId], listing.[StadiumSectionId]
                ORDER BY listing.[Id]
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ),
            0
        ) AS [PreviousAvailableQuantity]
    FROM [Tickets] listing
    WHERE listing.[AvailableQuantity] > 0
)
INSERT INTO [MatchSeatInventories] ([MatchId], [SeatPlaceId], [TicketListingId], [Status], [HoldExpiresAt], [HeldByUserId], [CreatedAt], [UpdatedAt])
SELECT
    listing.[MatchId],
    seat.[SeatPlaceId],
    listing.[TicketListingId],
    N'Available',
    NULL,
    NULL,
    SYSUTCDATETIME(),
    NULL
FROM ListingRanks listing
INNER JOIN SeatRanks seat ON seat.[StadiumSectionId] = listing.[StadiumSectionId]
WHERE seat.[SeatRank] > listing.[PreviousAvailableQuantity]
  AND seat.[SeatRank] <= listing.[PreviousAvailableQuantity] + listing.[AvailableQuantity]
  AND NOT EXISTS
  (
      SELECT 1
      FROM [MatchSeatInventories] existing
      WHERE existing.[MatchId] = listing.[MatchId]
        AND existing.[SeatPlaceId] = seat.[SeatPlaceId]
  );
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE inventory
FROM [MatchSeatInventories] inventory
WHERE inventory.[Status] = N'Available'
  AND inventory.[HeldByUserId] IS NULL
  AND inventory.[HoldExpiresAt] IS NULL
  AND NOT EXISTS (SELECT 1 FROM [TicketOrderSeats] orderSeat WHERE orderSeat.[SeatPlaceId] = inventory.[SeatPlaceId]);

DELETE seat
FROM [SeatPlaces] seat
WHERE seat.[RowLabel] IN (N'A', N'B', N'C', N'D')
  AND seat.[SeatNumber] BETWEEN 1 AND 10
  AND NOT EXISTS (SELECT 1 FROM [MatchSeatInventories] inventory WHERE inventory.[SeatPlaceId] = seat.[Id])
  AND NOT EXISTS (SELECT 1 FROM [TicketOrderSeats] orderSeat WHERE orderSeat.[SeatPlaceId] = seat.[Id]);
");

            migrationBuilder.DropTable(
                name: "MatchSeatInventories");

            migrationBuilder.DropTable(
                name: "TicketOrderSeats");

            migrationBuilder.DropTable(
                name: "SeatPlaces");

            migrationBuilder.DropColumn(
                name: "SeatCode",
                table: "ETickets");
        }
    }
}
