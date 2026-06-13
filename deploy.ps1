# WC2026 Predictor — Deploy Script
# Run this from the project folder: .\deploy.ps1 "your commit message"

param([string]$msg = "update")

Write-Host "`n⚽ WC2026 Deploy Starting...`n" -ForegroundColor Yellow

# Stage all changes
git add -A
if (-not $?) { Write-Host "Git add failed" -ForegroundColor Red; exit 1 }

# Commit
git commit -m $msg
if (-not $?) { Write-Host "Nothing to commit or commit failed" -ForegroundColor Yellow }

# Push to GitHub
Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main
if (-not $?) { Write-Host "Push failed" -ForegroundColor Red; exit 1 }

# Deploy to Vercel production
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Cyan
npx vercel --prod

Write-Host "`n✅ Done! Check https://project-iq0ui.vercel.app`n" -ForegroundColor Green
