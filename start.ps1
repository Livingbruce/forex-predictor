#!/usr/bin/env pwsh
# Forex Prediction System - Single Run Command

Write-Host "🚀 Starting Forex Prediction System..." -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

Write-Host "Installing backend dependencies..."
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependencies installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing frontend dependencies..."
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Start backend
Write-Host "🌐 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 Forex Prediction System Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Backend: http://localhost:5000" -ForegroundColor Blue
Write-Host "🎨 Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "💡 To get real forex data, update your API keys in backend/.env" -ForegroundColor Yellow
Write-Host "   - Alpha Vantage: https://www.alphavantage.co/support/#api-key" -ForegroundColor Gray
Write-Host "   - Twelve Data: https://twelvedata.com/pricing" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host
