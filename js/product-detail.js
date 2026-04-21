/* ═══════════════════════════════════════════════════════════════
   PRODUCT DETAIL PAGE - product-detail.js
═══════════════════════════════════════════════════════════════ */

let currentProduct = null;
let selectedQuantity = 1;

/* ═══════════════════════════════════════════
   GET PRODUCT FROM URL
═══════════════════════════════════════════ */
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id'));
}

/* ═══════════════════════════════════════════
   FIND PRODUCT IN allProducts
═══════════════════════════════════════════ */
function findProduct(id) {
  return allProducts.find(p => p.id === id);
}

/* ═══════════════════════════════════════════
   DISPLAY PRODUCT DETAILS
═══════════════════════════════════════════ */
function displayProductDetails(product) {
  if (!product) {
    document.querySelector('.product-detail').innerHTML = `
      <div style="text-align: center; padding: 100px 20px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: var(--gold); margin-bottom: 20px;"></i>
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <a href="products.html" class="btn-add-cart" style="width: 200px; margin-top: 20px; display: inline-flex;">Back to Shop</a>
      </div>
    `;
    return;
  }

  currentProduct = product;

  // Update breadcrumb
  document.getElementById('breadcrumb-product').textContent = product.name;

  // Update Meta
  document.title = `CROWNKICKS || ${product.name}`;

  // Category
  document.getElementById('productCategory').textContent = product.category;

  // Name
  document.getElementById('productName').textContent = product.name;

  // Rating
  document.getElementById('productRating').textContent = product.rating;
  document.getElementById('productReviews').textContent = product.reviews;

  // Price
  const finalPrice = product.isOnSale 
    ? (product.price * (1 - product.discount/100)).toFixed(2)
    : product.price.toFixed(2);
  
  document.getElementById('currentPrice').textContent = `$${finalPrice}`;
  
  if (product.isOnSale) {
    document.getElementById('originalPrice').style.display = 'inline';
    document.getElementById('originalPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('saleBadge').style.display = 'block';
    document.getElementById('salePercent').textContent = `-${product.discount}%`;
  }

  // Stock
  const stockEl = document.getElementById('stockStatus');
  if (product.isInStock) {
    stockEl.textContent = '✓ In Stock';
    stockEl.className = 'in-stock';
  } else {
    stockEl.textContent = '✗ Out of Stock';
    stockEl.className = 'out-of-stock';
    document.getElementById('addToCartBtn').disabled = true;
  }

  // Description (short)
  document.getElementById('productDescription').textContent = product.description;

  // FULL DESCRIPTION (from JSON)
  const fullDescEl = document.getElementById('productFullDescription');
  if (fullDescEl && product.fullDescription) {
    fullDescEl.textContent = product.fullDescription;
  }

  // MATERIAL (from JSON)
  const materialEl = document.getElementById('productMaterial');
  if (materialEl && product.material) {
    materialEl.textContent = product.material;
  }

  // WEIGHT (from JSON)
  const weightEl = document.getElementById('productWeight');
  if (weightEl && product.weight) {
    weightEl.textContent = product.weight;
  }

  // SPECIFICATIONS (from JSON)
  const specsEl = document.getElementById('productSpecs');
  if (specsEl && product.specifications) {
    specsEl.innerHTML = Object.entries(product.specifications)
      .map(([key, value]) => `
        <div class="spec-row">
          <span class="spec-label">${key}:</span>
          <span class="spec-value">${value}</span>
        </div>
      `).join('');
  }

  // COLORS (dynamic from JSON)
  const colorsEl = document.querySelector('.color-options');
  if (colorsEl && product.colors) {
    colorsEl.innerHTML = product.colors.map((color, i) => `
      <button class="color-btn ${i === 0 ? 'active' : ''}" title="${color}">
        <span>${color}</span>
      </button>
    `).join('');
  }

  // SIZES (dynamic from JSON)
  const sizesEl = document.querySelector('.size-options');
  if (sizesEl && product.sizes) {
    sizesEl.innerHTML = product.sizes.map((size, i) => `
      <button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${size}">
        ${size}
      </button>
    `).join('');
  }

  // Main Image
  document.getElementById('mainImage').src = product.image;

  // Generate thumbnail gallery (same image repeated 4 times for demo)
  const thumbnailGallery = document.querySelector('.thumbnail-gallery');
  thumbnailGallery.innerHTML = Array(4).fill(product.image).map((img, i) => `
    <div class="thumbnail ${i === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
      <img src="${img}" alt="View ${i+1}">
    </div>
  `).join('');

  // Wishlist button status
  updateWishlistButton();

  // Add event listeners for color/size selection
  addColorSizeListeners();
}

/* ═══════════════════════════════════════════
   CHANGE MAIN IMAGE
═══════════════════════════════════════════ */
function changeMainImage(imgSrc, thumbnailEl) {
  document.getElementById('mainImage').src = imgSrc;
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  thumbnailEl.classList.add('active');
}

/* ═══════════════════════════════════════════
   UPDATE WISHLIST BUTTON
═══════════════════════════════════════════ */
function updateWishlistButton() {
  if (!currentProduct) return;
  
  const btn = document.getElementById('addToWishlistBtn');
  if (!btn) return;
  
  const isFavorited = (typeof favorites !== 'undefined') && favorites.includes(currentProduct.id);
  
  if (isFavorited) {
    btn.classList.add('active');
    btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
  }
}

/* ═══════════════════════════════════════════
   QUANTITY CONTROLS
═══════════════════════════════════════════ */
document.getElementById('qtyMinus')?.addEventListener('click', () => {
  const input = document.getElementById('quantity');
  if (input.value > 1) input.value--;
  selectedQuantity = Number(input.value);
});

document.getElementById('qtyPlus')?.addEventListener('click', () => {
  const input = document.getElementById('quantity');
  if (input.value < 10) input.value++;
  selectedQuantity = Number(input.value);
});

document.getElementById('quantity')?.addEventListener('change', () => {
  const input = document.getElementById('quantity');
  let val = Number(input.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 10) val = 10;
  input.value = val;
  selectedQuantity = val;
});

/* ═══════════════════════════════════════════
   COLOR & SIZE SELECTION
═══════════════════════════════════════════ */
function addColorSizeListeners() {
  // Color buttons
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Size buttons
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

  const id = currentProduct.name.toLowerCase().replace(/\s+/g, '-');
  const price = currentProduct.isOnSale 
    ? (currentProduct.price * (1 - currentProduct.discount/100)).toFixed(2)
    : currentProduct.price.toFixed(2);

  // Add to cart (or increase quantity)
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += selectedQuantity;
  } else {
    cart.push({
      id,
      name: currentProduct.name,
      brand: currentProduct.brand,
      price: Number(price),
      img: currentProduct.image,
      qty: selectedQuantity
    });
  }

  updateCartCount();
  renderCart();
  openCart();

  // Visual feedback
  const btn = document.getElementById('addToCartBtn');
  btn.textContent = '✓ Added to Cart';
  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
  }, 2000);
});

/* ═══════════════════════════════════════════
   ADD TO WISHLIST
═══════════════════════════════════════════ */
document.getElementById('addToWishlistBtn')?.addEventListener('click', (e) => {
  if (!currentProduct) return;
  e.stopPropagation();
  
  // Toggle favorite (updates favorites array and global buttons)
  toggleFavorite(currentProduct.id);
  
  // Force update THIS button specifically
  setTimeout(() => {
    updateWishlistButton();
  }, 0);
});

/* ═══════════════════════════════════════════
   GET RECOMMENDED PRODUCTS
═══════════════════════════════════════════ */
function getRecommendedProducts() {
  if (!currentProduct) return [];

  // Get 4-8 products from same category or brand (excluding current)
  const recommended = allProducts.filter(p => 
    p.id !== currentProduct.id && 
    (p.category === currentProduct.category || p.brand === currentProduct.brand)
  ).slice(0, 8);

  // If less than 4, add some random ones
  if (recommended.length < 4) {
    const additional = allProducts.filter(p => !recommended.find(r => r.id === p.id) && p.id !== currentProduct.id);
    recommended.push(...additional.slice(0, 4 - recommended.length));
  }

  return recommended.slice(0, 4);
}

/* ═══════════════════════════════════════════
   DISPLAY RECOMMENDED PRODUCTS
═══════════════════════════════════════════ */
function displayRecommendedProducts() {
  const recommended = getRecommendedProducts();
  const grid = document.getElementById('recommendedGrid');

  grid.innerHTML = recommended.map(p => {
    const finalPrice = p.isOnSale ? (p.price * (1 - p.discount/100)).toFixed(2) : p.price;
    return `
      <a href="product-detail.html?id=${p.id}" class="product-card" style="text-decoration: none;">
        <div class="product-img">
          <button class="favorite-btn ${favorites.includes(p.id) ? 'active' : ''}" data-id="${p.id}" onclick="event.stopPropagation(); toggleFavorite(${p.id}); event.target.classList.toggle('active');">
            <i class="fa-${favorites.includes(p.id) ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <img src="${p.image}" alt="${p.name}">
          ${p.isOnSale ? `<span class="sale-tag">-${p.discount}%</span>` : ''}
          ${p.isNew ? `<span class="new-badge"><i class="fa-solid fa-star"></i> NEW</span>` : ''}
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
            ${p.isOnSale ? `<span class="orig-price">$${p.price}</span><span class="sale-price">$${finalPrice}</span>` : `$${p.price}`}
          </span>
        </div>
      </a>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════
   INIT ON LOAD
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Load products data first
  if (allProducts.length === 0) {
    await loadProductsData('../data/products.json');
  }

  // Get product from URL and display
  const productId = getProductIdFromURL();
  const product = findProduct(productId);
  
  displayProductDetails(product);
  displayRecommendedProducts();
});
