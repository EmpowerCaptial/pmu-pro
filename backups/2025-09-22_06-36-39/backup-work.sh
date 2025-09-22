#!/bin/bash

# PMU Pro Backup Script
# This script creates multiple backups of your work

echo "🔄 Creating comprehensive backup of PMU Pro..."

# 1. Git backup (push to GitHub)
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Backup: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

# 2. Create local backup folder
BACKUP_DIR="backups/$(date '+%Y-%m-%d_%H-%M-%S')"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating local backup in $BACKUP_DIR..."

# Copy all important files
cp -r app/ "$BACKUP_DIR/"
cp -r src/ "$BACKUP_DIR/"
cp -r prisma/ "$BACKUP_DIR/"
cp -r public/ "$BACKUP_DIR/"
cp -r scripts/ "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp tailwind.config.ts "$BACKUP_DIR/"
cp next.config.ts "$BACKUP_DIR/"
cp .env.local "$BACKUP_DIR/" 2>/dev/null || echo "No .env.local file"

# 3. Create deployment backup
echo "🚀 Creating deployment backup..."
vercel --prod --yes

# 4. Show backup status
echo "✅ Backup completed!"
echo "📊 Backup locations:"
echo "   - GitHub: https://github.com/EmpowerCaptial/pmu-pro"
echo "   - Live site: https://thepmuguide.com"
echo "   - Local backup: $BACKUP_DIR"

# 5. Show current status
echo "📋 Current project status:"
echo "   - Git status: $(git status --porcelain | wc -l) files changed"
echo "   - Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
echo "   - Branch: $(git branch --show-current)"
