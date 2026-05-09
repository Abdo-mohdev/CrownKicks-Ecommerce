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

function formatMoney(amount) {
  return 'EGP ' + Number(amount).toFixed(2);
}

function getItemVariantText(item) {
  return [item.size ? 'Size ' + item.size : '', item.color || ''].filter(Boolean).join(' / ');
}

function saveLocalOrder(order) {
  // Temporary local order storage until Firebase replaces this.
  try {
    const orders = JSON.parse(localStorage.getItem('pseg_orders') || '[]');
    orders.push(order);
    localStorage.setItem('pseg_orders', JSON.stringify(orders));
  } catch (e) {
    console.warn('Could not save local order:', e);
  }
}

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char];
  });
}

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
  if (subEl)   subEl.textContent   = formatMoney(subtotal);
  if (shipEl)  shipEl.textContent  = shipping === 0 ? 'Free' : formatMoney(shipping);
  if (totalEl) totalEl.textContent = formatMoney(total);

  container.innerHTML = cart.map(function (item) {
    return `
      <div class="summary-item">
        <img class="summary-item-img" src="${item.img}" alt="${item.name}">
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          ${getItemVariantText(item) ? `<div class="summary-item-variant">${getItemVariantText(item)}</div>` : ''}
          <div class="summary-item-qty">Qty: ${item.qty}</div>
        </div>
        <span class="summary-item-price">${formatMoney(item.price * item.qty)}</span>
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
    return false;
  }

  const emailEl = document.getElementById('email');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
  if (!emailOk) {
    emailEl.classList.add('error');
    showToast('Invalid Email', 'Please enter a valid email address', 'error');
    emailEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  return true;
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
      <span class="review-detail-value">${escapeHTML(orderDetails.firstName)} ${escapeHTML(orderDetails.lastName)}</span>
    </div>
    <div class="review-detail-row">
      <span class="review-detail-label">Email</span>
      <span class="review-detail-value">${escapeHTML(orderDetails.email)}</span>
    </div>
    <div class="review-detail-row">
      <span class="review-detail-label">Phone</span>
      <span class="review-detail-value">${escapeHTML(orderDetails.phone)}</span>
    </div>
    <div class="review-detail-row">
      <span class="review-detail-label">Address</span>
      <span class="review-detail-value">${escapeHTML(address)}</span>
    </div>
    ${orderDetails.notes ? `
    <div class="review-detail-row">
      <span class="review-detail-label">Notes</span>
      <span class="review-detail-value">${escapeHTML(orderDetails.notes)}</span>
    </div>` : ''}
  `;

  itemsEl.innerHTML = cart.map(function (item) {
    return `
      <div class="review-item">
        <img class="review-item-img" src="${item.img}" alt="${item.name}">
        <div class="review-item-info">
          <div class="review-item-name">${item.name}</div>
          <div class="review-item-brand">${[item.brand, getItemVariantText(item), 'Qty ' + item.qty].filter(Boolean).join(' / ')}</div>
        </div>
        <span class="review-item-price">${formatMoney(item.price * item.qty)}</span>
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

  const subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total    = subtotal + shipping;

  const orderItems = cart.map(function (item) {
    return {
      productId: item.productId || null,
      name: item.name,
      brand: item.brand,
      size: item.size || '',
      color: item.color || '',
      qty: item.qty,
      unitPrice: item.price,
      lineTotal: Number((item.price * item.qty).toFixed(2))
    };
  });

  const itemsList = orderItems.map(function (item) {
    const variant = [item.size ? 'Size ' + item.size : '', item.color].filter(Boolean).join(' / ');
    return item.name + (variant ? ' (' + variant + ')' : '') + ' x' + item.qty + ' - ' + formatMoney(item.lineTotal);
  }).join('\n');

  const address = [
    orderDetails.street,
    orderDetails.apartment,
    orderDetails.area,
    orderDetails.city
  ].filter(Boolean).join(', ');

  const order = {
    orderNumber: orderNum,
    createdAt: new Date().toISOString(),
    status: 'pending_confirmation',
    paymentMethod: 'Cash on Delivery',
    customer: {
      name: orderDetails.firstName + ' ' + orderDetails.lastName,
      email: orderDetails.email,
      phone: orderDetails.phone
    },
    delivery: {
      city: orderDetails.city,
      area: orderDetails.area,
      street: orderDetails.street,
      apartment: orderDetails.apartment,
      address: address,
      notes: orderDetails.notes || ''
    },
    items: orderItems,
    totals: {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2))
    }
  };

  // EmailJS template variables
  const templateParams = {
    order_number   : orderNum,
    customer_name  : orderDetails.firstName + ' ' + orderDetails.lastName,
    customer_email : orderDetails.email,
    customer_phone : orderDetails.phone,
    delivery_address: address,
    order_notes    : orderDetails.notes || 'None',
    items_list     : itemsList,
    subtotal       : formatMoney(subtotal),
    shipping       : shipping === 0 ? 'Free' : formatMoney(shipping),
    total          : formatMoney(total),
    payment_method : 'Cash on Delivery',
  };

  emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_ID, templateParams)
    .then(function () {
      // success
      document.getElementById('confirm-sending').style.display = 'none';
      document.getElementById('confirm-success').style.display = 'flex';
      document.getElementById('orderNumber').textContent = orderNum;

      saveLocalOrder(order);

      // Clear cart after successful order and persist that cleared state.
      cart = [];
      updateCartCount();
      renderCart();
      saveCart();

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



