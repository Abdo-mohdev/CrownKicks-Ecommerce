/* ═══════════════════════════════════════════
   PRODUCTS LOADER - Fetch from JSON
═══════════════════════════════════════════ */

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  await loadProductsData('./data/products.json');
  
  const newArrivals = getNewArrivals();
  renderProducts(newArrivals, 'products-grid');   

  const limitedOffers = getLimitedOffers();
  renderProducts(limitedOffers, 'limited-offers-grid');

  // Render featured products
  renderFeaturedProducts();
});


