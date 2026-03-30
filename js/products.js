/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
let allProducts    = [];
let favorites      = [];
let cart           = [];
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
   LOAD PRODUCTS — fetch JSON, fallback inline
═══════════════════════════════════════ */
async function loadProducts() {
  try {
    const res  = await fetch('../data/products.json');
    const data = await res.json();
    allProducts = data.products;

    console.log("Loaded:", allProducts);

  } catch (err) {
    console.error("Fetch failed:", err);
    allProducts = [];
  }

  applyFilters();
}
 
/* ═══════════════════════════════════════
   CREATE CARD HTML — same as products-loader.js
═══════════════════════════════════════ */
function createProductCard(p) {
  const finalPrice = p.isOnSale ? (p.price * (1 - p.discount/100)).toFixed(2) : p.price;
  const wished     = favorites.includes(p.id);
  return `
  <div class="product-card">
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
 
  syncBrands();
  renderActiveTags();
  showResetBtn();
}
 
/* ═══════════════════════════════════════
   CARD LISTENERS (cart + wishlist)
═══════════════════════════════════════ */
function attachCardListeners() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.disabled) return;
      const {name, brand, price, img} = btn.dataset;
      const id = name.toLowerCase().replace(/\s+/g,'-');
      const ex = cart.find(i=>i.id===id);
      if (ex) ex.qty++; else cart.push({id,name,brand,price:Number(price),img,qty:1});
      updateCartCount(); renderCart(); openCart();
    });
  });
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
document.getElementById('searchInput').addEventListener('input', function() {
  searchQuery = this.value.trim();
  applyFilters();
  if (searchQuery) document.querySelector('.shop-layout').scrollIntoView({behavior:'smooth',block:'start'});
});

 
/* ═══════════════════════════════════════
   CART
═══════════════════════════════════════ */
function updateCartCount() {
  const total=cart.reduce((s,i)=>s+i.qty,0);
  const el=document.getElementById('cart-count');
  el.textContent=total; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function calcTotal(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }
function renderCart() {
  const cont=document.getElementById('cart-items');
  document.getElementById('cart-total-price').textContent=`$${calcTotal()}`;
  if (!cart.length) { cont.innerHTML=`<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty.<br>Add some kicks!</p></div>`; return; }
  cont.innerHTML=cart.map(item=>`
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-details">
        <span class="cart-item-brand">${item.brand}</span>
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${item.price*item.qty}</span>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-number">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeItem('${item.id}')"><i class="fa-solid fa-xmark"></i></button>
    </div>`).join('');
}
function changeQty(id,d){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=d;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);updateCartCount();renderCart()}
function removeItem(id){cart=cart.filter(i=>i.id!==id);updateCartCount();renderCart()}
function openCart() {document.getElementById('cart-sidebar').classList.add('open');document.getElementById('cart-overlay').classList.add('open');document.body.style.overflow='hidden'}
function closeCart(){document.getElementById('cart-sidebar').classList.remove('open');document.getElementById('cart-overlay').classList.remove('open');document.body.style.overflow=''}
document.getElementById('cartIconWrapper').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);
 
/* ═══════════════════════════════════════
   WISHLIST — same logic as main.js
═══════════════════════════════════════ */
function updateWishlistCount() {
  const el=document.getElementById('wishlist-count');
  el.textContent=favorites.length; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function toggleWishlistSidebar() {
  renderWishlistItems();
  document.getElementById('wishlist-sidebar').classList.toggle('open');
  document.getElementById('wishlist-overlay').classList.toggle('open');
}
function toggleFavorite(productId) {
  const idx=favorites.indexOf(productId);
  if(idx>-1) favorites.splice(idx,1); else favorites.push(productId);
  updateWishlistCount(); renderWishlistItems();
  document.querySelectorAll(`.favorite-btn[data-id="${productId}"]`).forEach(btn=>{
    const w=favorites.includes(productId);
    btn.classList.toggle('active',w);
    btn.querySelector('i').className=w?'fa-solid fa-heart':'fa-regular fa-heart';
  });
}
function renderWishlistItems() {
  const cont=document.getElementById('wishlist-items');
  if(!cont) return;
  if(!favorites.length){cont.innerHTML=`<div class="cart-empty"><i class="fa-regular fa-heart"></i><p>Your wishlist is empty!</p></div>`;return}
  const favProds=allProducts.filter(p=>favorites.includes(p.id));
  cont.innerHTML=favProds.map(item=>`
    <div class="wishlist-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="wishlist-item-info">
        <span class="wishlist-item-name">${item.name}</span>
        <span class="product-price" style="color:var(--gold);font-weight:800">$${item.price}</span>
      </div>
      <button class="cart-item-remove" onclick="toggleFavorite(${item.id})"><i class="fa-solid fa-trash-can"></i></button>
    </div>`).join('');
}
document.getElementById('wishlistIconWrapper').addEventListener('click',toggleWishlistSidebar);
document.getElementById('wishlist-close').addEventListener('click',toggleWishlistSidebar);
document.getElementById('wishlist-overlay').addEventListener('click',toggleWishlistSidebar);
document.getElementById('move-all-to-cart')?.addEventListener('click',()=>{
  if(!favorites.length) return;
  favorites.forEach(id=>{
    const p=allProducts.find(x=>x.id===id); if(!p) return;
    const cid=p.name.toLowerCase().replace(/\s+/g,'-');
    const ex=cart.find(i=>i.id===cid);
    if(ex) ex.qty++; else cart.push({id:cid,name:p.name,brand:p.brand,price:p.price,img:p.image,qty:1});
  });
  favorites=[];
  updateWishlistCount();updateCartCount();renderCart();renderWishlistItems();
  document.querySelectorAll('.favorite-btn').forEach(btn=>{btn.classList.remove('active');btn.querySelector('i').className='fa-regular fa-heart';});
  toggleWishlistSidebar(); openCart();
});
 
/* ═══════════════════════════════════════
   HAMBURGER
═══════════════════════════════════════ */
const hamburger=document.getElementById('hamburger'),navLinks=document.getElementById('navbar-links');
hamburger.addEventListener('click',()=>{hamburger.classList.toggle('open');navLinks.classList.toggle('open')});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{hamburger.classList.remove('open');navLinks.classList.remove('open')}));
 
/* ═══════════════════════════════════════
   NAVBAR SCROLL
═══════════════════════════════════════ */
window.addEventListener('scroll',()=>{
  document.querySelector('.navbar').style.boxShadow=window.scrollY>10?'0 4px 40px rgba(0,0,0,.6)':'none';
});
 
/* ═══════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════ */
function runScrollReveal() {
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        setTimeout(()=>{e.target.style.opacity='1';e.target.style.transform='translateY(0)';},i*55);
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.08});
  document.querySelectorAll('.product-card').forEach(el=>{
    el.style.opacity='0';el.style.transform='translateY(20px)';
    el.style.transition='opacity .45s ease, transform .45s ease';
    obs.observe(el);
  });
}
 

 
/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
  updateWishlistCount();
  loadProducts();
});
