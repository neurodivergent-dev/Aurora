Write-Host 'ADB & Port 8081 Cleanup Starting...' -ForegroundColor Cyan
taskkill /F /IM adb.exe 2>$null
# Search for process on port 8081 usando netstat
$line = netstat -ano | findstr :8081 | select-object -first 1
if ($line) {
    $p_id = $line.Trim().Split(' ') | select-object -last 1
    Write-Host ('Cleaning up process on port 8081 (PID: ' + $p_id + ')...') -ForegroundColor Yellow
    taskkill /F /PID $p_id 2>$null
}
adb kill-server
adb start-server
adb devices
Write-Host 'Done! You can now run the application.' -ForegroundColor Green
