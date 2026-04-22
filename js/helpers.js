/* ═══════════════════════════════════════════
   SHARED HELPERS & UTILITIES
═══════════════════════════════════════════ */
 
let allProducts = [];
let cart        = [];
let favorites   = [];
 
/* ═══════════════════════════════════════════
   PRODUCTS — load & helpers
═══════════════════════════════════════════ */
 
async function loadProductsData(path) {
  path = path || './data/products.json';
  try {
    const response = await fetch(path);
    const data     = await response.json();
    allProducts    = data.products;
    console.log('✅ Loaded ' + allProducts.length + ' products');
    return allProducts;
  } catch (error) {
    console.error('❌ Error loading products:', error);
    return [];
  }
}
 
function calculateFinalPrice(product) {
  if (!product) return 0;
  return product.isOnSale
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price;
}
 
function createProductCard(product) {
  const finalPrice = calculateFinalPrice(product);
  const wished     = favorites.includes(product.id);
 
  return `
    <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
      <div class="product-img">
        <button class="favorite-btn ${wished ? 'active' : ''}" data-id="${product.id}" title="Add to Wishlist">
          <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
        </button>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.isOnSale  ? `<span class="sale-tag">-${product.discount}%</span>` : ''}
        ${product.isNew     ? `<span class="new-badge"><i class="fa-solid fa-star"></i> NEW</span>` : ''}
        ${!product.isInStock ? `<div class="out-of-stock">Out of Stock</div>` : ''}
      </div>
      <div class="product-info">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <i class="fa-solid fa-star"></i>
          <span>${product.rating}</span>
          <span class="reviews">(${product.reviews})</span>
        </div>
        <span class="product-price">
          ${product.isOnSale
            ? `<span class="orig-price">$${product.price}</span><span class="sale-price">$${finalPrice}</span>`
            : `<span>$${product.price}</span>`}
        </span>
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
    </div>`;
}
 
function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = products.map(p => createProductCard(p)).join('');
}
 
function getNewArrivals() {
  return allProducts.filter(p => p.isNew && p.isInStock);
}
 
function getLimitedOffers() {
  return allProducts.filter(p => p.isOnSale && p.isInStock)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);
}
 
function getFeaturedProducts() {
  return allProducts.filter(p => p.isFeatured).slice(0, 4);
}
 
function renderFeaturedProducts() {
  const container = document.getElementById('featured-grid');
  if (!container) return;
 
  container.innerHTML = getFeaturedProducts().map(p => {
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
      </div>`;
  }).join('');
 
  document.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.featured-btn')) return;
      if (card.dataset.productId) {
        window.location.href = 'pages/product-detail.html?id=' + card.dataset.productId;
      }
    });
  });
}
 
/* ═══════════════════════════════════════════
   CART
═══════════════════════════════════════════ */
 
function updateCartCount() {
  const total = cart.reduce(function (s, i) { return s + i.qty; }, 0);
  const el    = document.getElementById('cart-count');
  if (el) {
    el.textContent = total;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }
}
 
function calcTotal() {
  return parseFloat(cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0).toFixed(2));
}
 
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
 
  totalEl.textContent = '$' + calcTotal().toFixed(2);
}
 
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}
 
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}
 
function openCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
 
function closeCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
 
function attachAddToCartListeners() {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    e.stopPropagation();
    if (btn.disabled) return;
 
    const name  = btn.dataset.name;
    const brand = btn.dataset.brand;
    const price = btn.dataset.price;
    const img   = btn.dataset.img;
    const id    = name.toLowerCase().replace(/\s+/g, '-');
 
    const existing = cart.find(function (i) { return i.id === id; });
    if (existing) {
      existing.qty++;
      showToast('Cart Updated', name + ' · qty ' + existing.qty, 'info');
    } else {
      cart.push({ id: id, name: name, brand: brand, price: Number(price), img: img, qty: 1 });
      showToast('Added to Cart', name + ' · $' + price, 'success');
    }
 
    updateCartCount();
    renderCart();
  });
}
 
/* ═══════════════════════════════════════════
   WISHLIST
═══════════════════════════════════════════ */
 
function updateWishlistCount() {
  const el = document.getElementById('wishlist-count');
  if (el) {
    el.textContent = favorites.length;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }
}
 
function toggleWishlist() {
  renderWishlistItems();
  document.getElementById('wishlist-sidebar').classList.toggle('open');
  document.getElementById('wishlist-overlay').classList.toggle('open');
}
 
function toggleFavorite(productId) {
  productId        = Number(productId);
  const btn        = document.querySelector('.favorite-btn[data-id="' + productId + '"]');
  const heartIcon  = btn ? btn.querySelector('i') : null;
 
  if (favorites.includes(productId)) {
    favorites = favorites.filter(function (id) { return id !== productId; });
    if (heartIcon) heartIcon.classList.replace('fa-solid', 'fa-regular');
    if (btn) btn.classList.remove('active');
    showToast('Removed from Wishlist', '', 'info');
  } else {
    favorites.push(productId);
    if (heartIcon) heartIcon.classList.replace('fa-regular', 'fa-solid');
    if (btn) btn.classList.add('active');
    showToast('Added to Wishlist', 'Saved to your favourites', 'wish');
  }
 
  updateWishlistCount();
  renderWishlistItems();
  if (typeof updateWishlistButton === 'function') updateWishlistButton();
}
 
function renderWishlistItems() {
  const container = document.getElementById('wishlist-items');
  if (!container) return;
 
  if (!favorites.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-regular fa-heart" style="font-size:2.5rem;margin-bottom:1rem;opacity:.2;"></i>
        <p>Your wishlist is empty!</p>
      </div>`;
    return;
  }
 
  const favProducts = allProducts.filter(p => favorites.includes(Number(p.id)));
  container.innerHTML = favProducts.map(item => `
    <div class="wishlist-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="wishlist-item-info">
        <span class="wishlist-item-name">${item.name}</span>
        <span class="product-price">$${item.price}</span>
      </div>
      <button class="cart-item-remove" onclick="toggleFavorite(${item.id})" title="Remove">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>`).join('');
}
 
/* ═══════════════════════════════════════════
   MOVE ALL WISHLIST → CART
═══════════════════════════════════════════ */
 
document.addEventListener('DOMContentLoaded', function () {
  const moveBtn = document.getElementById('move-all-to-cart');
  if (moveBtn) {
    moveBtn.addEventListener('click', function () {
      if (!favorites.length) return;
 
      favorites.forEach(function (id) {
        const product = allProducts.find(p => Number(p.id) === id);
        if (!product) return;
        const cartId   = product.name.toLowerCase().replace(/\s+/g, '-');
        const existing = cart.find(i => i.id === cartId);
        if (existing) {
          existing.qty++;
        } else {
          cart.push({ id: cartId, name: product.name, brand: product.brand, price: Number(product.price), img: product.image, qty: 1 });
        }
      });
 
      favorites = [];
      document.querySelectorAll('.favorite-btn i').forEach(i => i.classList.replace('fa-solid', 'fa-regular'));
      document.querySelectorAll('.favorite-btn').forEach(b => b.classList.remove('active'));
      if (typeof updateWishlistButton === 'function') updateWishlistButton();
 
      updateWishlistCount();
      updateCartCount();
      renderCart();
      showToast('Moved to Cart', 'All wishlist items added', 'success');
      toggleWishlist();
      openCart();
    });
  }
});
 
/* ═══════════════════════════════════════════
   WISHLIST EVENT LISTENERS
═══════════════════════════════════════════ */
 
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.favorite-btn');
  if (btn) toggleFavorite(btn.dataset.id);
});
 
document.addEventListener('DOMContentLoaded', function () {
  const wishIcon    = document.getElementById('wishlistIconWrapper');
  const wishClose   = document.getElementById('wishlist-close');
  const wishOverlay = document.getElementById('wishlist-overlay');
  if (wishIcon)    wishIcon.addEventListener('click', toggleWishlist);
  if (wishClose)   wishClose.addEventListener('click', toggleWishlist);
  if (wishOverlay) wishOverlay.addEventListener('click', toggleWishlist);
});
 
/* ═══════════════════════════════════════════
   CART EVENT LISTENERS
═══════════════════════════════════════════ */
 
document.addEventListener('DOMContentLoaded', function () {
  renderCart();
  updateCartCount();
 
  const cartIcon    = document.getElementById('cartIconWrapper');
  const cartClose   = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartIcon)    cartIcon.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
});
 
attachAddToCartListeners();
 
/* ═══════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════ */
 
document.addEventListener('DOMContentLoaded', function () {
  const container   = document.createElement('div');
  container.className = 'toast-container';
  container.id        = 'toastContainer';
  document.body.appendChild(container);
});
 
function showToast(title, sub, type) {
  type = type || 'info';
  sub  = sub  || '';
 
  const container = document.getElementById('toastContainer');
  if (!container) return;
 
  const icons = {
    success: '<i class="fa-solid fa-check"></i>',
    error:   '<i class="fa-solid fa-xmark"></i>',
    wish:    '<i class="fa-solid fa-heart"></i>',
    info:    '<i class="fa-solid fa-cart-shopping"></i>',
  };
 
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<div class="toast-icon">' + (icons[type] || icons.info) + '</div>' +
    '<div class="toast-body">' +
      '<span class="toast-title">' + title + '</span>' +
      (sub ? '<span class="toast-sub">' + sub + '</span>' : '') +
    '</div>' +
    '<span class="toast-close"><i class="fa-solid fa-xmark"></i></span>' +
    '<div class="toast-progress"></div>';
 
  container.appendChild(toast);
 
  toast.querySelector('.toast-close').addEventListener('click', function () {
    dismissToast(toast);
  });
 
  const timer = setTimeout(function () { dismissToast(toast); }, 3500);
 
  toast.addEventListener('mouseenter', function () {
    clearTimeout(timer);
    toast.querySelector('.toast-progress').style.animationPlayState = 'paused';
  });
  toast.addEventListener('mouseleave', function () {
    toast.querySelector('.toast-progress').style.animationPlayState = 'running';
    setTimeout(function () { dismissToast(toast); }, 1000);
  });
}
 
function dismissToast(toast) {
  if (!toast || toast.classList.contains('hiding')) return;
  toast.classList.add('hiding');
  setTimeout(function () {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 320);
}