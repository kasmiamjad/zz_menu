import fs from 'fs/promises';

/**
 * Scraper Health Monitor
 * Checks if the scraper is working correctly by analyzing menu-data.json
 * Run this after scraping to verify data quality
 */

async function checkScraperHealth() {
    console.log('===========================================');
    console.log('       SCRAPER HEALTH CHECK');
    console.log('===========================================\n');
    
    try {
        // Read menu data
        const data = await fs.readFile('menu-data.json', 'utf-8');
        const menu = JSON.parse(data);
        
        // Calculate statistics
        const totalCategories = menu.categories.length;
        const totalDishes = menu.categories.reduce(
            (sum, cat) => sum + cat.dishes.length, 
            0
        );
        const categoriesWithDishes = menu.categories.filter(
            cat => cat.dishes.length > 0
        ).length;
        const dishesWithPrices = menu.categories.reduce(
            (sum, cat) => sum + cat.dishes.filter(d => d.price && d.price !== '-').length,
            0
        );
        const dishesWithImages = menu.categories.reduce(
            (sum, cat) => sum + cat.dishes.filter(d => d.image && d.image.startsWith('http')).length,
            0
        );
        
        // Display statistics
        console.log('📊 STATISTICS:');
        console.log(`   Restaurant: ${menu.restaurantName || 'Unknown'}`);
        console.log(`   Total Categories: ${totalCategories}`);
        console.log(`   Categories with Dishes: ${categoriesWithDishes}`);
        console.log(`   Total Dishes: ${totalDishes}`);
        console.log(`   Dishes with Prices: ${dishesWithPrices}`);
        console.log(`   Dishes with Images: ${dishesWithImages}`);
        console.log('');
        
        // Health checks
        const checks = {
            'Has restaurant name': menu.restaurantName?.length > 0,
            'Has categories': totalCategories > 0,
            'Has dishes': totalDishes > 0,
            'Has enough dishes (>5)': totalDishes > 5,
            'Most categories have dishes': categoriesWithDishes >= totalCategories * 0.3,
            'Most dishes have prices': dishesWithPrices >= totalDishes * 0.8,
            'All categories valid': menu.categories.every(
                cat => cat.categoryName && Array.isArray(cat.dishes)
            ),
            'No duplicate dish names': checkNoDuplicates(menu)
        };
        
        // Display health checks
        console.log('🏥 HEALTH CHECKS:');
        let passedChecks = 0;
        Object.entries(checks).forEach(([check, passed]) => {
            const icon = passed ? '✓' : '✗';
            const status = passed ? 'PASS' : 'FAIL';
            console.log(`   ${icon} ${check}: ${status}`);
            if (passed) passedChecks++;
        });
        console.log('');
        
        // Category breakdown
        console.log('📋 CATEGORY BREAKDOWN:');
        menu.categories.forEach(cat => {
            const icon = cat.dishes.length > 0 ? '✓' : '✗';
            console.log(`   ${icon} ${cat.categoryName}: ${cat.dishes.length} dishes`);
        });
        console.log('');
        
        // Overall status
        const totalChecks = Object.keys(checks).length;
        const healthPercentage = Math.round((passedChecks / totalChecks) * 100);
        
        let status, icon;
        if (healthPercentage === 100) {
            status = 'EXCELLENT';
            icon = '🟢';
        } else if (healthPercentage >= 80) {
            status = 'GOOD';
            icon = '🟡';
        } else if (healthPercentage >= 60) {
            status = 'WARNING';
            icon = '🟠';
        } else {
            status = 'CRITICAL';
            icon = '🔴';
        }
        
        console.log('===========================================');
        console.log(`${icon} OVERALL STATUS: ${status} (${passedChecks}/${totalChecks} checks passed)`);
        console.log('===========================================\n');
        
        // Recommendations
        if (healthPercentage < 100) {
            console.log('💡 RECOMMENDATIONS:');
            if (totalDishes === 0) {
                console.log('   ⚠️  CRITICAL: No dishes found!');
                console.log('   → The website structure may have changed');
                console.log('   → Run: node scraper-debug.js');
                console.log('   → Check logs/scraper-*.log for errors');
            }
            if (totalDishes > 0 && totalDishes < 10) {
                console.log('   ⚠️  WARNING: Very few dishes found');
                console.log('   → Expected more dishes, scraper may be incomplete');
                console.log('   → Verify selectors in scraper.js');
            }
            if (dishesWithPrices < totalDishes * 0.8) {
                console.log('   ⚠️  WARNING: Many dishes missing prices');
                console.log('   → Check price extraction logic in scraper.js');
            }
            if (!menu.restaurantName) {
                console.log('   ⚠️  WARNING: Restaurant name not found');
                console.log('   → Check restaurant name selector');
            }
            console.log('');
        }
        
        // Exit code
        process.exit(healthPercentage >= 80 ? 0 : 1);
        
    } catch (error) {
        console.log('🔴 CRITICAL ERROR: Cannot read or parse menu-data.json');
        console.log(`   Error: ${error.message}`);
        console.log('');
        console.log('💡 RECOMMENDATIONS:');
        console.log('   → Check if menu-data.json exists');
        console.log('   → Run: npm run scrape');
        console.log('   → Check logs/scraper-*.log for errors');
        console.log('');
        process.exit(1);
    }
}

function checkNoDuplicates(menu) {
    const allDishNames = [];
    menu.categories.forEach(cat => {
        cat.dishes.forEach(dish => {
            allDishNames.push(dish.name);
        });
    });
    
    const uniqueNames = new Set(allDishNames);
    return uniqueNames.size === allDishNames.length;
}

// Run the health check
checkScraperHealth();
