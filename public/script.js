let menuData = null;
let currentCategory = 'all';

document.addEventListener("DOMContentLoaded", () => {
    const bannerImages = ['bg.jpeg', 'bg2.JPG', 'bg3.JPG', 'bg4.JPG'];
    const randomImg = bannerImages[Math.floor(Math.random() * bannerImages.length)];
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.src = `image/${randomImg}`;
    }
});

// Category icons mapping
// Category icons mapping - Premium selection
const categoryIcons = {
    'all': '<img src="image/ZZ_all_items.png" alt="All" style="object-fit: contain;">',
    'salad': '<img src="https://hub.saaed.app/uploads/img/1771078289_4-kachumer-salad.jpg" alt="Salad">',
    'soups-&-starters': '<img src="https://hub.saaed.app/uploads/img/1771083247_17-seafood-thermidor-soup.jpg" alt="Soups & Starters">',
    'charcoal-barbeque': '<img src="https://hub.saaed.app/uploads/img/1771075955_30-chicken-tikka.jpg" alt="Charcoal Barbeque">',
    'mughlai-curries': '<img src="https://hub.saaed.app/uploads/img/1771083567_57-chikcen-tikka-masala.jpg" alt="Mughlai Curries">',
    'beef-nihari': '<img src="https://hub.saaed.app/uploads/img/1771080197_88-zz-special-nihari.jpg" alt="Beef Nihari">',
    'tawa-specialities': '<img src="https://hub.saaed.app/uploads/img/1771075173_82-champ-masala.jpg" alt="Tawa Specialities">',
    'vegetables-&-lentils': '<img src="https://hub.saaed.app/uploads/img/1771082866_94-qasar-e-pukhtan.jpg" alt="Vegetables & Lentils">',
    'rice': '<img src="https://hub.saaed.app/uploads/img/1771078431_98-karachi-special-biryani.jpg" alt="Rice">',
    'tandoor': '<img src="https://hub.saaed.app/uploads/img/1771082746_107-plain-naan.jpg" alt="Tandoor">',
    'dessert': '<img src="https://hub.saaed.app/uploads/img/1771078798_117-lab-e-shireen.jpg" alt="Dessert">',
    'cold-beverages': '<img src="https://hub.saaed.app/uploads/img/1771077356_134-fresh-orange-juice.jpg" alt="Cold Beverages">',
    'hot-beverages': '<img src="https://hub.saaed.app/uploads/img/1771078461_137-karak-chai.jpg" alt="Hot Beverages">',
    'mocktails': '<img src="https://hub.saaed.app/uploads/img/1771081018_148-strawbarry-mojito.jpg" alt="Mocktails">',
    'smoothies-&-shakes': '<img src="https://hub.saaed.app/uploads/img/1771078945_152-lotus-creamy-shakes.jpg" alt="Smoothies & Shakes">',
    'cold-coffee': '<img src="https://hub.saaed.app/uploads/img/1771077867_159-hazelnut-macchiato.jpg" alt="Cold Coffee">',
    'hot-coffee': '<img src="https://hub.saaed.app/uploads/img/1771077153_165-flat-white.jpg" alt="Hot Coffee">',
    'close': '✕'
};

async function loadMenu() {
    try {
        const response = await fetch('/api/menu-data');
        menuData = await response.json();

        if (!menuData.categories || menuData.categories.length === 0) {
            document.getElementById('menu-container').innerHTML = '<div class="loading">No menu data available</div>';
            return;
        }

        // Filter out "N/A" and "Main Dish" categories so their dishes don't show up in tabs or "All" view
        menuData.categories = menuData.categories.filter(category => 
            category.categoryName !== 'N/A' && category.categoryName !== 'Main Dish'
        );

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

    const allIconContent = categoryIcons['all'] || '🍽️';
    const allIsImage = allIconContent.includes('<img');

    let tabsHTML = `
        <button class="tab active" data-category="all">
            <div class="tab-icon ${allIsImage ? 'has-image' : ''}">${allIconContent}</div>
            <span>All Items</span>
        </button>
    `;

    menuData.categories.forEach(category => {
        const categorySlug = category.categoryName.toLowerCase().replace(/\s+/g, '-');
        let iconContent = categoryIcons[categorySlug];
        let isImage = false;

        if (iconContent) {
            isImage = iconContent.includes('<img');
        } else if (category.dishes && category.dishes.length > 0 && category.dishes[0].image && category.dishes[0].image.startsWith('http')) {
            iconContent = `<img src="${category.dishes[0].image}" alt="${category.categoryName}">`;
            isImage = true;
        } else {
            iconContent = '🍽️';
        }

        tabsHTML += `
            <button class="tab" data-category="${categorySlug}">
                <div class="tab-icon ${isImage ? 'has-image' : ''}">${iconContent}</div>
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

    // Drag to scroll functionality
    let isDown = false;
    let startX;
    let scrollLeft;

    tabsContainer.style.cursor = 'grab';

    tabsContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        tabsContainer.style.cursor = 'grabbing';
        startX = e.pageX - tabsContainer.offsetLeft;
        scrollLeft = tabsContainer.scrollLeft;
    });

    tabsContainer.addEventListener('mouseleave', () => {
        isDown = false;
        tabsContainer.style.cursor = 'grab';
    });

    tabsContainer.addEventListener('mouseup', () => {
        isDown = false;
        tabsContainer.style.cursor = 'grab';
    });

    tabsContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Prevent text selection
        const x = e.pageX - tabsContainer.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        tabsContainer.scrollLeft = scrollLeft - walk;
    });
}

function escapeHtmlStr(str) {
    if (!str) return '';
    // Escape single quotes for use in onclick='...' attributes
    // Also escape double quotes just in case, though we use single quotes for arguments
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
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
    const rawPrice = dish.price ? dish.price.split('/')[0].trim() : '-';
    const priceNumber = rawPrice.replace('SAR', '').trim();
    const sarSymbol = `<span class="sar-symbol"></span>`;
    const priceDisplay = dish.price ? `${sarSymbol}${priceNumber}` : '-';

    return `
        <div class="dish-item" onclick="openDishModal('${escapeHtmlStr(dish.name)}', '${escapeHtmlStr(categoryName)}', '${escapeHtmlStr(dish.price)}', '${escapeHtmlStr(dish.description)}', '${escapeHtmlStr(dish.image)}')">
            <span class="dish-favorite">♡</span>
            <div class="dish-image-container">
                ${hasImage
            ? `<img src="${dish.image}" alt="${dish.name}" class="dish-image" onerror="this.parentElement.innerHTML='<div class=\\'dish-image-placeholder\\'>🍽️</div>'">`
            : '<div class="dish-image-placeholder">🍽️</div>'
        }
            </div>
            <div class="dish-details">
                <div class="dish-category">${categoryName}</div>
                <h3 class="dish-name">${dish.name}</h3>
                <div class="dish-price">${priceDisplay}</div>
                ${dish.description ? `<p class="dish-description">${dish.description}</p>` : ''}
            </div>
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

    // Format price: Extract numeric part (split on '/' to exclude quantity)
    const numericPrice = price ? price.split('/')[0].replace(/[^0-9.]/g, '').trim() : '0.00';
    modalPrice.innerHTML = `<span class="modal-sar-symbol"></span>${numericPrice}`;

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
