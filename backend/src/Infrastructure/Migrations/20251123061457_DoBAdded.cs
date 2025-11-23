using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DoBAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "DateOfBirth", "PasswordLastChanged" },
                values: new object[] { new DateTime(2025, 11, 23, 6, 14, 56, 823, DateTimeKind.Utc).AddTicks(6025), new DateTime(1995, 11, 23, 11, 44, 56, 823, DateTimeKind.Local).AddTicks(6532), new DateTime(2025, 11, 23, 6, 14, 56, 823, DateTimeKind.Utc).AddTicks(7658) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordLastChanged" },
                values: new object[] { new DateTime(2025, 11, 23, 5, 42, 38, 713, DateTimeKind.Utc).AddTicks(4078), new DateTime(2025, 11, 23, 5, 42, 38, 713, DateTimeKind.Utc).AddTicks(5354) });
        }
    }
}
