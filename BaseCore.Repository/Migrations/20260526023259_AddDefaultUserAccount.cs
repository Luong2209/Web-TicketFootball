using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultUserAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Contact", "Created", "Email", "Image", "IsActive", "Name", "Password", "Phone", "Position", "Salt", "UserName", "UserType" },
                values: new object[] { "22222222-2222-2222-2222-222222222222", "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "user@basecore.local", "", true, "Default User", "user123", "0987654321", "Customer", new byte[0], "user", 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "22222222-2222-2222-2222-222222222222");
        }
    }
}
