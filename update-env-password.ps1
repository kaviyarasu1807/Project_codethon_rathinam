# PowerShell Script to Update MongoDB Password in .env file
# Run this script: .\update-env-password.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Password Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the project root directory." -ForegroundColor Yellow
    exit 1
}

# Read current .env content
$envContent = Get-Content ".env" -Raw

# Check if password is still placeholder
if ($envContent -match "<db_password>") {
    Write-Host "Current .env file has placeholder password: <db_password>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your MongoDB password:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://cloud.mongodb.com/" -ForegroundColor White
    Write-Host "2. Click 'Database Access' in left sidebar" -ForegroundColor White
    Write-Host "3. Click 'Edit' on user 'kavi'" -ForegroundColor White
    Write-Host "4. Click 'Edit Password'" -ForegroundColor White
    Write-Host "5. Click 'Autogenerate Secure Password'" -ForegroundColor White
    Write-Host "6. COPY the password" -ForegroundColor White
    Write-Host "7. Come back here and paste it" -ForegroundColor White
    Write-Host ""
    
    # Prompt for password
    $password = Read-Host "Enter your MongoDB password (or press Ctrl+C to cancel)"
    
    if ([string]::IsNullOrWhiteSpace($password)) {
        Write-Host "ERROR: Password cannot be empty!" -ForegroundColor Red
        exit 1
    }
    
    # Check if password needs URL encoding
    $specialChars = @('@', '#', '$', '%', '/', ':', '?', '&')
    $needsEncoding = $false
    foreach ($char in $specialChars) {
        if ($password.Contains($char)) {
            $needsEncoding = $true
            break
        }
    }
    
    if ($needsEncoding) {
        Write-Host ""
        Write-Host "WARNING: Your password contains special characters!" -ForegroundColor Yellow
        Write-Host "Special characters need to be URL encoded:" -ForegroundColor Yellow
        Write-Host "  @ becomes %40" -ForegroundColor White
        Write-Host "  # becomes %23" -ForegroundColor White
        Write-Host "  $ becomes %24" -ForegroundColor White
        Write-Host "  % becomes %25" -ForegroundColor White
        Write-Host "  / becomes %2F" -ForegroundColor White
        Write-Host "  : becomes %3A" -ForegroundColor White
        Write-Host ""
        
        $encode = Read-Host "Do you want to automatically encode special characters? (Y/N)"
        
        if ($encode -eq 'Y' -or $encode -eq 'y') {
            # URL encode the password
            $encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)
            $password = $encodedPassword
            Write-Host "Password encoded: $password" -ForegroundColor Green
        }
    }
    
    # Replace placeholder with actual password
    $newEnvContent = $envContent -replace "<db_password>", $password
    
    # Backup original .env
    Copy-Item ".env" ".env.backup" -Force
    Write-Host ""
    Write-Host "Backup created: .env.backup" -ForegroundColor Green
    
    # Write new content
    Set-Content ".env" $newEnvContent -NoNewline
    
    Write-Host "Password updated in .env file!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your MongoDB server (Ctrl+C then 'npm run dev:mongodb')" -ForegroundColor White
    Write-Host "2. Look for: '✅ MongoDB Connected Successfully'" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "Your .env file already has a password set." -ForegroundColor Green
    Write-Host ""
    Write-Host "Current DATABASE_URL:" -ForegroundColor Cyan
    $currentUrl = $envContent | Select-String -Pattern "DATABASE_URL=.*" | ForEach-Object { $_.Matches.Value }
    
    # Mask the password for security
    $maskedUrl = $currentUrl -replace "(mongodb\+srv://[^:]+:)([^@]+)(@.*)", '$1****$3'
    Write-Host $maskedUrl -ForegroundColor White
    Write-Host ""
    
    $update = Read-Host "Do you want to update the password? (Y/N)"
    
    if ($update -eq 'Y' -or $update -eq 'y') {
        $password = Read-Host "Enter new MongoDB password"
        
        if ([string]::IsNullOrWhiteSpace($password)) {
            Write-Host "ERROR: Password cannot be empty!" -ForegroundColor Red
            exit 1
        }
        
        # Replace password in URL
        $newEnvContent = $envContent -replace "(mongodb\+srv://[^:]+:)([^@]+)(@.*)", "`$1$password`$3"
        
        # Backup and save
        Copy-Item ".env" ".env.backup" -Force
        Set-Content ".env" $newEnvContent -NoNewline
        
        Write-Host ""
        Write-Host "Password updated!" -ForegroundColor Green
        Write-Host "Restart your server: npm run dev:mongodb" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
