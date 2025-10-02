@echo off
echo 🚀 Starting Forex Prediction System...
echo.

echo 📦 Installing dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    pause
    exit /b 1
)

cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully
echo.

echo 🌐 Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo 🎉 Forex Prediction System Started!
echo.
echo 📊 Backend: http://localhost:5000
echo 🎨 Frontend: http://localhost:3000
echo.
echo 💡 To get real forex data, update your API keys in backend/.env
echo    - Alpha Vantage: https://www.alphavantage.co/support/#api-key
echo    - Twelve Data: https://twelvedata.com/pricing
echo.
echo Press any key to exit...
pause > nul