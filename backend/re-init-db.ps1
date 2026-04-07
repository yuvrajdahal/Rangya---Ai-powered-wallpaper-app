# Rangya DB Re-initialization Script
# Run this script ONLY when Docker Desktop is running.

Write-Host "Checking Docker status..." -ForegroundColor Cyan
docker ps >$null 2>&1
if ($LastExitCode -ne 0) {
    Write-Error "Docker Desktop is not running! Please start it and try again."
    exit 1
}

Write-Host "Stopping and removing existing containers..." -ForegroundColor Yellow
docker compose down -v

Write-Host "Starting database container..." -ForegroundColor Yellow
docker compose up -d db

Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Pushing Prisma schema to database..." -ForegroundColor Yellow
npx prisma db push

Write-Host "Database re-initialized successfully!" -ForegroundColor Green
