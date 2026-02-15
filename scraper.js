import fs from 'fs/promises';

const API_BASE = 'https://hub.saaed.app/api/product-catalogue/265/297';

/**
 * Strip HTML tags from a string and decode common HTML entities.
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Fetch JSON from a URL using the built-in fetch API.
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function scrapeMenu() {
  console.log('Fetching menu data from API...');

  // 1. Fetch categories
  const catResponse = await fetchJson(`${API_BASE}/categories`);
  const apiCategories = catResponse.data; // [{id, name, sub_categories, ...}]
  console.log(`Found ${apiCategories.length} categories`);

  // 2. Fetch ALL product pages
  let allProducts = [];
  let page = 1;
  let lastPage = 1;

  do {
    console.log(`  Fetching products page ${page}/${lastPage}...`);
    const prodResponse = await fetchJson(`${API_BASE}/products?page=${page}`);
    allProducts = allProducts.concat(prodResponse.data);
    lastPage = prodResponse.pagination.last_page;
    page++;
  } while (page <= lastPage);

  console.log(`Fetched ${allProducts.length} products total`);

  // 3. Group products by category
  const categoryMap = new Map();
  for (const cat of apiCategories) {
    categoryMap.set(cat.id, { categoryName: cat.name, dishes: [] });
  }

  for (const product of allProducts) {
    if (product.is_inactive || product.not_for_selling) continue;

    const catId = product.category?.category_id;
    const catName = product.category?.name || 'Other';

    // Get the sell price (tax-inclusive)
    let price = '';
    try {
      const sellPrice = parseFloat(
        product.product_variations[0].variations[0].price.sell_price_inc_tax
      );
      const unitName = product.unit?.name || '1';
      price = `SAR ${sellPrice.toFixed(2)} / ${unitName}`;
    } catch {
      price = '';
    }
0.2
    // Get description (strip HTML tags)
    const description = stripHtml(product.product_description || '');

    const dish = {
      name: product.name,
      category: catName,
      price,
      description,
      image: product.image_url || ''
    };
0.2
    if (categoryMap.has(catId)) {
      categoryMap.get(catId).dishes.push(dish);
    } else {
      // Fallback: create a new category entry
      categoryMap.set(catId, { categoryName: catName, dishes: [dish] });
    }
  }

  // 4. Build final menu data
  const menuData = {
    restaurantName: 'Z & Z Restaurant',
    categories: Array.from(categoryMap.values())
  };

  console.log('\nMenu data extracted successfully!');
  console.log(`Total categories: ${menuData.categories.length}`);
  menuData.categories.forEach(cat => {
    console.log(`  - ${cat.categoryName}: ${cat.dishes.length} dishes`);
  });

  // 5. Save to JSON
  await fs.writeFile('menu-data.json', JSON.stringify(menuData, null, 2));
  console.log('\n✓ Data saved to menu-data.json');

  return menuData;
}

scrapeMenu().catch(console.error);
