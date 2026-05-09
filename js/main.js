/* ═══════════════════════════════════════════
   MAIN.JS — page-level logic only
   Cart / Wishlist / Toast → helpers.js
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   HERO CAROUSEL - Full Width Samba Showcase
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselDots = document.getElementById('carouselDots');
  const carouselTimer = document.getElementById('carouselTimer');

  if (!carouselTrack) return;

  let currentSlide = 0;
  let autoPlayInterval;
  let sambaProducts = [];

  // Carousel banner images - PNG shoes with transparent background
  const bannerImages = [
    'assets/images/banner-1.png',
    'assets/images/banner-2.png',
    'assets/images/banner-3.png'
  ];

  // Fetch and render carousel
  fetch('data/products.json')
    .then(res => res.json())
    .then(data => {
      sambaProducts = data.products.filter(p => p.homeDrop === true).slice(0, 3);
      renderCarousel();
      setupCarouselControls();
      startAutoPlay();
    })
    .catch(err => console.error('Carousel load error:', err));

  function renderCarousel() {
    carouselTrack.innerHTML = '';
    sambaProducts.forEach((product, index) => {
      const item = document.createElement('div');
      item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      item.innerHTML = `
        <div class="carousel-content">
          <div class="carousel-label">Original Outlet Drop</div>
          <h2 class="carousel-name">
            ${product.name.split(' ').slice(0, 2).join(' ')}<br>
            <span class="color-text">${product.colors[0]}</span>
          </h2>
          <p class="carousel-desc">${product.description}</p>
          <div class="carousel-price">
            <strong>EGP ${product.price}</strong>
            <span>${product.isInStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
          <div class="carousel-cta">
            <a href="pages/product-detail.html?id=${product.id}" class="btn-primary">
              View Details <i class="fa-solid fa-arrow-right-long"></i>
            </a>
            <a href="pages/products.html" class="btn-outline">Shop All</a>
          </div>
        </div>
        <div class="carousel-image-wrap">
          <img src="${bannerImages[index]}" alt="${product.name}">
        </div>
      `;
      carouselTrack.appendChild(item);
    });

    renderDots();
  }

  function renderDots() {
    carouselDots.innerHTML = '';
    sambaProducts.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${index === currentSlide ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      carouselDots.appendChild(dot);
    });
  }

  function setupCarouselControls() {
    carouselPrev?.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      resetAutoPlay();
    });

    carouselNext?.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      resetAutoPlay();
    });
  }

  function goToSlide(n) {
    currentSlide = (n + sambaProducts.length) % sambaProducts.length;
    updateCarousel();
  }

  function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dot');

    items.forEach((item, index) => {
      item.classList.remove('active');
      if (index === currentSlide) item.classList.add('active');
    });

    dots.forEach((dot, index) => {
      dot.classList.remove('active');
      if (index === currentSlide) dot.classList.add('active');
    });

    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    resetTimer();
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  function resetTimer() {
    if (carouselTimer) {
      carouselTimer.style.animation = 'none';
      void carouselTimer.offsetWidth; // Trigger reflow
      carouselTimer.style.animation = 'carousel-timer-anim 6s linear forwards';
    }
  }
});

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
  if (card && card.classList.contains('coming-soon')) return;
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
