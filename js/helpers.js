/* ═══════════════════════════════════════════
   SHARED HELPERS & UTILITIES
═══════════════════════════════════════════ */

// Global products state
let allProducts = [];

// Shared data loading
async function loadProductsData(path = './data/products.json') {
  try {
    const response = await fetch(path);
    const data = await response.json();
    allProducts = data.products;
    console.log('✅ Loaded ' + allProducts.length + ' products');
    return allProducts;
  } catch (error) {
    console.error('❌ Error loading products:', error);
    return [];
  }
}

// Calculate final price with discount
function calculateFinalPrice(product) {
  if (!product) return 0;
  return product.isOnSale 
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price;
}

// Create product card HTML with wishlist support
function createProductCard(product, options = {}) {
  const { showWishlist = false, favorites = [] } = options;
  
  const finalPrice = calculateFinalPrice(product);
  const wished = showWishlist ? favorites.includes(product.id) : false;

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

  const wishlistBtn = showWishlist 
    ? `<button class="favorite-btn ${wished ? 'active' : ''}" data-id="${product.id}" title="Add to Wishlist">
        <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
      </button>`
    : `<button class="favorite-btn" data-id="${product.id}" title="Add to Wishlist">
        <i class="fa-regular fa-heart"></i>
      </button>`;

  const cardHTML = `
    <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
      <div class="product-img">
        ${wishlistBtn}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
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

  return cardHTML;
}

// Render products to container
function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }

  container.innerHTML = products.map(p => createProductCard(p)).join('');
  
  // Event delegation in main.js handles all .add-to-cart buttons
  // including newly rendered ones, so no need to re-attach here
}

// Get new arrivals
function getNewArrivals() {
  return allProducts.filter(p => p.isNew && p.isInStock);
}

// Get limited offers
function getLimitedOffers() {
  return allProducts.filter(p => p.isOnSale && p.isInStock)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);
}

// Get featured products (isFeatured = true)
function getFeaturedProducts() {
  return allProducts.filter(p => p.isFeatured).slice(0, 4);
}

// Render featured products
function renderFeaturedProducts() {
  const container = document.getElementById('featured-grid');
  if (!container) return;

  const featured = getFeaturedProducts();
  
  container.innerHTML = featured.map(p => {
    const finalPrice = calculateFinalPrice(p);
    return `
      <div class="featured-card" data-product-id="${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <div class="featured-overlay">
          <span class="featured-tag">${p.isLimited ? 'Limited Edition' : p.isOnSale ? 'On Sale' : 'Featured'}</span>
          <span class="featured-brand">${p.brand}</span>
          <h3 class="featured-name">${p.name}</h3>
          <span class="featured-price">$${finalPrice}</span>
          <a href="pages/product-detail.html?id=${p.id}" class="featured-btn">Shop Now <i class="fa-solid fa-arrow-right-long"></i></a>
        </div>
      </div>
    `;
  }).join('');

  // Add click handler for featured cards
  document.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking the Shop Now button (it has its own link)
      if (e.target.closest('.featured-btn')) {
        return;
      }
      
      if (card.dataset.productId) {
        window.location.href = `pages/product-detail.html?id=${card.dataset.productId}`;
      }
    });
  });
}

/* ═══════════════════════════════════════════
   CART STATE & FUNCTIONS
═══════════════════════════════════════════ */

let cart = [];

// Update cart count badge
function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = total;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }
}

// Calculate total cart price
function calcTotal() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return parseFloat(total.toFixed(2));
}

// Render cart items
function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total-price');
  
  if (!container || !totalEl) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Your cart is empty.<br>Add some kicks!</p>
      </div>`;
    totalEl.textContent = '$0';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-details">
        <span class="cart-item-brand">${item.brand}</span>
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-number">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeItem('${item.id}')" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>`).join('');

  totalEl.textContent = `$${calcTotal().toFixed(2)}`;
}

// Change item quantity
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

// Remove item from cart
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

// Open cart sidebar
function openCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

// Close cart sidebar
function closeCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Add to cart event listener (uses event delegation)
function attachAddToCartListeners() {
  // Event delegation for add-to-cart buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    
    e.stopPropagation();
    if (btn.disabled) return;
    
    const { name, brand, price, img } = btn.dataset;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, brand, price: Number(price), img, qty: 1 });
    }
    updateCartCount();
    renderCart();
    openCart();
  });
}
