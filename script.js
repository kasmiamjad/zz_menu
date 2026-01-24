let menuData = null;
let currentCategory = 'all';

async function loadMenu() {
    try {
        const response = await fetch('menu-data.json');
        menuData = await response.json();
        
        // Set restaurant name
        document.getElementById('restaurant-name').textContent = menuData.restaurantName || 'Restaurant Menu';
        
        if (!menuData.categories || menuData.categories.length === 0) {
            document.getElementById('menu-container').innerHTML = '<div class="loading">No menu data available</div>';
            return;
        }
        
        // Build category tabs
        buildTabs();
        
        // Display all items initially
        displayMenu('all');
        
        // Setup search
        setupSearch();
        
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menu-container').innerHTML = 
            '<div class="loading">Error loading menu data. Make sure to run "npm run scrape" first!</div>';
    }
}

function buildTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    
    let tabsHTML = '<button class="tab active" data-category="all">All Items</button>';
    
    menuData.categories.forEach(category => {
        const categorySlug = category.categoryName.toLowerCase().replace(/\s+/g, '-');
        tabsHTML += `<button class="tab" data-category="${categorySlug}">${category.categoryName}</button>`;
    });
    
    tabsContainer.innerHTML = tabsHTML;
    
    // Add click handlers
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-category');
            currentCategory = category;
            displayMenu(category);
        });
    });
}

function displayMenu(categoryFilter = 'all', searchQuery = '') {
    const menuContainer = document.getElementById('menu-container');
    
    let filteredCategories = menuData.categories;
    
    // Filter by category
    if (categoryFilter !== 'all') {
        filteredCategories = menuData.categories.filter(cat => 
            cat.categoryName.toLowerCase().replace(/\s+/g, '-') === categoryFilter
        );
    }
    
    // Filter by search
    if (searchQuery) {
        filteredCategories = filteredCategories.map(cat => ({
            ...cat,
            dishes: cat.dishes.filter(dish => 
                dish.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.dishes.length > 0);
    }
    
    if (filteredCategories.length === 0) {
        menuContainer.innerHTML = `
            <div class="no-results">
                <h3>No dishes found</h3>
                <p>Try a different search or category</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Special handling for "All Items" - show all dishes without category sections
    if (categoryFilter === 'all') {
        const allDishes = [];
        filteredCategories.forEach(cat => {
            cat.dishes.forEach(dish => {
                allDishes.push({
                    ...dish,
                    categoryName: cat.categoryName
                });
            });
        });
        
        if (allDishes.length === 0) {
            menuContainer.innerHTML = `
                <div class="no-results">
                    <h3>No dishes available</h3>
                    <p>Check back later for menu items</p>
                </div>
            `;
            return;
        }
        
        html += `
            <section class="category-section">
                <div class="category-header">
                    <h2 class="category-title">All Items</h2>
                    <span class="category-count">${allDishes.length} items</span>
                </div>
                <div class="dishes-grid">
        `;
        
        allDishes.forEach(dish => {
            const hasImage = dish.image && dish.image.startsWith('http');
            
            html += `
                <div class="dish-card">
                    <div class="dish-image-container">
                        ${hasImage 
                            ? `<img src="${dish.image}" alt="${dish.name}" class="dish-image" onerror="this.parentElement.innerHTML='<div class=\\'dish-image-placeholder\\'>🍽️</div>'">` 
                            : '<div class="dish-image-placeholder">🍽️</div>'
                        }
                    </div>
                    <div class="dish-content">
                        <div class="dish-category">${dish.categoryName}</div>
                        <h3 class="dish-name">${dish.name}</h3>
                        ${dish.description ? `<p class="dish-description">${dish.description}</p>` : ''}
                        <div class="dish-footer">
                            ${dish.price ? `<div class="dish-price">${dish.price}</div>` : '<div class="dish-price">-</div>'}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </section>
        `;
    } else {
        // Show individual category
        filteredCategories.forEach(category => {
            html += `
                <section class="category-section">
                    <div class="category-header">
                        <h2 class="category-title">${category.categoryName}</h2>
                        <span class="category-count">${category.dishes.length} items</span>
                    </div>
            `;
            
            if (category.dishes.length === 0) {
                html += `
                    <div class="no-items-message">
                        <p>Items not available</p>
                    </div>
                `;
            } else {
                html += '<div class="dishes-grid">';
                
                category.dishes.forEach(dish => {
                    const hasImage = dish.image && dish.image.startsWith('http');
                    
                    html += `
                        <div class="dish-card">
                            <div class="dish-image-container">
                                ${hasImage 
                                    ? `<img src="${dish.image}" alt="${dish.name}" class="dish-image" onerror="this.parentElement.innerHTML='<div class=\\'dish-image-placeholder\\'>🍽️</div>'">` 
                                    : '<div class="dish-image-placeholder">🍽️</div>'
                                }
                            </div>
                            <div class="dish-content">
                                <div class="dish-category">${category.categoryName}</div>
                                <h3 class="dish-name">${dish.name}</h3>
                                ${dish.description ? `<p class="dish-description">${dish.description}</p>` : ''}
                                <div class="dish-footer">
                                    ${dish.price ? `<div class="dish-price">${dish.price}</div>` : '<div class="dish-price">-</div>'}
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
            }
            
            html += '</section>';
        });
    }
    
    menuContainer.innerHTML = html;
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            displayMenu(currentCategory, e.target.value);
        }, 300);
    });
}

loadMenu();
