let menuData = null;
let currentCategory = 'all';

// Category icons mapping
// Category icons mapping - Premium selection
const categoryIcons = {
    'all': '✨',
    'main-dish': '🍽️',
    'salad': '🥗',
    'soups-&-starters': '🥣',
    'charcoal-barbeque': '🔥',
    'mughlai-curries': '🥘',
    'beef-nihari': '🍖',
    'tawa-specialities': '🍳',
    'vegetables-&-lentils': '🍃',
    'rice': '🍚',
    'tandoor': '🫓',
    'dessert': '🍰',
    'cold-beverages': '🍹',
    'hot-beverages': '☕',
    'close': '✕'
};

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

    let tabsHTML = `
        <button class="tab active" data-category="all">
            <div class="tab-icon">${categoryIcons['all']}</div>
            <span>All Items</span>
        </button>
    `;

    menuData.categories.forEach(category => {
        const categorySlug = category.categoryName.toLowerCase().replace(/\s+/g, '-');
        const icon = categoryIcons[categorySlug] || '🍽️';
        tabsHTML += `
            <button class="tab" data-category="${categorySlug}">
                <div class="tab-icon">${icon}</div>
                <span>${category.categoryName}</span>
            </button>
        `;
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
                <div class="dishes-list">
        `;

        allDishes.forEach(dish => {
            html += renderDishItem(dish, dish.categoryName);
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
                html += '<div class="dishes-list">';

                category.dishes.forEach(dish => {
                    html += renderDishItem(dish, category.categoryName);
                });

                html += '</div>';
            }

            html += '</section>';
        });
    }

    menuContainer.innerHTML = html;
}

function renderDishItem(dish, categoryName) {
    const hasImage = dish.image && dish.image.startsWith('http');

    return `
        <div class="dish-item" onclick="openDishModal('${dish.name.replace(/'/g, "\\'")}', '${categoryName}', '${dish.price}', '${dish.description || ''}', '${dish.image}')">
            <span class="dish-favorite">♡</span>
            <div class="dish-image-container">
                ${hasImage
            ? `<img src="${dish.image}" alt="${dish.name}" class="dish-image" onerror="this.parentElement.innerHTML='<div class=\\'dish-image-placeholder\\'>🍽️</div>'">`
            : '<div class="dish-image-placeholder">🍽️</div>'
        }
            </div>
            <div class="dish-details">
                <h3 class="dish-name">${dish.name}</h3>
                <div class="dish-price">${dish.price ? dish.price.split('/')[0].trim() : '-'}</div>
                ${dish.description ? `<p class="dish-description">${dish.description}</p>` : ''}
            </div>
            <div class="dish-add">+</div>
        </div>
    `;
}

function openDishModal(name, category, price, description, image) {
    const modal = document.getElementById('dish-modal');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-dish-name');
    const modalPriceBadge = document.getElementById('modal-price-badge');
    const modalDescription = document.getElementById('modal-dish-description');
    const modalPrice = document.getElementById('modal-dish-price');

    modalName.textContent = name;
    modalPriceBadge.textContent = `${category}`;
    modalDescription.textContent = description || 'Delicious dish from our menu';
    modalPrice.textContent = price || '-';

    if (image && image.startsWith('http')) {
        modalImage.src = image;
    } else {
        modalImage.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDishModal() {
    const modal = document.getElementById('dish-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Modal event listeners
document.getElementById('modal-close').addEventListener('click', closeDishModal);
document.getElementById('dish-modal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeDishModal();
    }
});

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
