  /* ─────────────────────────────────────
     EMAILJS CONFIG
     Replace the three values below with
     your real keys from emailjs.com
  ───────────────────────────────────── */
  const EJ_PUBLIC_KEY   = 'OrryirlwdCSiQXn6I';
  const EJ_SERVICE_ID   = 'service_hvs43ha';
  const EJ_TEMPLATE_ID  = 'template_9b2840n';
 
  emailjs.init(EJ_PUBLIC_KEY);
 
  /* ── Form submit ── */
  document.getElementById('submitBtn').addEventListener('click', function () {
    const fname   = document.getElementById('fname').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();
 
    /* validate required fields */
    let valid = true;
    [
      { id: 'fname',   val: fname },
      { id: 'email',   val: email },
      { id: 'subject', val: subject },
      { id: 'message', val: message }
    ].forEach(({ id, val }) => {
      const el = document.getElementById(id);
      if (!val) {
        el.style.borderColor = 'var(--red)';
        el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
        valid = false;
      }
    });
    if (!valid) return;
 
    /* loading state */
    const btn = this;
    btn.classList.add('loading');
    btn.innerHTML = 'Sending… <i class="fa-solid fa-spinner fa-spin"></i>';
 
    /* send via EmailJS */
    emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_ID, {
      from_name:  fname,
      from_email: email,
      phone:      document.getElementById('phone').value.trim() || 'Not provided',
      subject:    subject,
      message:    message,
    })
    .then(() => {
      document.getElementById('contactForm').style.display = 'none';
      document.getElementById('formSuccess').classList.add('show');
    })
    .catch((err) => {
      btn.classList.remove('loading');
      btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
      alert('Something went wrong. Please try again.');
      console.error('EmailJS error:', err);
    });
  });
 
  /* ── Reset form ── */
  document.getElementById('resetBtn').addEventListener('click', function () {
    ['fname', 'lname', 'email', 'phone', 'subject', 'message']
      .forEach(id => { document.getElementById(id).value = ''; });
    const btn = document.getElementById('submitBtn');
    btn.classList.remove('loading');
    btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
    document.getElementById('contactForm').style.display = 'block';
    document.getElementById('formSuccess').classList.remove('show');
  });
 
  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
 
  /* ── Scroll-in animations ── */
  const animEls = document.querySelectorAll('.info-card, .faq-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = e.target.classList.contains('info-card')
          ? 'translateX(0)' : 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  animEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transition = `opacity .5s ${i * 0.07}s ease, transform .5s ${i * 0.07}s ease`;
    el.style.transform = el.classList.contains('info-card') ? 'translateX(-16px)' : 'translateY(16px)';
    obs.observe(el);
  });