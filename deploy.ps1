# WC2026 Predictor - Deploy Script
# Usage: .\deploy.ps1 "your commit message"

param([string]$msg = "update")

Write-Host ""
Write-Host "WC2026 Deploy Starting..." -ForegroundColor Yellow
Write-Host ""

git add -A
if (-not $?) { Write-Host "Git add failed" -ForegroundColor Red; exit 1 }

git commit -m $msg
if (-not $?) { Write-Host "Nothing new to commit" -ForegroundColor Yellow }

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main
if (-not $?) { Write-Host "Push failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
npx vercel --prod

Write-Host ""
Write-Host "Done! App is live at project-iq0ui.vercel.app" -ForegroundColor Green
Write-Host ""
