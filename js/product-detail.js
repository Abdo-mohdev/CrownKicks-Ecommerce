/* ═══════════════════════════════════════════════════════════════
   PRODUCT DETAIL PAGE - product-detail.js
   
   FIXES vs previous version:
   1. qty resets to 1 on every product load  (was carrying stale value)
   2. Toast shows qty × price  (was showing per-unit only)
   3. Cart badge updates instantly after add
   4. Add to Cart button resets cleanly with the correct icon
═══════════════════════════════════════════════════════════════ */
 
let currentProduct   = null;
let selectedQuantity = 1;   /* always reset to 1 inside displayProductDetails */
 
/* ═══════════════════════════════════════════
   GET PRODUCT ID FROM URL
═══════════════════════════════════════════ */
function getProductIdFromURL() {
  return Number(new URLSearchParams(window.location.search).get('id'));
}
 
/* ═══════════════════════════════════════════
   FIND PRODUCT
═══════════════════════════════════════════ */
function findProduct(id) {
  return allProducts.find(p => p.id === id);
}
 
/* ═══════════════════════════════════════════
   DISPLAY PRODUCT DETAILS
═══════════════════════════════════════════ */
function displayProductDetails(product) {
  if (!product) {
    const wrapper = document.querySelector('.product-detail');
    if (wrapper) wrapper.innerHTML = `
      <div style="text-align:center;padding:100px 20px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:48px;color:var(--gold);margin-bottom:20px;"></i>
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <a href="products.html" class="btn-add-cart" style="width:200px;margin-top:20px;display:inline-flex;">Back to Shop</a>
      </div>`;
    return;
  }
 
  currentProduct = product;
 
  /* ── FIX 1: reset qty to 1 every time a product loads ── */
  selectedQuantity = 1;
  const qtyInput = document.getElementById('quantity');
  if (qtyInput) qtyInput.value = 1;
 
  /* breadcrumb + page title */
  const bcEl = document.getElementById('breadcrumb-product');
  if (bcEl) bcEl.textContent = product.name;
  document.title = `CROWNKICKS || ${product.name}`;
 
  /* category */
  const catEl = document.getElementById('productCategory');
  if (catEl) catEl.textContent = product.category;
 
  /* name */
  const nameEl = document.getElementById('productName');
  if (nameEl) nameEl.textContent = product.name;
 
  /* rating */
  const ratingEl  = document.getElementById('productRating');
  const reviewsEl = document.getElementById('productReviews');
  if (ratingEl)  ratingEl.textContent  = product.rating;
  if (reviewsEl) reviewsEl.textContent = product.reviews;
 
  /* price */
  const finalPrice = product.isOnSale
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price.toFixed(2);
 
  const priceEl = document.getElementById('currentPrice');
  if (priceEl) priceEl.textContent = `$${finalPrice}`;
 
  const origEl    = document.getElementById('originalPrice');
  const badgeEl   = document.getElementById('saleBadge');
  const pctEl     = document.getElementById('salePercent');
 
  if (product.isOnSale) {
    if (origEl)  { origEl.style.display = 'inline'; origEl.textContent = `$${product.price.toFixed(2)}`; }
    if (badgeEl)  badgeEl.style.display  = 'block';
    if (pctEl)    pctEl.textContent      = `-${product.discount}%`;
  } else {
    if (origEl)  origEl.style.display   = 'none';
    if (badgeEl) badgeEl.style.display  = 'none';
  }
 
  /* stock status */
  const stockEl = document.getElementById('stockStatus');
  const addBtn  = document.getElementById('addToCartBtn');
  if (stockEl) {
    if (product.isInStock) {
      stockEl.textContent = '✓ In Stock';
      stockEl.className   = 'in-stock';
      if (addBtn) addBtn.disabled = false;
    } else {
      stockEl.textContent = '✗ Out of Stock';
      stockEl.className   = 'out-of-stock';
      if (addBtn) addBtn.disabled = true;
    }
  }
 
  /* descriptions + optional extra fields */
  const descEl = document.getElementById('productDescription');
  if (descEl) descEl.textContent = product.description || '';
 
  const fullDescEl = document.getElementById('productFullDescription');
  if (fullDescEl && product.fullDescription) fullDescEl.textContent = product.fullDescription;
 
  const materialEl = document.getElementById('productMaterial');
  if (materialEl && product.material) materialEl.textContent = product.material;
 
  const weightEl = document.getElementById('productWeight');
  if (weightEl && product.weight) weightEl.textContent = product.weight;
 
  const specsEl = document.getElementById('productSpecs');
  if (specsEl && product.specifications) {
    specsEl.innerHTML = Object.entries(product.specifications).map(([k, v]) =>
      `<div class="spec-row"><span class="spec-label">${k}:</span><span class="spec-value">${v}</span></div>`
    ).join('');
  }
 
  /* colors */
  const colorsEl = document.querySelector('.color-options');
  if (colorsEl && product.colors) {
    colorsEl.innerHTML = product.colors.map((color, i) =>
      `<button class="color-btn ${i === 0 ? 'active' : ''}" title="${color}">
         <span>${color}</span>
       </button>`
    ).join('');
  }
 
  /* sizes */
  const sizesEl = document.querySelector('.size-options');
  if (sizesEl && product.sizes) {
    sizesEl.innerHTML = product.sizes.map((size, i) =>
      `<button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${size}">${size}</button>`
    ).join('');
  }
 
  /* main image */
  const mainImg = document.getElementById('mainImage');
  if (mainImg) mainImg.src = product.image;
 
  /* thumbnail gallery — 4 thumbnails */
  const gallery = document.querySelector('.thumbnail-gallery');
  if (gallery) {
    gallery.innerHTML = Array(4).fill(product.image).map((img, i) =>
      `<div class="thumbnail ${i === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
         <img src="${img}" alt="View ${i + 1}">
       </div>`
    ).join('');
  }
 
  /* sync wishlist heart */
  updateWishlistButton();
 
  /* attach color/size click handlers */
  addColorSizeListeners();
}
 
/* ═══════════════════════════════════════════
   SWAP MAIN IMAGE
═══════════════════════════════════════════ */
function changeMainImage(imgSrc, thumbEl) {
  const img = document.getElementById('mainImage');
  if (img) img.src = imgSrc;
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}
 
/* ═══════════════════════════════════════════
   WISHLIST BUTTON STATE
═══════════════════════════════════════════ */
function updateWishlistButton() {
  if (!currentProduct) return;
  const btn = document.getElementById('addToWishlistBtn');
  if (!btn) return;
  const isFav = typeof favorites !== 'undefined' && favorites.includes(currentProduct.id);
  btn.classList.toggle('active', isFav);
  btn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>`;
}
 
/* ═══════════════════════════════════════════
   QUANTITY CONTROLS
═══════════════════════════════════════════ */
document.getElementById('qtyMinus')?.addEventListener('click', () => {
  const input = document.getElementById('quantity');
  if (!input) return;
  const next = Number(input.value) - 1;
  input.value      = Math.max(1, next);
  selectedQuantity = Number(input.value);
});
 
document.getElementById('qtyPlus')?.addEventListener('click', () => {
  const input = document.getElementById('quantity');
  if (!input) return;
  const next = Number(input.value) + 1;
  input.value      = Math.min(10, next);
  selectedQuantity = Number(input.value);
});
 
document.getElementById('quantity')?.addEventListener('change', () => {
  const input = document.getElementById('quantity');
  if (!input) return;
  let v = Number(input.value);
  if (isNaN(v) || v < 1)  v = 1;
  if (v > 10)              v = 10;
  input.value      = v;
  selectedQuantity = v;
});
 
/* ═══════════════════════════════════════════
   COLOR & SIZE SELECTION
═══════════════════════════════════════════ */
function addColorSizeListeners() {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}
 
/* ═══════════════════════════════════════════
   ADD TO CART
═══════════════════════════════════════════ */
document.getElementById('addToCartBtn')?.addEventListener('click', () => {
  if (!currentProduct) return;
 
  const unitPrice = currentProduct.isOnSale
    ? Number((currentProduct.price * (1 - currentProduct.discount / 100)).toFixed(2))
    : Number(currentProduct.price.toFixed(2));
 
  /* ── FIX 2: total price = unit × qty for the toast ── */
  const totalPrice = (unitPrice * selectedQuantity).toFixed(2);
 
  const cartId   = currentProduct.name.toLowerCase().replace(/\s+/g, '-');
  const existing = cart.find(i => i.id === cartId);
 
  if (existing) {
    existing.qty += selectedQuantity;
  } else {
    cart.push({
      id:    cartId,
      name:  currentProduct.name,
      brand: currentProduct.brand,
      price: unitPrice,
      img:   currentProduct.image,
      qty:   selectedQuantity,
    });
  }
 
  /* ── FIX 3: badge + sidebar update immediately ── */
  updateCartCount();
  renderCart();
 
  /* toast with correct total */
  if (typeof showToast === 'function') {
    const qtyLabel = selectedQuantity > 1 ? ` · ${selectedQuantity}x` : '';
    showToast(
      'Added to Cart',
      `${currentProduct.name}${qtyLabel} · $${totalPrice}`,
      'success'
    );
  }
 
  /* ── FIX 4: button feedback resets with correct icon ── */
  const btn = document.getElementById('addToCartBtn');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added to Cart';
    btn.disabled  = true;
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
      btn.disabled  = !currentProduct.isInStock;
    }, 2000);
  }
});
 
/* ═══════════════════════════════════════════
   ADD TO WISHLIST
═══════════════════════════════════════════ */
document.getElementById('addToWishlistBtn')?.addEventListener('click', e => {
  if (!currentProduct) return;
  e.stopPropagation();
  toggleFavorite(currentProduct.id);
  setTimeout(() => updateWishlistButton(), 0);
});
 
/* ═══════════════════════════════════════════
   RECOMMENDED PRODUCTS
═══════════════════════════════════════════ */
function getRecommendedProducts() {
  if (!currentProduct) return [];
  const related = allProducts.filter(p =>
    p.id !== currentProduct.id &&
    (p.category === currentProduct.category || p.brand === currentProduct.brand)
  );
  if (related.length >= 4) return related.slice(0, 4);
  /* pad if needed */
  const relIds = new Set(related.map(p => p.id));
  const rest   = allProducts.filter(p => p.id !== currentProduct.id && !relIds.has(p.id));
  return [...related, ...rest].slice(0, 4);
}
 
function displayRecommendedProducts() {
  const grid = document.getElementById('recommendedGrid');
  if (!grid) return;
 
  const list = getRecommendedProducts();
  grid.innerHTML = list.map(p => {
    const fp    = p.isOnSale ? (p.price * (1 - p.discount / 100)).toFixed(2) : p.price;
    const wished = typeof favorites !== 'undefined' && favorites.includes(p.id);
    return `
      <div class="product-card" data-product-id="${p.id}" style="cursor:pointer">
        <div class="product-img">
          <button class="favorite-btn ${wished ? 'active' : ''}" data-id="${p.id}">
            <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <img src="${p.image}" alt="${p.name}">
          ${p.isOnSale  ? `<span class="sale-tag">-${p.discount}%</span>` : ''}
          ${p.isNew     ? `<span class="new-badge"><i class="fa-solid fa-star"></i> NEW</span>` : ''}
          ${!p.isInStock? `<div class="out-of-stock">Out of Stock</div>` : ''}
        </div>
        <div class="product-info">
          <span class="product-brand">${p.brand}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-rating">
            <i class="fa-solid fa-star"></i>
            <span>${p.rating}</span>
            <span class="reviews">(${p.reviews})</span>
          </div>
          <span class="product-price">
            ${p.isOnSale
              ? `<span class="orig-price">$${p.price}</span><span class="sale-price">$${fp}</span>`
              : `$${p.price}`}
          </span>
        </div>
      </div>`;
  }).join('');
 
  /* navigate to detail on card click */
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.favorite-btn')) return;
      window.location.href = `product-detail.html?id=${card.dataset.productId}`;
    });
  });
  /* heart buttons handled by global delegation in helpers.js / main.js */
}
 
/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof allProducts === 'undefined' || allProducts.length === 0) {
    if (typeof loadProductsData === 'function') {
      await loadProductsData('../data/products.json');
    }
  }
 
  const productId = getProductIdFromURL();
  const product   = findProduct(productId);
 
  displayProductDetails(product);
  displayRecommendedProducts();
});
