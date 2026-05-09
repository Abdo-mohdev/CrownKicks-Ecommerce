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
   FILTER + SORT LOGIC
═══════════════════════════════════════ */
function getFiltered() {
  let list = [...allProducts];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (activeCategory !== 'all') {
    if      (activeCategory === 'sale')    list = list.filter(p => p.isOnSale);
    else if (activeCategory === 'new')     list = list.filter(p => p.isNew);
    else if (activeCategory === 'limited') list = list.filter(p => p.isLimited);
    else list = list.filter(p => p.category === activeCategory);
  }
  if (activeBrands.length) list = list.filter(p => activeBrands.includes(p.brand));
  list = list.filter(p => {
    const fp = p.isOnSale ? p.price*(1-p.discount/100) : p.price;
    return fp >= priceMin && fp <= priceMax;
  });
  if (filterInStock)     list = list.filter(p => p.isInStock);
  if (filterSale)        list = list.filter(p => p.isOnSale);
  if (filterNew)         list = list.filter(p => p.isNew);
  if (filterLimited)     list = list.filter(p => p.isLimited);
  switch (activeSort) {
    case 'price-asc':  list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
    case 'rating':     list.sort((a,b)=>b.rating-a.rating); break;
    case 'name':       list.sort((a,b)=>a.name.localeCompare(b.name)); break;
  }
  return list;
}

function applyFilters() {
  syncBrands();
  renderActiveTags();

  const filtered = getFiltered();
  const grid     = document.getElementById('products-grid');
  const noRes    = document.getElementById('no-results');

  const shownCount = document.getElementById('shown-count');
  if (shownCount) shownCount.textContent = filtered.length;

  if (!filtered.length) {
    if (grid) grid.innerHTML = '';
    if (noRes) noRes.classList.add('show');
  } else {
    if (noRes) noRes.classList.remove('show');
    if (!grid) return;
    grid.innerHTML = filtered.map(createProductCard).join('');
    attachCardListeners();
    runScrollReveal();
  }

  showResetBtn();
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
   CATEGORY CHIPS
═══════════════════════════════════════ */
document.querySelectorAll('.fchip[data-filter]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.fchip[data-filter]').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    activeCategory = chip.dataset.filter;
    applyFilters();
  });
});

/* ═══════════════════════════════════════
   BRAND CHECKBOXES
═══════════════════════════════════════ */
function syncBrands() {
  activeBrands = [...document.querySelectorAll('input[name="brand"]:checked')].map(cb=>cb.value);
}

/* ═══════════════════════════════════════
   SORT SELECT
═══════════════════════════════════════ */
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
  sortSelect.addEventListener('change', function() { activeSort=this.value; applyFilters(); });
}


/* ═══════════════════════════════════════
   ACCORDION
═══════════════════════════════════════ */
function toggleFG(head) { head.closest('.filter-group').classList.toggle('collapsed'); }

/* ═══════════════════════════════════════
   PRICE RANGE DUAL SLIDER
═══════════════════════════════════════ */
function updatePriceRange() {
  let mn = parseInt(document.getElementById('range-min').value);
  let mx = parseInt(document.getElementById('range-max').value);
  if (mn > mx-10) {
    if (document.activeElement===document.getElementById('range-min')) mn=mx-10;
    else mx=mn+10;
    document.getElementById('range-min').value=mn;
    document.getElementById('range-max').value=mx;
  }
  priceMin=mn; priceMax=mx;
  document.getElementById('price-min-label').textContent=`EGP ${mn}`;
  document.getElementById('price-max-label').textContent=`EGP ${mx}`;
  const pct=(v,min=0,max=350)=>((v-min)/(max-min))*100;
  const fill=document.getElementById('range-fill');
  fill.style.left=pct(mn)+'%';
  fill.style.width=(pct(mx)-pct(mn))+'%';
  applyFilters();
}


/* ═══════════════════════════════════════
   AVAILABILITY CHECKBOXES
═══════════════════════════════════════ */
const stockFilter = document.getElementById('filter-instock');
const saleFilter = document.getElementById('filter-sale');
const newFilter = document.getElementById('filter-new');
const limitedFilter = document.getElementById('filter-limited');
if (stockFilter) stockFilter.addEventListener('change',function(){filterInStock=this.checked;applyFilters()});
if (saleFilter) saleFilter.addEventListener('change',function(){filterSale=this.checked;applyFilters()});
if (newFilter) newFilter.addEventListener('change',function(){filterNew=this.checked;applyFilters()});
if (limitedFilter) limitedFilter.addEventListener('change',function(){filterLimited=this.checked;applyFilters()});

/* ═══════════════════════════════════════
   ACTIVE FILTER TAGS
═══════════════════════════════════════ */
function renderActiveTags() {
  const cont = document.getElementById('active-tags');
  if (!cont) return;
  const tags = [];
  if (searchQuery)              tags.push({label:`"${searchQuery}"`,   clear:()=>{searchQuery='';document.getElementById('searchInput').value='';applyFilters()}});
  if (activeCategory!=='all')   tags.push({label:activeCategory,       clear:()=>{activeCategory='all';document.querySelector('.fchip[data-filter="all"]').click()}});
  activeBrands.forEach(b=>      tags.push({label:b,                    clear:()=>{document.querySelector(`input[name="brand"][value="${b}"]`).checked=false;syncBrands();applyFilters()}}));
  if (priceMin>0)               tags.push({label:`From EGP ${priceMin}`,  clear:()=>{document.getElementById('range-min').value=0;updatePriceRange()}});
  if (priceMax<350)             tags.push({label:`To EGP ${priceMax}`,    clear:()=>{document.getElementById('range-max').value=350;updatePriceRange()}});
  if (filterSale)               tags.push({label:'On Sale',            clear:()=>{document.getElementById('filter-sale').checked=false;filterSale=false;applyFilters()}});
  if (filterNew)                tags.push({label:'New',                clear:()=>{document.getElementById('filter-new').checked=false;filterNew=false;applyFilters()}});
  if (filterLimited)            tags.push({label:'Limited',            clear:()=>{document.getElementById('filter-limited').checked=false;filterLimited=false;applyFilters()}});
  if (filterInStock)            tags.push({label:'In Stock',           clear:()=>{document.getElementById('filter-instock').checked=false;filterInStock=false;applyFilters()}});

  cont.innerHTML = tags.map((t,i)=>`
    <span class="atag">${t.label}<span class="atag-x" data-i="${i}">✕</span></span>`).join('')+
    (tags.length>1?`<button class="clear-all-tags" onclick="resetAll()">Clear all</button>`:'');

  window.__tags=tags;
  cont.querySelectorAll('.atag-x').forEach(x=>x.addEventListener('click',()=>window.__tags[Number(x.dataset.i)].clear()));
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
