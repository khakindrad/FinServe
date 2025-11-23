using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DoBDataTypeChanged : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Users",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "DateOfBirth", "PasswordLastChanged" },
                values: new object[] { new DateTime(2025, 11, 23, 6, 24, 38, 195, DateTimeKind.Utc).AddTicks(9471), new DateOnly(2025, 11, 23), new DateTime(2025, 11, 23, 6, 24, 38, 196, DateTimeKind.Utc).AddTicks(1415) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime(6)",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "DateOfBirth", "PasswordLastChanged" },
                values: new object[] { new DateTime(2025, 11, 23, 6, 14, 56, 823, DateTimeKind.Utc).AddTicks(6025), new DateTime(1995, 11, 23, 11, 44, 56, 823, DateTimeKind.Local).AddTicks(6532), new DateTime(2025, 11, 23, 6, 14, 56, 823, DateTimeKind.Utc).AddTicks(7658) });
        }
    }
}
