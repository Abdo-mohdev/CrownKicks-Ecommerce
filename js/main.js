/* ═══════════════════════════════════════════
   CART INITIALIZATION & EVENT LISTENERS
═══════════════════════════════════════════ */

// Init empty cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});

// Cart sidebar controls
const cartIconWrapper = document.getElementById('cartIconWrapper');
const cartClose = document.getElementById('cart-close');
const cartOverlay = document.getElementById('cart-overlay');

if (cartIconWrapper) cartIconWrapper.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Add to cart event delegation
attachAddToCartListeners();

/* ═══════════════════════════════════════════
   PRODUCT CARD NAVIGATION
═══════════════════════════════════════════ */
document.addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  
  // Don't navigate if clicking add-to-cart or wishlist button
  if (e.target.closest('.add-to-cart') || e.target.closest('.favorite-btn')) {
    return;
  }
  
  if (card && card.dataset.productId) {
    const productId = card.dataset.productId;
    // Navigate to product detail page
    const detailPagePath = window.location.pathname.includes('pages/') 
      ? 'product-detail.html' 
      : 'pages/product-detail.html';
    window.location.href = `${detailPagePath}?id=${productId}`;
  }
});

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
   SEARCH — live search across all pages
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const drawerSearch = document.getElementById('drawerSearch');
  
  // Function للـ search logic
  function handleSearch(q) {
    // في products page: استخدم searchQuery و applyFilters
    if (typeof searchQuery !== 'undefined') {
      searchQuery = q;
      applyFilters();
      if (q) {
        setTimeout(() => {
          const grid = document.querySelector('.products-grid');
          if (grid) grid.scrollIntoView({behavior:'smooth', block:'start'});
        }, 100);
      }
    } else {
      // في home page: search في كل العناصر و scroll to first match
      const cards = document.querySelectorAll('.product-card, .featured-card, [class*="card"]');
      let firstMatch = null;
      
      cards.forEach(card => {
        const name = card.querySelector('.product-name')?.textContent.toLowerCase() || 
                     card.querySelector('h3')?.textContent.toLowerCase() || '';
        const brand = card.querySelector('.product-brand')?.textContent.toLowerCase() || 
                      card.querySelector('.brand')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.add-to-cart')?.dataset.category?.toLowerCase() || 
                         card.getAttribute('data-category')?.toLowerCase() || '';
        
        const matches = !q || name.includes(q) || brand.includes(q) || category.includes(q);
        
        card.style.opacity = matches ? '1' : '0.3';
        card.style.transform = matches ? 'scale(1)' : 'scale(0.95)';
        card.style.transition = 'opacity .3s, transform .3s';
        card.style.pointerEvents = matches ? 'auto' : 'none';
        
        if (matches && !firstMatch) {
          firstMatch = card;
        }
      });
      
      // Scroll to first match عند البحث
      if (q && firstMatch) {
        setTimeout(() => {
          firstMatch.scrollIntoView({behavior:'smooth', block:'center'});
        }, 100);
      }
    }
  }
  
  // ربط كلا الـ search inputs (desktop + drawer)
  [searchInput, drawerSearch].forEach(input => {
    if (input) {
      input.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        
        // Sync القيمة بين الـ desktop والـ drawer
        if (this === searchInput && drawerSearch) {
          drawerSearch.value = this.value;
        } else if (this === drawerSearch && searchInput) {
          searchInput.value = this.value;
        }
        
        handleSearch(q);
      });
    }
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
  
  // Update the product-detail heart if on that page
  if (typeof updateWishlistButton === 'function') {
    updateWishlistButton();
  }
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

  // تحديث الـ product-detail heart if on that page
  if (typeof updateWishlistButton === 'function') {
    updateWishlistButton();
  }

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







 

(function () {
  const intro = document.getElementById('storeIntro');
  const site  = document.getElementById('siteWrapper');
 
  /* ── open doors immediately on first paint ── */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      intro.classList.add('open');
    });
  });
 
  /*
    Timeline:
    0ms    → doors start opening (1.0s transition)
    1800ms → doors fully open + image visible → begin exit
    2350ms → intro fully faded, removed from DOM
  */
  setTimeout(function () {
    intro.classList.add('done');
    if (site) site.classList.add('show');
    setTimeout(function () { intro.remove(); }, 600);
  }, 3000);
})();

