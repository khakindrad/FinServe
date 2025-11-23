using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UserMenuChangesDone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
            //    name: "FK_RoleMenus_MenuMaster_MenuMasterMenuId",
            //    table: "RoleMenus");

            //migrationBuilder.DropPrimaryKey(
            //    name: "PK_UserRoles",
            //    table: "UserRoles");

            //migrationBuilder.DropIndex(
            //    name: "IX_UserRoles_UserId",
            //    table: "UserRoles");

            //migrationBuilder.DropPrimaryKey(
            //    name: "PK_RoleMenus",
            //    table: "RoleMenus");

            //migrationBuilder.DropIndex(
            //    name: "IX_RoleMenus_MenuMasterMenuId",
            //    table: "RoleMenus");

            //migrationBuilder.DropIndex(
            //    name: "IX_RoleMenus_RoleId",
            //    table: "RoleMenus");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DropColumn(
                name: "MenuMasterMenuId",
                table: "RoleMenus");

            migrationBuilder.AlterColumn<int>(
                name: "UserRoleId",
                table: "UserRoles",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "RoleMenuId",
                table: "RoleMenus",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoleMenus",
                table: "RoleMenus",
                columns: new[] { "RoleId", "MenuId" });

            migrationBuilder.CreateIndex(
                name: "IX_RoleMenus_MenuId",
                table: "RoleMenus",
                column: "MenuId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleMenus_MenuMaster_MenuId",
                table: "RoleMenus",
                column: "MenuId",
                principalTable: "MenuMaster",
                principalColumn: "MenuId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleMenus_MenuMaster_MenuId",
                table: "RoleMenus");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoleMenus",
                table: "RoleMenus");

            migrationBuilder.DropIndex(
                name: "IX_RoleMenus_MenuId",
                table: "RoleMenus");

            migrationBuilder.AlterColumn<int>(
                name: "UserRoleId",
                table: "UserRoles",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AlterColumn<int>(
                name: "RoleMenuId",
                table: "RoleMenus",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn);

            migrationBuilder.AddColumn<int>(
                name: "MenuMasterMenuId",
                table: "RoleMenus",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles",
                column: "UserRoleId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoleMenus",
                table: "RoleMenus",
                column: "RoleMenuId");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Address", "CityId", "CountryId", "CreatedAt", "DateOfBirth", "DeviceTokensJson", "Email", "EmailVerified", "FailedLoginCount", "FirstName", "Gender", "IsActive", "IsApproved", "LastName", "LockoutEndAt", "MfaEnabled", "MfaSecret", "MiddleName", "Mobile", "MobileVerified", "PasswordExpiryDate", "PasswordHash", "PasswordLastChanged", "PinCode", "ProfileImageUrl", "StateId", "UpdatedAt" },
                values: new object[] { 1, "123 Admin St, Metropolis", 1, 1, new DateTime(2025, 11, 23, 6, 24, 38, 195, DateTimeKind.Utc).AddTicks(9471), new DateOnly(2025, 11, 23), null, "admin@finserve.com", true, 0, "Platform Admin", 3, true, true, "FinServe", null, false, null, null, "9999999999", true, null, "AZUDxldlM/X1TmQVaJ3Hg9yQfFFBgj8Fj0AvJy4CH6s8o/Rr5Ag/c4VXRoLfJh0UJA==", new DateTime(2025, 11, 23, 6, 24, 38, 196, DateTimeKind.Utc).AddTicks(1415), "400001", null, 1, null });

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleMenus_MenuMasterMenuId",
                table: "RoleMenus",
                column: "MenuMasterMenuId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleMenus_RoleId",
                table: "RoleMenus",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleMenus_MenuMaster_MenuMasterMenuId",
                table: "RoleMenus",
                column: "MenuMasterMenuId",
                principalTable: "MenuMaster",
                principalColumn: "MenuId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
