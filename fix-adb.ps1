Write-Host "🚀 ADB Kurtarma Operasyonu Başlıyor..." -ForegroundColor Cyan

# 1. Her şeyi zorla öldür
Write-Host "💀 Mevcut ADB süreçleri temizleniyor..." -ForegroundColor Yellow
taskkill /F /IM adb.exe 2>$null

# 2. ADB'yi temiz başlat
Write-Host "✨ ADB Sunucusu yeniden doğuyor..." -ForegroundColor Green
adb kill-server
adb start-server

# 3. Senin IP'ye bağlan (192.168.1.155:43197)
Write-Host "🔗 Cihaza bağlanmaya çalışılıyor ([IP_ADDRESS])..." -ForegroundColor Magenta
adb connect [IP_ADDRESS]

# 4. Bağlı cihazları göster
Write-Host "📱 Bağlı Cihazlar:" -ForegroundColor Blue
adb devices

Write-Host "✅ İşlem Tamam! Şimdi uygulamayı çalıştırabilirsin." -ForegroundColor Green