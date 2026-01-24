#!/bin/bash

# Setup script for automated menu scraping on VPS
# This script sets up a cron job to run the scraper daily

echo "Setting up automated menu scraper..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create a log directory
mkdir -p "$SCRIPT_DIR/logs"

# Create the cron job script
cat > "$SCRIPT_DIR/run-scraper.sh" << 'EOF'
#!/bin/bash

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Log file with timestamp
LOG_FILE="$SCRIPT_DIR/logs/scraper-$(date +%Y-%m-%d).log"

# Run the scraper
echo "=== Scraper started at $(date) ===" >> "$LOG_FILE"
npm run scrape >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "=== Scraper completed successfully at $(date) ===" >> "$LOG_FILE"
    
    # Run health check
    echo "=== Running health check ===" >> "$LOG_FILE"
    npm run monitor >> "$LOG_FILE" 2>&1
    HEALTH_CODE=$?
    
    if [ $HEALTH_CODE -eq 0 ]; then
        echo "=== Health check passed ===" >> "$LOG_FILE"
    else
        echo "=== Health check FAILED - Data quality issues detected ===" >> "$LOG_FILE"
    fi
else
    echo "=== Scraper failed with exit code $EXIT_CODE at $(date) ===" >> "$LOG_FILE"
fi

# Keep only last 7 days of logs
find "$SCRIPT_DIR/logs" -name "scraper-*.log" -mtime +7 -delete

exit $EXIT_CODE
EOF

# Make the script executable
chmod +x "$SCRIPT_DIR/run-scraper.sh"

echo "✓ Created run-scraper.sh"

# Display cron job instructions
echo ""
echo "=========================================="
echo "CRON JOB SETUP INSTRUCTIONS"
echo "=========================================="
echo ""
echo "To run the scraper daily at 2 AM, add this to your crontab:"
echo ""
echo "0 2 * * * $SCRIPT_DIR/run-scraper.sh"
echo ""
echo "To edit your crontab, run:"
echo "  crontab -e"
echo ""
echo "Other schedule examples:"
echo "  Every 6 hours:    0 */6 * * * $SCRIPT_DIR/run-scraper.sh"
echo "  Every 12 hours:   0 */12 * * * $SCRIPT_DIR/run-scraper.sh"
echo "  Twice daily:      0 2,14 * * * $SCRIPT_DIR/run-scraper.sh"
echo "  Every day at 3AM: 0 3 * * * $SCRIPT_DIR/run-scraper.sh"
echo ""
echo "Logs will be saved to: $SCRIPT_DIR/logs/"
echo ""
echo "=========================================="
