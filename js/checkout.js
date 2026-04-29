/* ═══════════════════════════════════════════
   CHECKOUT.JS
   Cart / Wishlist / Toast → helpers.js
   Navbar / Search / ScrollFade → main.js
═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   EMAILJS CONFIG
   Replace with your real keys
───────────────────────────────────────── */
const EJ_PUBLIC_KEY  = 'OrryirlwdCSiQXn6I';
const EJ_SERVICE_ID  = 'service_hvs43ha';
const EJ_TEMPLATE_ID = 'template_4ag9o1j';

emailjs.init(EJ_PUBLIC_KEY);

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let currentStep = 1;
let orderDetails = {};

/* ─────────────────────────────────────────
   INIT — check cart on load
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // If cart is empty redirect back to shop
  if (!cart || cart.length === 0) {
    showEmptyCart();
    return;
  }

  renderSummary();
  goToStep(1);
});

/* ─────────────────────────────────────────
   EMPTY CART STATE
───────────────────────────────────────── */
function showEmptyCart() {
  const layout = document.querySelector('.checkout-layout');
  const hero   = document.querySelector('.checkout-hero');
  if (hero) hero.style.display = 'none';
  if (layout) {
    layout.innerHTML = `
      <div class="checkout-empty" style="grid-column:1/-1">
        <i class="fa-solid fa-bag-shopping"></i>
        <h2>Your Cart is Empty</h2>
        <p>Add some items before checking out.</p>
        <a href="products.html" class="btn-primary">
          Browse Products <i class="fa-solid fa-arrow-right-long"></i>
        </a>
      </div>`;
  }
}

/* ─────────────────────────────────────────
   RENDER ORDER SUMMARY (right column)
───────────────────────────────────────── */
function renderSummary() {
  const container = document.getElementById('summary-items');
  const countEl   = document.getElementById('summary-count');
  const subEl     = document.getElementById('summary-subtotal');
  const shipEl    = document.getElementById('summary-shipping');
  const totalEl   = document.getElementById('summary-total');

  if (!container) return;

  const totalItems = cart.reduce(function (s, i) { return s + i.qty; }, 0);
  const subtotal   = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  const shipping   = subtotal >= 100 ? 0 : 10;
  const total      = subtotal + shipping;

  if (countEl) countEl.textContent = totalItems + ' item' + (totalItems !== 1 ? 's' : '');
  if (subEl)   subEl.textContent   = '$' + subtotal.toFixed(2);
  if (shipEl)  shipEl.textContent  = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);
  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

  container.innerHTML = cart.map(function (item) {
    return `
      <div class="summary-item">
        <img class="summary-item-img" src="${item.img}" alt="${item.name}">
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-qty">Qty: ${item.qty}</div>
        </div>
        <span class="summary-item-price">$${(item.price * item.qty).toFixed(2)}</span>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────
   STEP NAVIGATION
───────────────────────────────────────── */
function goToStep(n) {
  // hide all panels
  document.querySelectorAll('.checkout-step-panel').forEach(function (p) {
    p.classList.remove('active');
  });

  // show target panel
  const panel = document.getElementById('step-' + n);
  if (panel) panel.classList.add('active');

  // update step indicators
  for (var i = 1; i <= 3; i++) {
    const ind = document.getElementById('step-indicator-' + i);
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    if (i < n)  ind.classList.add('done');
    if (i === n) ind.classList.add('active');
  }

  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────────────────────────────────
   STEP 1 → STEP 2 (validate & review)
───────────────────────────────────────── */
document.getElementById('btn-to-review')?.addEventListener('click', function () {
  if (!validateStep1()) return;
  buildOrderDetails();
  renderReview();
  goToStep(2);
});

function validateStep1() {
  const required = ['firstName', 'lastName', 'email', 'phone', 'city', 'area', 'street'];
  let valid = true;

  required.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('error');
    if (!el.value.trim()) {
      el.classList.add('error');
      el.addEventListener('input', function () { el.classList.remove('error'); }, { once: true });
      valid = false;
    }
  });

  if (!valid) {
    showToast('Missing Fields', 'Please fill in all required fields', 'error');
    // scroll to first error
    const firstError = document.querySelector('.form-group input.error, .form-group select.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function buildOrderDetails() {
  orderDetails = {
    firstName : document.getElementById('firstName').value.trim(),
    lastName  : document.getElementById('lastName').value.trim(),
    email     : document.getElementById('email').value.trim(),
    phone     : document.getElementById('phone').value.trim(),
    city      : document.getElementById('city').value,
    area      : document.getElementById('area').value.trim(),
    street    : document.getElementById('street').value.trim(),
    apartment : document.getElementById('apartment').value.trim(),
    notes     : document.getElementById('notes').value.trim(),
  };
}

/* ─────────────────────────────────────────
   RENDER REVIEW (step 2)
───────────────────────────────────────── */
function renderReview() {
  const detailsEl = document.getElementById('review-details');
  const itemsEl   = document.getElementById('review-items');
  if (!detailsEl || !itemsEl) return;

  const address = [
    orderDetails.street,
    orderDetails.apartment,
    orderDetails.area,
    orderDetails.city
  ].filter(Boolean).join(', ');

  detailsEl.innerHTML = `
    <div class="review-detail-row">
      <span class="review-detail-label">Name</span>
      <span class="review-detail-value">${orderDetails.firstName} ${orderDetails.lastName}</span>
    </div>
    <div class="review-detail-row">
      <span class="review-detail-label">Email</span>
      <span class="review-detail-value">${orderDetails.email}</span>
    </div>
    <div class="review-detail-row">
      <span class="review-detail-label">Phone</span>
      <span class="review-detail-value">${orderDetails.phone}</span>
    </div>
    <div class="review-detail-row">
      <span class="review-detail-label">Address</span>
      <span class="review-detail-value">${address}</span>
    </div>
    ${orderDetails.notes ? `
    <div class="review-detail-row">
      <span class="review-detail-label">Notes</span>
      <span class="review-detail-value">${orderDetails.notes}</span>
    </div>` : ''}
  `;

  itemsEl.innerHTML = cart.map(function (item) {
    return `
      <div class="review-item">
        <img class="review-item-img" src="${item.img}" alt="${item.name}">
        <div class="review-item-info">
          <div class="review-item-name">${item.name}</div>
          <div class="review-item-brand">${item.brand} · Qty ${item.qty}</div>
        </div>
        <span class="review-item-price">$${(item.price * item.qty).toFixed(2)}</span>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────
   STEP 2 → STEP 1 (back)
───────────────────────────────────────── */
document.getElementById('btn-back-to-details')?.addEventListener('click', function () {
  goToStep(1);
});

document.getElementById('btn-edit-details')?.addEventListener('click', function () {
  goToStep(1);
});

/* ─────────────────────────────────────────
   STEP 2 → STEP 3 (place order)
───────────────────────────────────────── */
document.getElementById('btn-to-confirm')?.addEventListener('click', function () {
  goToStep(3);
  placeOrder();
});

/* ─────────────────────────────────────────
   PLACE ORDER — send email via EmailJS
───────────────────────────────────────── */
function placeOrder() {
  // show sending state
  document.getElementById('confirm-sending').style.display  = 'flex';
  document.getElementById('confirm-success').style.display  = 'none';
  document.getElementById('confirm-error').style.display    = 'none';

  // generate order number
  const orderNum = 'PSE-' + Date.now().toString().slice(-6);

  // build items string for email
  const itemsList = cart.map(function (item) {
    return item.name + ' x' + item.qty + ' — $' + (item.price * item.qty).toFixed(2);
  }).join('\n');

  const subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total    = subtotal + shipping;

  const address = [
    orderDetails.street,
    orderDetails.apartment,
    orderDetails.area,
    orderDetails.city
  ].filter(Boolean).join(', ');

  // EmailJS template variables
  const templateParams = {
    order_number   : orderNum,
    customer_name  : orderDetails.firstName + ' ' + orderDetails.lastName,
    customer_email : orderDetails.email,
    customer_phone : orderDetails.phone,
    delivery_address: address,
    order_notes    : orderDetails.notes || 'None',
    items_list     : itemsList,
    subtotal       : '$' + subtotal.toFixed(2),
    shipping       : shipping === 0 ? 'Free' : '$' + shipping.toFixed(2),
    total          : '$' + total.toFixed(2),
    payment_method : 'Cash on Delivery',
  };

  emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_ID, templateParams)
    .then(function () {
      // success
      document.getElementById('confirm-sending').style.display = 'none';
      document.getElementById('confirm-success').style.display = 'flex';
      document.getElementById('orderNumber').textContent = orderNum;

      // clear cart after successful order
      cart = [];
      updateCartCount();
      renderCart();

      showToast('Order Placed!', 'Check your email for confirmation', 'success');
    })
    .catch(function (err) {
      // error
      console.error('EmailJS error:', err);
      document.getElementById('confirm-sending').style.display = 'none';
      document.getElementById('confirm-error').style.display   = 'flex';
      showToast('Order Failed', 'Please try again', 'error');
    });
}

/* ─────────────────────────────────────────
   RETRY BUTTON
───────────────────────────────────────── */
document.getElementById('btn-retry')?.addEventListener('click', function () {
  placeOrder();
});



