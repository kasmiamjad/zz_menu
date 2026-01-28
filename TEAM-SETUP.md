# Team Member Setup Guide

## Prerequisites
- Git installed
- Node.js 18+ installed
- GitHub/GitLab account

## Getting Started

### 1. Clone the Repository

**HTTPS:**
```bash
git clone https://github.com/YOUR-USERNAME/menu-scraper.git
cd menu-scraper
```

**SSH (if you have SSH key set up):**
```bash
git clone git@github.com:YOUR-USERNAME/menu-scraper.git
cd menu-scraper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Test the Scraper

```bash
npm run scrape
```

This will create `menu-data.json` with the scraped menu data.

### 4. Run the Web Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Development Workflow

### Making Changes

1. **Create a new branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

3. **Test your changes:**
```bash
npm run scrape
npm run dev
```

4. **Commit your changes:**
```bash
git add .
git commit -m "Description of your changes"
```

5. **Push to GitHub:**
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request** on GitHub

### Pulling Latest Changes

```bash
git checkout main
git pull origin main
```

---

## Important Files to Read

1. **README.md** - User documentation
2. **SYSTEM-DOCUMENTATION.md** - Complete system architecture
3. **SCRAPER-MAINTENANCE.md** - How to fix broken scrapers

---

## Common Commands

```bash
# Check status
git status

# See what changed
git diff

# View commit history
git log --oneline

# Switch branches
git checkout branch-name

# Update your branch with main
git checkout your-branch
git merge main

# Discard local changes
git checkout -- filename
```

---

## Troubleshooting

### "Permission denied" when cloning
- Make sure you've been added as a collaborator
- Check your GitHub authentication

### "npm install" fails
- Make sure Node.js 18+ is installed: `node -v`
- Try: `npm cache clean --force`
- Then: `npm install`

### Scraper fails
- Check logs: `logs/scraper-*.log`
- Run debug: `node scraper-debug.js`
- See SCRAPER-MAINTENANCE.md

---

## Need Help?

1. Check documentation files
2. Ask in team chat
3. Create an issue on GitHub

---

## Repository Structure

```
menu-scraper/
├── scraper.js              # Main scraping logic
├── server.js               # Web server
├── index.html              # Frontend
├── script.js               # Frontend logic
├── style.css               # Styling
├── menu-data.json          # Scraped data (generated)
├── package.json            # Dependencies
├── README.md               # User docs
├── SYSTEM-DOCUMENTATION.md # System architecture
└── SCRAPER-MAINTENANCE.md  # Maintenance guide
```

---

**Welcome to the team! 🎉**
