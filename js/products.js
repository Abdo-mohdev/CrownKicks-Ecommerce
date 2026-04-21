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
  console.log("Loaded:", allProducts);
  applyFilters();
}
 
/* ═══════════════════════════════════════
   CREATE CARD HTML — with wishlist support
═══════════════════════════════════════ */
function createProductCard(p) {
  const finalPrice = calculateFinalPrice(p);
  const wished = (typeof favorites !== 'undefined') ? favorites.includes(p.id) : false;
  return `
  <div class="product-card" data-category="${p.category}" data-product-id="${p.id}">
    <div class="product-img">
      <button class="favorite-btn ${wished?'active':''}" data-id="${p.id}">
        <i class="fa-${wished?'solid':'regular'} fa-heart"></i>
      </button>
      <img src="${p.image}" alt="${p.name}" loading="lazy">
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
        ${p.isOnSale ? `<span class="orig-price">$${p.price}</span><span class="sale-price">$${finalPrice}</span>` : `<span>$${p.price}</span>`}
      </span>
      <button class="add-to-cart"
        data-name="${p.name}" data-brand="${p.brand}"
        data-price="${finalPrice}" data-img="${p.image}"
        data-category="${p.category}"
        ${!p.isInStock?'disabled':''}>
        ${p.isInStock ? 'Add to Cart' : 'Out of Stock'}
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
 
  document.getElementById('shown-count').textContent = filtered.length;
 
  if (!filtered.length) {
    grid.innerHTML = '';
    noRes.classList.add('show');
  } else {
    noRes.classList.remove('show');
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
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(Number(btn.dataset.id)); });
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
document.getElementById('sort-select').addEventListener('change', function() { activeSort=this.value; applyFilters(); });


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
  document.getElementById('price-min-label').textContent=`$${mn}`;
  document.getElementById('price-max-label').textContent=`$${mx}`;
  const pct=(v,min=0,max=350)=>((v-min)/(max-min))*100;
  const fill=document.getElementById('range-fill');
  fill.style.left=pct(mn)+'%';
  fill.style.width=(pct(mx)-pct(mn))+'%';
  applyFilters();
}
 
 
/* ═══════════════════════════════════════
   AVAILABILITY CHECKBOXES
═══════════════════════════════════════ */
document.getElementById('filter-instock').addEventListener('change',function(){filterInStock=this.checked;applyFilters()});
document.getElementById('filter-sale')   .addEventListener('change',function(){filterSale=this.checked;applyFilters()});
document.getElementById('filter-new')    .addEventListener('change',function(){filterNew=this.checked;applyFilters()});
document.getElementById('filter-limited').addEventListener('change',function(){filterLimited=this.checked;applyFilters()});
 
/* ═══════════════════════════════════════
   ACTIVE FILTER TAGS
═══════════════════════════════════════ */
function renderActiveTags() {
  const cont = document.getElementById('active-tags');
  const tags = [];
  if (searchQuery)              tags.push({label:`"${searchQuery}"`,   clear:()=>{searchQuery='';document.getElementById('searchInput').value='';applyFilters()}});
  if (activeCategory!=='all')   tags.push({label:activeCategory,       clear:()=>{activeCategory='all';document.querySelector('.fchip[data-filter="all"]').click()}});
  activeBrands.forEach(b=>      tags.push({label:b,                    clear:()=>{document.querySelector(`input[name="brand"][value="${b}"]`).checked=false;syncBrands();applyFilters()}}));
  if (priceMin>0)               tags.push({label:`From $${priceMin}`,  clear:()=>{document.getElementById('range-min').value=0;updatePriceRange()}});
  if (priceMax<350)             tags.push({label:`To $${priceMax}`,    clear:()=>{document.getElementById('range-max').value=350;updatePriceRange()}});
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
  searchQuery=''; document.getElementById('searchInput').value='';
  activeCategory='all'; activeBrands=[]; activeRating=0;
  priceMin=0; priceMax=350;
  filterSale=filterNew=filterLimited=filterInStock=false; activeSort='default';
  document.querySelectorAll('input[name="brand"]').forEach(cb=>cb.checked=false);
  document.getElementById('range-min').value=0;
  document.getElementById('range-max').value=350;
  ['filter-sale','filter-new','filter-limited','filter-instock'].forEach(id=>document.getElementById(id).checked=false);
  document.getElementById('sort-select').value='default';
  document.querySelectorAll('.fchip[data-filter]').forEach(c=>c.classList.remove('active'));
  document.querySelector('.fchip[data-filter="all"]').classList.add('active');
  updatePriceRange();
}
 
function showResetBtn() {
  const has = activeBrands.length||priceMin>0||priceMax<350||
    filterSale||filterNew||filterLimited||filterInStock||activeCategory!=='all'||searchQuery;
  document.getElementById('btn-reset').classList.toggle('visible', !!has);
}
document.getElementById('btn-reset').addEventListener('click', resetAll);
 
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
