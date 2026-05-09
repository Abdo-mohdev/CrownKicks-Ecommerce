/* ═══════════════════════════════════════════
   PRODUCTS LOADER - Fetch from JSON
═══════════════════════════════════════════ */

const upcomingOutletDrops = [
  {
    name: 'Adidas Gazelle Indoor',
    brand: 'Adidas',
    price: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80',
    note: 'Expected original outlet drop'
  },
  {
    name: 'Adidas Campus 00s',
    brand: 'Adidas',
    price: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    note: 'Waiting for size availability'
  },
  {
    name: 'Adidas Spezial',
    brand: 'Adidas',
    price: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
    note: 'Planned outlet catalog item'
  },
  {
    name: 'New Balance 550',
    brand: 'New Balance',
    price: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
    note: 'Future mixed outlet stock'
  }
];

function getHomeSambaDrops() {
  return allProducts.filter(product => product.homeDrop).slice(0, 4);
}

function renderUpcomingDrops() {
  const container = document.getElementById('limited-offers-grid');
  if (!container) return;

  container.innerHTML = upcomingOutletDrops.map(item => `
    <div class="product-card coming-soon">
      <div class="product-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <span class="new-badge"><i class="fa-solid fa-clock"></i> SOON</span>
      </div>
      <div class="product-info">
        <span class="product-brand">${item.brand}</span>
        <h3 class="product-name">${item.name}</h3>
        <div class="product-rating">
          <i class="fa-solid fa-circle-info"></i>
          <span>Outlet Watchlist</span>
        </div>
        <span class="product-price"><span>${item.price}</span></span>
        <button class="add-to-cart" disabled>Coming Soon</button>
        <span class="coming-soon-note">${item.note}</span>
      </div>
    </div>
  `).join('');
}

function setupHeroCarousel(products) {
  const imageEl = document.getElementById('heroShoeImage');
  const nameEl = document.getElementById('heroProductName');
  const priceEl = document.getElementById('heroProductPrice');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const dotsEl = document.getElementById('heroDots');
  if (!imageEl || !nameEl || !priceEl || !prevBtn || !nextBtn || !dotsEl || !products.length) return;

  let activeIndex = 0;

  function renderSlide(index) {
    const product = products[index];
    imageEl.src = product.image;
    imageEl.alt = product.name;
    nameEl.textContent = product.name;
    priceEl.textContent = 'EGP ' + calculateFinalPrice(product);
    dotsEl.querySelectorAll('.hero-carousel-dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function goToSlide(index) {
    activeIndex = (index + products.length) % products.length;
    renderSlide(activeIndex);
  }

  dotsEl.innerHTML = products.map((product, index) => `
    <button type="button" class="hero-carousel-dot" aria-label="Show ${product.name}" data-index="${index}"></button>
  `).join('');

  dotsEl.querySelectorAll('.hero-carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(Number(dot.dataset.index)));
  });

  prevBtn.addEventListener('click', () => goToSlide(activeIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(activeIndex + 1));
  renderSlide(activeIndex);
}

document.addEventListener('DOMContentLoaded', async function() {
  await loadProductsData('./data/products.json');

  const sambaDrops = getHomeSambaDrops();
  renderProducts(sambaDrops, 'products-grid');
  renderUpcomingDrops();
  renderFeaturedProducts();
  setupHeroCarousel(sambaDrops);
});


