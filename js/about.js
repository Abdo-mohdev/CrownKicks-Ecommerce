/* ═══════════════════════════════════════════
   ABOUT.JS — page-specific logic only
   Navbar / Cart / Wishlist / Toast → helpers.js
   Hamburger / Search / ScrollFade  → main.js
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   STAT COUNTER ANIMATION
═══════════════════════════════════════════ */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const isFloat = target % 1 !== 0;
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Trigger counters when stats bar enters viewport
document.addEventListener('DOMContentLoaded', function () {
  const statEls = document.querySelectorAll('.astat-num[data-target]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statEls.forEach(function (el) { observer.observe(el); });
});

/* ═══════════════════════════════════════════
   TIMELINE REVEAL
   Each item slides in as it enters viewport
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.tl-item');
  if (!items.length) return;

  items.forEach(function (item) {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = 'opacity .5s ease, transform .5s ease';
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(function (item) { observer.observe(item); });
});

/* ═══════════════════════════════════════════
   REVIEW CARDS REVEAL
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.review-card');
  if (!cards.length) return;

  cards.forEach(function (card, i) {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity .5s ' + (i * 0.1) + 's ease, transform .5s ' + (i * 0.1) + 's ease';
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(function (card) { observer.observe(card); });
});

/* ═══════════════════════════════════════════
   TRUST CARDS REVEAL
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.trust-card');
  if (!cards.length) return;

  cards.forEach(function (card, i) {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity .5s ' + (i * 0.1) + 's ease, transform .5s ' + (i * 0.1) + 's ease';
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(function (card) { observer.observe(card); });
});
