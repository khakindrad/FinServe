# Setup Guide (FinServe)

1. Install .NET 9 SDK (or change target to .NET 8 and update packages).
2. Update backend/src/WebAPI/appsettings.json with your MySQL and SMTP settings.
3. In terminal:
   cd backend/src/WebAPI
   dotnet restore
   dotnet tool install --global dotnet-ef
   dotnet ef migrations add InitialCreate --project ../Infrastructure --startup-project ./ --output-dir ../Infrastructure/Migrations
   dotnet ef database update --project ../Infrastructure --startup-project ./
4. Start WebAPI:
   dotnet run
5. Start frontend (next):
   cd frontend
   npm install
   npm run dev
