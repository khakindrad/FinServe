-- ============================================================
--   FIN SERVE DATABASE STRUCTURE (MySQL 8+)
--   Version: v10 FINAL (with PasswordResetTokens + DashboardAlerts)
--   Author: ChatGPT (Technical Architect)
--   Target Framework: .NET 9 Backend + MySQL
--   Date: 2025-11-09
-- ============================================================

DROP DATABASE IF EXISTS finserve;
CREATE DATABASE finserve CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finserve;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE Roles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO Roles (Id, Name, Description, IsActive) VALUES
(1, 'Admin', 'Platform administrator', 1),
(2, 'Employee', 'Internal employee', 1),
(3, 'Dealer', 'Car dealer partner', 1),
(4, 'Banker', 'Bank representative', 1),
(5, 'Customer', 'End customer', 1);

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(200) NOT NULL UNIQUE,
    Mobile VARCHAR(20),
    FullName VARCHAR(150) NOT NULL,
    RoleId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsApproved BIT NOT NULL DEFAULT 0,
    EmailVerified BIT NOT NULL DEFAULT 0,
    MobileVerified BIT NOT NULL DEFAULT 0,
    PasswordHash TEXT NOT NULL,
    PasswordLastChanged DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PasswordExpiryDate DATETIME NULL,
    FailedLoginCount INT NOT NULL DEFAULT 0,
    LockoutEndAt DATETIME NULL,
    MfaEnabled BIT NOT NULL DEFAULT 0,
    MfaSecret VARCHAR(100) NULL,
    DeviceTokensJson TEXT NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE RESTRICT
);

-- ✅ Seed admin user
INSERT INTO Users 
(Email, Mobile, FullName, RoleId, IsActive, IsApproved, EmailVerified, MobileVerified, PasswordHash, PasswordLastChanged)
VALUES
('admin@finserve.com', '9999999999', 'Platform Admin', 1, 1, 1, 1, 1,
 'AQClchAv7t1dq3Rmxu7xgmEK4EbByfwx4UV0RUZprlFUXnupgTMWrHczDdfQb6z3WZh6AoD2Z8Q2+y4Ydw7FuA==',
 NOW());

-- ============================================================
-- 3. REFRESH TOKENS
-- ============================================================
CREATE TABLE RefreshTokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Token TEXT NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedByIp VARCHAR(100),
    RevokedAt DATETIME NULL,
    ReplacedByToken TEXT NULL,
    ReasonRevoked VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);

-- ============================================================
-- 4. PASSWORD HISTORY
-- ============================================================
CREATE TABLE PasswordHistories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    PasswordHash TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_PasswordHistories_UserId ON PasswordHistories(UserId);

-- ============================================================
-- 5. PASSWORD RESET TOKENS
-- ============================================================
CREATE TABLE PasswordResetTokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Token VARCHAR(200) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Used BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_PasswordResetTokens_UserId ON PasswordResetTokens(UserId);
CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);

-- ============================================================
-- 6. DASHBOARD ALERTS (for password expiry & system notifications)
-- ============================================================
CREATE TABLE DashboardAlerts (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_DashboardAlerts_UserId ON DashboardAlerts(UserId);
CREATE INDEX IX_DashboardAlerts_IsRead ON DashboardAlerts(IsRead);

-- ============================================================
-- 7. SAMPLE ALERT (for admin)
-- ============================================================
INSERT INTO DashboardAlerts (UserId, Title, Message)
VALUES 
(1, 'Welcome Admin', 'This is your FinServe admin dashboard. You will see password expiry and pending approvals here.');

-- ============================================================
-- 8. INITIAL VALIDATION QUERIES
-- ============================================================
SELECT '✅ FinServe Database Created Successfully' AS Status;

SELECT * FROM Roles;
SELECT Id, Email, FullName, RoleId, IsApproved, PasswordLastChanged FROM Users;
SELECT COUNT(*) AS 'TablesCreated' FROM information_schema.tables WHERE table_schema='finserve';

-- ============================================================
-- 9. SECURITY CONFIGURATION SUMMARY (REFERENCE)
-- ============================================================
-- Password Policy (as per backend configuration):
--   - Min Length: 8
--   - Require Uppercase: TRUE
--   - Require Lowercase: TRUE
--   - Require Digit: TRUE
--   - Require Special: TRUE
--   - No Whitespace: TRUE
-- Password Expiry: 90 days (configurable in appsettings.json)
-- Password Reminder: 7 days before expiry
-- Lockout Policy: 5 failed attempts → 15 min lock
-- MFA: Enabled via TOTP (Otp.NET)
-- Roles assignable only by Admin
-- User login allowed only after Admin approval and verification of email + mobile
-- ============================================================
-- END OF SCRIPT
-- ============================================================
