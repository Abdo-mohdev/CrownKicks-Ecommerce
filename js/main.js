/* ═══════════════════════════════════════════
   CART STATE
═══════════════════════════════════════════ */
let cart = [];

/* ── helpers ── */
function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = total;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function calcTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

/* ── render cart items ── */
function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total-price');

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
        <span class="cart-item-price">$${item.price * item.qty}</span>
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

  totalEl.textContent = `$${calcTotal()}`;
}

/* ── add to cart ── */
function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
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
  });
}

/* Attach listeners on load */
document.addEventListener('DOMContentLoaded', attachAddToCartListeners);

/* ── qty & remove ── */
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

/* ── open / close ── */
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cartIconWrapper').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

/* init empty cart */
renderCart();
updateCartCount();

/* ═══════════════════════════════════════════
   HAMBURGER / MOBILE MENU
═══════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navbar-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/* Close when a link is tapped on mobile */
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});



/* ═══════════════════════════════════════════
   SEARCH — Search by name, brand, and category
═══════════════════════════════════════════ */
document.getElementById('searchInput').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  document.querySelectorAll('.product-card').forEach(card => {
    const name     = card.querySelector('.product-name').textContent.toLowerCase();
    const brand    = card.querySelector('.product-brand').textContent.toLowerCase();
    const category = card.querySelector('.add-to-cart')?.dataset.category?.toLowerCase() || '';
    
    const matches = !q || name.includes(q) || brand.includes(q) || category.includes(q);
    card.style.opacity    = matches ? '1' : '0.2';
    card.style.transform  = matches ? '' : 'scale(0.96)';
    card.style.transition = 'opacity .3s, transform .3s';
  });
});

/* ═══════════════════════════════════════════
   NAVBAR SCROLL SHADOW
═══════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  nav.style.boxShadow = window.scrollY > 10
    ? '0 4px 40px rgba(0,0,0,.6)'
    : 'none';
});

/* ═══════════════════════════════════════════
   SCROLL FADE-IN (Intersection Observer)
═══════════════════════════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .featured-card, .card').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .55s ease';
  observer.observe(el);
});

/* ═══════════════════════════════════════════
   FAVORITE BUTTON
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   WISHLIST STATE & UI
═══════════════════════════════════════════ */
let favorites = [];

// 1. تحديث عداد الـ Navbar
function updateWishlistCount() {
  const countEl = document.getElementById('wishlist-count');
  if (countEl) {
    countEl.textContent = favorites.length;
    countEl.classList.remove('pop');
    void countEl.offsetWidth; // Trigger reflow for animation
    countEl.classList.add('pop');
  }
}

// 2. فتح وقفل الـ Sidebar
function toggleWishlist() {
  renderWishlistItems(); // بنرسم العناصر قبل ما نفتح
  document.getElementById('wishlist-sidebar').classList.toggle('open');
  document.getElementById('wishlist-overlay').classList.toggle('open');
}

// 3. إضافة أو حذف منتج (Toggle)
function toggleFavorite(productId) {
  productId = Number(productId);
  const btn = document.querySelector(`.favorite-btn[data-id="${productId}"]`);
  const heartIcon = btn ? btn.querySelector('i') : null;

  if (favorites.includes(productId)) {
    // حذف
    favorites = favorites.filter(id => id !== productId);
    if (heartIcon) heartIcon.classList.replace('fa-solid', 'fa-regular');
    if (btn) btn.classList.remove('active');
  } else {
    // إضافة
    favorites.push(productId);
    if (heartIcon) heartIcon.classList.replace('fa-regular', 'fa-solid');
    if (btn) btn.classList.add('active');
  }

  updateWishlistCount();
  renderWishlistItems(); // تحديث القائمة لو الـ sidebar مفتوح
}

// 4. رسم المنتجات داخل الـ Wishlist Sidebar
function renderWishlistItems() {
  const container = document.getElementById('wishlist-items');
  if (!container) return;

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-regular fa-heart" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.2;"></i>
        <p>Your wishlist is empty!</p>
      </div>`;
    return;
  }

  // بنجيب تفاصيل المنتجات من allProducts اللي جاية من الـ JSON
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
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════
   MOVE ALL TO CART LOGIC
═══════════════════════════════════════════ */
document.getElementById('move-all-to-cart')?.addEventListener('click', () => {
  if (favorites.length === 0) return;

  favorites.forEach(id => {
    const product = allProducts.find(p => Number(p.id) === id);
    if (product) {
      // نفس الـ Logic بتاع الـ Add to Cart اللي عندك
      const cartId = product.name.toLowerCase().replace(/\s+/g, '-');
      const existing = cart.find(i => i.id === cartId);
      
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ 
          id: cartId, name: product.name, brand: product.brand, 
          price: Number(product.price), img: product.image, qty: 1 
        });
      }
    }
  });

  // تنظيف الـ Wishlist تماماً
  favorites = [];
  
  // ريسيت لكل القلوب في الصفحة (عشان الـ Hover واللون الأحمر يختفوا)
  document.querySelectorAll('.favorite-btn i').forEach(icon => {
    icon.classList.replace('fa-solid', 'fa-regular');
  });
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // تحديث كل العدادات والـ UI
  updateWishlistCount();
  updateCartCount();
  renderCart();
  
  // اقفل الـ Wishlist وافتح الـ Cart عشان اليوزر يشوف النتيجة
  toggleWishlist();
  openCart();
});

/* ═══════════════════════════════════════════
   EVENT LISTENERS (الربط النهائي)
═══════════════════════════════════════════ */
// ربط أي كليكة على زرار القلب اللي في الكروت
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".favorite-btn");
  if (btn) {
    toggleFavorite(btn.dataset.id);
  }
});

// فتح الـ Wishlist من الـ Navbar
document.getElementById('wishlistIconWrapper')?.addEventListener('click', toggleWishlist);
document.getElementById('wishlist-close')?.addEventListener('click', toggleWishlist);
document.getElementById('wishlist-overlay')?.addEventListener('click', toggleWishlist);