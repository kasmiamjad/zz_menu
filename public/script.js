let menuData = null;
let currentCategory = 'all';

// game-icons:chili-pepper (via Iconify), inlined so it renders offline and recolors via CSS `color`
const SPICY_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M446.738 28.814c-25.117 13.687-48.889 42.68-61.957 71.809c-7.818-2.893-16.676-4.618-25.513-4.545c-14.73.121-29.385 5.227-39.008 18.168c.886.005 1.774.018 2.666.05c12.22.443 24.958 3.41 37.304 8.102c22.98 8.734 45.207 23.286 58.29 41.83c12.723-30.603-.83-45.203-17.569-55.43c11.733-25.618 34.789-53.49 54.4-64.177zM319.824 132.261a59 59 0 0 0-6.894.35c-11.725 1.322-19.854 5.705-24.686 14.477c-45.314 82.267-40.39 117.237-53.092 156.177c-6.35 19.47-17.347 39.092-40.322 63.21c-22.975 24.116-57.954 53.12-113.379 93.007c-12.743 9.171-20.766 16.8-24.03 21.39c-.686.967-.496.828-.773 1.417c2.1.465 6.218 1.262 13.534.709c9.923-.751 23.7-3.263 40.53-7.672c85.471-22.392 164.479-75.553 220.118-132.317c27.82-28.381 49.794-57.658 63.861-84.048s19.84-49.872 17.239-65.627c-3.273-19.817-29.295-43.162-58.096-54.11c-10.8-4.105-21.814-6.517-31.592-6.908a70 70 0 0 0-2.418-.055m1.977 17.813c1.725.06 3.385.555 4.967 1.533c-22.945 39.64-46.91 81.1-60.47 138.438c-22.95-11.989 25.686-141.007 55.503-139.971"/></svg>';

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

        // Filter out specific categories so their dishes don't show up in tabs or "All" view
        menuData.categories = menuData.categories.filter(category => 
            category.categoryName !== 'N/A' && 
            category.categoryName !== 'Main Dish' &&
            category.categoryName !== 'Ramadan - Iftar' &&
            category.categoryName !== 'Ramadan - Suhoor'
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

// A ".." in the source description is a manual marker meaning "this dish is spicy"
// (there's no spice-level field from the scraped API, so this is added directly
// in the description text on the hub.saaed.app side).
function isSpicy(description) {
    return !!description && description.includes('..');
}

function cleanDescription(description) {
    if (!description) return '';
    return description.replace(/\.\.+/g, '.').replace(/\s{2,}/g, ' ').trim();
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
    const spicy = isSpicy(dish.description);
    const displayDescription = cleanDescription(dish.description);

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
                <div class="dish-name-row">
                    <h3 class="dish-name">${dish.name}</h3>
                    ${spicy ? `<span class="spicy-badge" title="Spicy">${SPICY_ICON_SVG}</span>` : ''}
                </div>
                <div class="dish-price">${priceDisplay}</div>
                ${displayDescription ? `<p class="dish-description">${displayDescription}</p>` : ''}
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
    const modalSpicyBadge = document.getElementById('modal-spicy-badge');

    modalName.textContent = name;
    modalPriceBadge.textContent = `${category}`;
    modalDescription.textContent = cleanDescription(description) || 'Delicious dish from our menu';
    modalSpicyBadge.style.display = isSpicy(description) ? 'inline-block' : 'none';

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
