@echo off
echo Building Currency Exchange App for Production...
echo.

echo Installing dependencies...
call npm install

echo.
echo Building production bundle...
call npm run build

echo.
echo Build completed successfully!
echo.
echo The 'dist' folder contains your production-ready application.
echo You can now deploy the contents of the 'dist' folder to any static hosting service.
echo.
echo Quick deployment options:
echo 1. Drag the 'dist' folder to https://app.netlify.com/drop
echo 2. Use 'npm run preview' to test the build locally
echo 3. Upload 'dist' contents to your hosting provider
echo.
pause