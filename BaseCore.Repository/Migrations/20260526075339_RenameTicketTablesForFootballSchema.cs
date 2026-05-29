using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class RenameTicketTablesForFootballSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_TicketListings_TicketListingId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ETickets_TicketOrderItems_TicketOrderItemId",
                table: "ETickets");

            migrationBuilder.DropForeignKey(
                name: "FK_ETickets_TicketOrders_TicketOrderId",
                table: "ETickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Teams_AwayTeamId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Teams_HomeTeamId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_TicketOrders_TicketOrderId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_StadiumSections_Stadiums_StadiumId",
                table: "StadiumSections");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketListings_Matches_MatchId",
                table: "TicketListings");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketListings_StadiumSections_StadiumSectionId",
                table: "TicketListings");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketOrderItems_TicketListings_TicketListingId",
                table: "TicketOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketOrderItems_TicketOrders_TicketOrderId",
                table: "TicketOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketOrders_Users_UserId",
                table: "TicketOrders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TicketOrders",
                table: "TicketOrders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TicketOrderItems",
                table: "TicketOrderItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TicketListings",
                table: "TicketListings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Teams",
                table: "Teams");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StadiumSections",
                table: "StadiumSections");

            migrationBuilder.RenameTable(
                name: "TicketOrders",
                newName: "Orders");

            migrationBuilder.RenameTable(
                name: "TicketOrderItems",
                newName: "OrderItems");

            migrationBuilder.RenameTable(
                name: "TicketListings",
                newName: "Tickets");

            migrationBuilder.RenameTable(
                name: "Teams",
                newName: "Clubs");

            migrationBuilder.RenameTable(
                name: "StadiumSections",
                newName: "Seats");

            migrationBuilder.RenameIndex(
                name: "IX_TicketOrders_UserId",
                table: "Orders",
                newName: "IX_Orders_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_TicketOrderItems_TicketOrderId",
                table: "OrderItems",
                newName: "IX_OrderItems_TicketOrderId");

            migrationBuilder.RenameIndex(
                name: "IX_TicketOrderItems_TicketListingId",
                table: "OrderItems",
                newName: "IX_OrderItems_TicketListingId");

            migrationBuilder.RenameIndex(
                name: "IX_TicketListings_StadiumSectionId",
                table: "Tickets",
                newName: "IX_Tickets_StadiumSectionId");

            migrationBuilder.RenameIndex(
                name: "IX_TicketListings_MatchId",
                table: "Tickets",
                newName: "IX_Tickets_MatchId");

            migrationBuilder.RenameIndex(
                name: "IX_Teams_Name",
                table: "Clubs",
                newName: "IX_Clubs_Name");

            migrationBuilder.RenameIndex(
                name: "IX_StadiumSections_StadiumId_Code",
                table: "Seats",
                newName: "IX_Seats_StadiumId_Code");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Orders",
                table: "Orders",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderItems",
                table: "OrderItems",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tickets",
                table: "Tickets",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Clubs",
                table: "Clubs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Seats",
                table: "Seats",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Tickets_TicketListingId",
                table: "CartItems",
                column: "TicketListingId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ETickets_OrderItems_TicketOrderItemId",
                table: "ETickets",
                column: "TicketOrderItemId",
                principalTable: "OrderItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ETickets_Orders_TicketOrderId",
                table: "ETickets",
                column: "TicketOrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Clubs_AwayTeamId",
                table: "Matches",
                column: "AwayTeamId",
                principalTable: "Clubs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Clubs_HomeTeamId",
                table: "Matches",
                column: "HomeTeamId",
                principalTable: "Clubs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Orders_TicketOrderId",
                table: "OrderItems",
                column: "TicketOrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Tickets_TicketListingId",
                table: "OrderItems",
                column: "TicketListingId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Orders_TicketOrderId",
                table: "Payments",
                column: "TicketOrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Stadiums_StadiumId",
                table: "Seats",
                column: "StadiumId",
                principalTable: "Stadiums",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Matches_MatchId",
                table: "Tickets",
                column: "MatchId",
                principalTable: "Matches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Seats_StadiumSectionId",
                table: "Tickets",
                column: "StadiumSectionId",
                principalTable: "Seats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Tickets_TicketListingId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ETickets_OrderItems_TicketOrderItemId",
                table: "ETickets");

            migrationBuilder.DropForeignKey(
                name: "FK_ETickets_Orders_TicketOrderId",
                table: "ETickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Clubs_AwayTeamId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Clubs_HomeTeamId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Orders_TicketOrderId",
                table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Tickets_TicketListingId",
                table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Orders_TicketOrderId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Stadiums_StadiumId",
                table: "Seats");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Matches_MatchId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Seats_StadiumSectionId",
                table: "Tickets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tickets",
                table: "Tickets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Seats",
                table: "Seats");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Orders",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderItems",
                table: "OrderItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Clubs",
                table: "Clubs");

            migrationBuilder.RenameTable(
                name: "Tickets",
                newName: "TicketListings");

            migrationBuilder.RenameTable(
                name: "Seats",
                newName: "StadiumSections");

            migrationBuilder.RenameTable(
                name: "Orders",
                newName: "TicketOrders");

            migrationBuilder.RenameTable(
                name: "OrderItems",
                newName: "TicketOrderItems");

            migrationBuilder.RenameTable(
                name: "Clubs",
                newName: "Teams");

            migrationBuilder.RenameIndex(
                name: "IX_Tickets_StadiumSectionId",
                table: "TicketListings",
                newName: "IX_TicketListings_StadiumSectionId");

            migrationBuilder.RenameIndex(
                name: "IX_Tickets_MatchId",
                table: "TicketListings",
                newName: "IX_TicketListings_MatchId");

            migrationBuilder.RenameIndex(
                name: "IX_Seats_StadiumId_Code",
                table: "StadiumSections",
                newName: "IX_StadiumSections_StadiumId_Code");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_UserId",
                table: "TicketOrders",
                newName: "IX_TicketOrders_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItems_TicketOrderId",
                table: "TicketOrderItems",
                newName: "IX_TicketOrderItems_TicketOrderId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderItems_TicketListingId",
                table: "TicketOrderItems",
                newName: "IX_TicketOrderItems_TicketListingId");

            migrationBuilder.RenameIndex(
                name: "IX_Clubs_Name",
                table: "Teams",
                newName: "IX_Teams_Name");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TicketListings",
                table: "TicketListings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StadiumSections",
                table: "StadiumSections",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TicketOrders",
                table: "TicketOrders",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TicketOrderItems",
                table: "TicketOrderItems",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Teams",
                table: "Teams",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_TicketListings_TicketListingId",
                table: "CartItems",
                column: "TicketListingId",
                principalTable: "TicketListings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ETickets_TicketOrderItems_TicketOrderItemId",
                table: "ETickets",
                column: "TicketOrderItemId",
                principalTable: "TicketOrderItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ETickets_TicketOrders_TicketOrderId",
                table: "ETickets",
                column: "TicketOrderId",
                principalTable: "TicketOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Teams_AwayTeamId",
                table: "Matches",
                column: "AwayTeamId",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Teams_HomeTeamId",
                table: "Matches",
                column: "HomeTeamId",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_TicketOrders_TicketOrderId",
                table: "Payments",
                column: "TicketOrderId",
                principalTable: "TicketOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StadiumSections_Stadiums_StadiumId",
                table: "StadiumSections",
                column: "StadiumId",
                principalTable: "Stadiums",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketListings_Matches_MatchId",
                table: "TicketListings",
                column: "MatchId",
                principalTable: "Matches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketListings_StadiumSections_StadiumSectionId",
                table: "TicketListings",
                column: "StadiumSectionId",
                principalTable: "StadiumSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketOrderItems_TicketListings_TicketListingId",
                table: "TicketOrderItems",
                column: "TicketListingId",
                principalTable: "TicketListings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketOrderItems_TicketOrders_TicketOrderId",
                table: "TicketOrderItems",
                column: "TicketOrderId",
                principalTable: "TicketOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketOrders_Users_UserId",
                table: "TicketOrders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
