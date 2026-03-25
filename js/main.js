const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navbar-links');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
});

// ══════════════════════════════════════
// SELECTORS
// ══════════════════════════════════════

const cartSidebar   = document.getElementById('cart-sidebar');
const cartOverlay   = document.getElementById('cart-overlay');
const cartClose     = document.getElementById('cart-close');
const cartIcon      = document.querySelector('.cart-icon-wrapper');
const cartCountEl   = document.getElementById('cart-count');
const cartItemsEl   = document.getElementById('cart-items');
const cartTotalEl   = document.getElementById('cart-total-price');

// ══════════════════════════════════════
// CART DATA — this is our "database" for now
// ══════════════════════════════════════

let cartItems = [];

// ══════════════════════════════════════
// FUNCTIONS
// ══════════════════════════════════════

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
}

function addToCart(brand, name, price, img) {

  // Check if item already exists in cart
  const existing = cartItems.find(item => item.name === name);

  if (existing) {
    // If yes — just increase quantity
    existing.quantity += 1;
  } else {
    // If no — add new item to the array
    cartItems.push({
      brand,
      name,
      price,
      img,
      quantity: 1
    });
  }

  updateCart();
}
function increaseQty(name) {
  const item = cartItems.find(item => item.name === name);
  item.quantity += 1;
  updateCart();
}

function decreaseQty(name) {
  const item = cartItems.find(item => item.name === name);
  if (item.quantity === 1) {
    removeFromCart(name);
  } else {
    item.quantity -= 1;
    updateCart();
  }
}


function updateCart() {

  // 1. Update the count badge
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalCount;

  // Hide badge when empty, show when not
  cartCountEl.style.display = totalCount === 0 ? 'none' : 'flex';
  cartCountEl.textContent = totalCount;

  // 2. Update total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalEl.textContent = '$' + totalPrice;

  // 3. Re-render items in sidebar
  renderCartItems();
}

function renderCartItems() {

  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    return;
  }

  cartItemsEl.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" />
      <div class="cart-item-details">
        <span class="cart-item-brand">${item.brand}</span>
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${item.price * item.quantity}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="decreaseQty('${item.name}')">
          <i class="fa-solid fa-minus"></i>
        </button>
        <span class="qty-number">${item.quantity}</span>
        <button class="qty-btn" onclick="increaseQty('${item.name}')">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `).join('');
}

function removeFromCart(name) {
  cartItems = cartItems.filter(item => item.name !== name);
  updateCart();
}

// ══════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════

cartIcon.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {

    // Grab data from the card this button lives inside
    const card  = button.closest('.product-card');
    const brand = card.querySelector('.product-brand').textContent;
    const name  = card.querySelector('.product-name').textContent;
    const price = parseFloat(card.querySelector('.product-price').textContent.replace('$', ''));
    const img   = card.querySelector('.product-img img').src;

    addToCart(brand, name, price, img);
    openCart();
  });
});


