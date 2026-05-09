/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
let activeCategory = 'all';
let activeBrands   = [];
let priceMin       = 0;
let priceMax       = 350;
let filterSale     = false;
let filterNew      = false;
let filterLimited  = false;
let filterInStock  = false;
let activeSort     = 'default';
let searchQuery    = '';

// Fallback for this page if helpers.js is cached or not loaded yet.
if (typeof resolveAssetPath !== 'function') {
  window.resolveAssetPath = function (src) {
    if (!src) return '';
    if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src;
    return window.location.pathname.includes('/pages/') ? '../' + src : src;
  };
}


/* ═══════════════════════════════════════
   direct links with ?filter=... (e.g. from homepage)
═══════════════════════════════════════ */

const params = new URLSearchParams(window.location.search);
const filterFromURL = params.get('filter');

if (filterFromURL) {
  activeCategory = filterFromURL;
}

if (filterFromURL) {
  const chip = document.querySelector(`.fchip[data-filter="${filterFromURL}"]`);
  if (chip) {
    document.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  }
}

/* ═══════════════════════════════════════
   LOAD PRODUCTS — fetch JSON
═══════════════════════════════════════ */
async function loadProducts() {
  await loadProductsData('../data/products.json');
  displaySambaCollection();
  displayUpcomingCollection();
}

/* ═══════════════════════════════════════
   DISPLAY SAMBA COLLECTION
═══════════════════════════════════════ */
function displaySambaCollection() {
  const sambas = allProducts.filter(p => p.brand === 'Adidas' && p.name.includes('Samba'));
  const sambaGrid = document.getElementById('samba-grid');
  if (sambaGrid && sambas.length) {
    sambaGrid.innerHTML = sambas.map(createProductCard).join('');
    attachCardListeners();
  }
}

/* ═══════════════════════════════════════
   DISPLAY UPCOMING COLLECTION
═══════════════════════════════════════ */
function displayUpcomingCollection() {
  const upcoming = allProducts.filter(p => p.isComingSoon);
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid && upcoming.length) {
    featuredGrid.innerHTML = upcoming.map(createProductCard).join('');
    attachCardListeners();
  }
}

/* ═══════════════════════════════════════
   CREATE CARD HTML — with wishlist support
═══════════════════════════════════════ */
function createProductCard(p) {
  const finalPrice = calculateFinalPrice(p);
  const wished = (typeof favorites !== 'undefined') ? favorites.includes(p.id) : false;
  const needsOptions = p.homeDrop && ((p.sizes && p.sizes.length) || (p.colors && p.colors.length));
  return `
  <div class="product-card ${p.isComingSoon ? 'coming-soon' : ''}" data-category="${p.category}" ${p.isComingSoon ? '' : `data-product-id="${p.id}"`}>
    <div class="product-img">
      <button class="favorite-btn ${wished?'active':''}" data-id="${p.id}">
        <i class="fa-${wished?'solid':'regular'} fa-heart"></i>
      </button>
      <img src="${resolveAssetPath(p.image)}" alt="${p.name}" loading="lazy">
      ${p.isOnSale  ? `<span class="sale-tag">-${p.discount}%</span>` : ''}
      ${p.isNew && !p.isComingSoon ? `<span class="new-badge"><i class="fa-solid fa-star"></i> NEW</span>` : ''}
      ${p.isComingSoon && p.isInStock ? `<span class="coming-soon-badge">Coming Soon</span>` : ''}
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
        ${p.isOnSale ? `<span class="orig-price">EGP ${p.price}</span><span class="sale-price">EGP ${finalPrice}</span>` : `<span>EGP ${p.price}</span>`}
      </span>
      <button class="${needsOptions ? 'view-product-btn' : 'add-to-cart'}"
        data-id="${p.id}"
        data-name="${p.name}" data-brand="${p.brand}"
        data-price="${finalPrice}" data-img="${p.image}"
        data-category="${p.category}"
        ${!p.isInStock || p.isComingSoon?'disabled':''}>
        ${!p.isInStock ? 'Out of Stock' : (p.isComingSoon ? 'Coming Soon' : (needsOptions ? 'View Sizes' : 'Add to Cart'))}
      </button>
    </div>
  </div>`;
}



/* ═══════════════════════════════════════
   CARD LISTENERS (favor + wishlist)
═══════════════════════════════════════ */
function attachCardListeners() {
  // Handled globally in helpers.js
}

function runScrollReveal() {
  const cards = document.querySelectorAll('.product-card');
  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity .5s ease, transform .55s ease';
    observer.observe(card);
  });
}



/* ═══════════════════════════════════════
   RESET ALL
═══════════════════════════════════════ */
function resetAll() {
  searchQuery='';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value='';
  activeCategory='all'; activeBrands=[]; activeRating=0;
  priceMin=0; priceMax=350;
  filterSale=filterNew=filterLimited=filterInStock=false; activeSort='default';
  document.querySelectorAll('input[name="brand"]').forEach(cb=>cb.checked=false);
  if (document.getElementById('range-min')) document.getElementById('range-min').value=0;
  if (document.getElementById('range-max')) document.getElementById('range-max').value=350;
  ['filter-sale','filter-new','filter-limited','filter-instock'].forEach(id=>{ const el=document.getElementById(id); if (el) el.checked=false; });
  if (document.getElementById('sort-select')) document.getElementById('sort-select').value='default';
  document.querySelectorAll('.fchip[data-filter]').forEach(c=>c.classList.remove('active'));
  document.querySelector('.fchip[data-filter="all"]').classList.add('active');
  updatePriceRange();
}

function showResetBtn() {
  const has = activeBrands.length||priceMin>0||priceMax<350||
    filterSale||filterNew||filterLimited||filterInStock||activeCategory!=='all'||searchQuery;
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) resetBtn.classList.toggle('visible', !!has);
}
const resetBtn = document.getElementById('btn-reset');
if (resetBtn) resetBtn.addEventListener('click', resetAll);

/* ═══════════════════════════════════════
   SEARCH — live filter + scroll to grid
═══════════════════════════════════════ */

// ربط الـ search inputs (desktop + mobile)
const searchInputs = [
  document.getElementById('searchInput'),
  document.getElementById('drawerSearch')
];

searchInputs.forEach(input => {
  if (!input) return; // في حالة البحث عن element ما موجود

  input.addEventListener('input', function() {
    searchQuery = this.value.trim();
    applyFilters();

    // Sync القيمة بين الـ desktop و mobile search
    searchInputs.forEach(si => {
      if (si && si !== this) si.value = this.value;
    });

    // Scroll to results عندما يكتب
    if (searchQuery) {
      setTimeout(() => {
        document.querySelector('.products-grid').scrollIntoView({behavior:'smooth', block:'start'});
      }, 100);
    }
  });
});

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});
