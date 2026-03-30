/* ═══════════════════════════════════════════
   PRODUCTS LOADER - Fetch from JSON
═══════════════════════════════════════════ */

let allProducts = [];

// Fetch products from JSON
async function loadProducts() {
  try {
    const response = await fetch('./data/products.json');
    const data = await response.json();
    allProducts = data.products;
    console.log('✅ Loaded ' + allProducts.length + ' products');
    return allProducts;
  } catch (error) {
    console.error('❌ Error loading products:', error);
    return [];
  }
}

// Create product card HTML
function createProductCard(product) {
  const finalPrice = product.isOnSale 
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price;

  const saleTag = product.isOnSale 
    ? `<span class="sale-tag">-${product.discount}%</span>` 
    : '';

  const newBadge = product.isNew 
    ? `<span class="new-badge"><i class="fa-solid fa-star"></i> NEW</span>` 
    : '';

  const outOfStock = !product.isInStock 
    ? `<div class="out-of-stock">Out of Stock</div>` 
    : '';

  const priceHTML = product.isOnSale 
    ? `<span class="orig-price">$${product.price}</span><span class="sale-price">$${finalPrice}</span>`
    : `<span>$${product.price}</span>`;

  const ratingHTML = `
    <div class="product-rating">
      <i class="fa-solid fa-star"></i>
      <span>${product.rating}</span>
      <span class="reviews">(${product.reviews})</span>
    </div>
  `;

  return `
    <div class="product-card" data-category="${product.category}">
      <div class="product-img">
        <button class="favorite-btn" data-id="${product.id}" title="Add to Wishlist">
          <i class="fa-regular fa-heart"></i>
        </button>
        <img src="${product.image}" alt="${product.name}">
        ${saleTag}
        ${newBadge}
        ${outOfStock}
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-name">${product.name}</h3>
        ${ratingHTML}
        <span class="product-price">${priceHTML}</span>
        <button class="add-to-cart" 
                data-name="${product.name}" 
                data-brand="${product.brand}" 
                data-price="${finalPrice}" 
                data-img="${product.image}"
                data-category="${product.category}"
                ${!product.isInStock ? 'disabled' : ''}>
          ${product.isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  `;
}

// Render products to container
function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }

  container.innerHTML = products.map(p => createProductCard(p)).join('');
  
  // Re-attach listeners
  attachAddToCartListeners();
}

// Get new arrivals (isNew = true)
function getNewArrivals() {
  return allProducts.filter(p => p.isNew && p.isInStock);
}

// Get limited offers (isOnSale = true)
function getLimitedOffers() {
  return allProducts.filter(p => p.isOnSale && p.isInStock) .sort((a, b) => b.discount - a.discount).slice(0, 4);
}


// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  await loadProducts();
  const newArrivals = getNewArrivals();
  renderProducts(newArrivals, 'products-grid');   

  const limitedOffers = getLimitedOffers();
  renderProducts(limitedOffers, 'limited-offers-grid');

});


