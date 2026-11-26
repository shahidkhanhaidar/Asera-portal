using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AseraBackend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CptCosts",
                columns: table => new
                {
                    Code = table.Column<string>(type: "TEXT", maxLength: 10, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    DefaultValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CptCosts", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "ImpactRuns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TenantName = table.Column<string>(type: "TEXT", nullable: false),
                    IsProspect = table.Column<bool>(type: "INTEGER", nullable: false),
                    Model = table.Column<string>(type: "TEXT", nullable: false),
                    ModelVersion = table.Column<int>(type: "INTEGER", nullable: false),
                    RunBy = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    FailureReason = table.Column<string>(type: "TEXT", nullable: true),
                    SubscriptionCost = table.Column<decimal>(type: "TEXT", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", nullable: false),
                    StoredFilePath = table.Column<string>(type: "TEXT", nullable: false),
                    RerunOfId = table.Column<int>(type: "INTEGER", nullable: true),
                    EncountersAnalyzed = table.Column<int>(type: "INTEGER", nullable: true),
                    RevenueCaptured = table.Column<decimal>(type: "TEXT", nullable: true),
                    DenialsPrevented = table.Column<decimal>(type: "TEXT", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImpactRuns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 60, nullable: false),
                    Domain = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    SubscriptionNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    GraceDays = table.Column<int>(type: "INTEGER", nullable: false),
                    Corporate = table.Column<bool>(type: "INTEGER", nullable: false),
                    FaxEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    FaxUrl = table.Column<string>(type: "TEXT", nullable: false),
                    FaxUserName = table.Column<string>(type: "TEXT", nullable: false),
                    FaxPassword = table.Column<string>(type: "TEXT", nullable: false),
                    FaxNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Hl7MessageType = table.Column<string>(type: "TEXT", nullable: false),
                    PacsName = table.Column<string>(type: "TEXT", nullable: false),
                    Packages = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Notifications = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantCptOverrides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<int>(type: "INTEGER", nullable: false),
                    CptCode = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantCptOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantCptOverrides_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ImpactRuns_Status",
                table: "ImpactRuns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCptOverrides_TenantId_CptCode",
                table: "TenantCptOverrides",
                columns: new[] { "TenantId", "CptCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Domain",
                table: "Tenants",
                column: "Domain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Name",
                table: "Tenants",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_SubscriptionNumber",
                table: "Tenants",
                column: "SubscriptionNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CptCosts");

            migrationBuilder.DropTable(
                name: "ImpactRuns");

            migrationBuilder.DropTable(
                name: "TenantCptOverrides");

            migrationBuilder.DropTable(
                name: "Tenants");
        }
    }
}
