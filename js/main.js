/* ═══════════════════════════════════════════
   MAIN.JS — page-level logic only
   Cart / Wishlist / Toast → helpers.js
═══════════════════════════════════════════ */
 
/* ═══════════════════════════════════════════
   HAMBURGER / MOBILE MENU
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navbar-links');
 
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
 
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
});
 
/* ═══════════════════════════════════════════
   PRODUCT CARD NAVIGATION
═══════════════════════════════════════════ */
document.addEventListener('click', function (e) {
  if (e.target.closest('.add-to-cart') || e.target.closest('.favorite-btn')) return;
 
  const card = e.target.closest('.product-card');
  if (card && card.dataset.productId) {
    const path = window.location.pathname.includes('pages/')
      ? 'product-detail.html'
      : 'pages/product-detail.html';
    window.location.href = path + '?id=' + card.dataset.productId;
  }
});
 
/* ═══════════════════════════════════════════
   SEARCH — live search across all pages
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const searchInput  = document.getElementById('searchInput');
  const drawerSearch = document.getElementById('drawerSearch');
 
  function handleSearch(q) {
    if (typeof searchQuery !== 'undefined') {
      searchQuery = q;
      applyFilters();
      if (q) {
        setTimeout(function () {
          const grid = document.querySelector('.products-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      const cards     = document.querySelectorAll('.product-card, .featured-card');
      let firstMatch  = null;
 
      cards.forEach(function (card) {
        const name     = (card.querySelector('.product-name')  || {}).textContent || '';
        const brand    = (card.querySelector('.product-brand') || {}).textContent || '';
        const category = card.getAttribute('data-category')   || '';
        const matches  = !q ||
          name.toLowerCase().includes(q) ||
          brand.toLowerCase().includes(q) ||
          category.toLowerCase().includes(q);
 
        card.style.opacity       = matches ? '1'    : '0.3';
        card.style.transform     = matches ? 'scale(1)' : 'scale(0.95)';
        card.style.transition    = 'opacity .3s, transform .3s';
        card.style.pointerEvents = matches ? 'auto' : 'none';
 
        if (matches && !firstMatch) firstMatch = card;
      });
 
      if (q && firstMatch) {
        setTimeout(function () {
          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }
 
  [searchInput, drawerSearch].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      if (this === searchInput  && drawerSearch) drawerSearch.value = this.value;
      if (this === drawerSearch && searchInput)  searchInput.value  = this.value;
      handleSearch(q);
    });
  });
});
 
/* ═══════════════════════════════════════════
   NAVBAR SCROLL SHADOW
═══════════════════════════════════════════ */
window.addEventListener('scroll', function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 10
    ? '0 4px 40px rgba(0,0,0,.6)'
    : 'none';
});
 
/* ═══════════════════════════════════════════
   SCROLL FADE-IN (Intersection Observer)
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
 
  document.querySelectorAll('.product-card, .featured-card, .card').forEach(function (el) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = 'opacity .5s ease, transform .55s ease';
    observer.observe(el);
  });
});
 
/* ═══════════════════════════════════════════
   STORE INTRO — doors animation
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const intro = document.getElementById('storeIntro');
  const site  = document.getElementById('siteWrapper');
  if (!intro) return;
 
  setTimeout(function () {
    intro.classList.add('open');
  }, 1000);
 
  setTimeout(function () {
    intro.classList.add('done');
    if (site) site.classList.add('show');
    setTimeout(function () { intro.remove(); }, 1000);
  }, 4000);
});