/* SMEC Group — site-wide behaviour (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Icons (Lucide): render <i data-lucide="name">, including markup added later by JS ---------- */
  const drawIcons = () => { if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } }); };
  drawIcons();
  if (window.lucide && 'MutationObserver' in window) {
    let queued = false;
    new MutationObserver(() => {
      if (queued || !document.querySelector('i[data-lucide]')) return;
      queued = true; requestAnimationFrame(() => { queued = false; drawIcons(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- Header scroll state ---------- */
  const header = $('#site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Services mega menu ---------- */
  const megaBtn = $('#mega-toggle');
  const mega = $('#mega');
  if (megaBtn && mega) {
    let closeTimer; let hoverOpenedAt = 0;
    const setMega = (open) => {
      mega.dataset.open = String(open);
      megaBtn.setAttribute('aria-expanded', String(open));
      megaBtn.querySelector('svg').style.transform = open ? 'rotate(180deg)' : '';
      header.classList.toggle('mega-open', open);
    };
    // Ignore the click that immediately follows a hover-open (mouse users)
    megaBtn.addEventListener('click', () => { if (Date.now() - hoverOpenedAt < 400) return; setMega(mega.dataset.open !== 'true'); });
    const li = megaBtn.closest('li');
    [li, mega].forEach((el) => {
      el.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { clearTimeout(closeTimer); if (mega.dataset.open !== 'true') hoverOpenedAt = Date.now(); setMega(true); } });
      el.addEventListener('mouseleave', () => { if (matchMedia('(hover: hover)').matches) closeTimer = setTimeout(() => setMega(false), 160); });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mega.dataset.open === 'true') { setMega(false); megaBtn.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (!mega.contains(e.target) && !megaBtn.contains(e.target)) setMega(false);
    });
    mega.addEventListener('focusout', (e) => {
      if (!mega.contains(e.relatedTarget) && e.relatedTarget !== megaBtn) setMega(false);
    });
  }

  /* ---------- Mobile navigation (focus-trapped dialog) ---------- */
  const mobile = $('#mobile-nav');
  const openBtn = $('#menu-open');
  const closeBtn = $('#menu-close');
  if (mobile && openBtn && closeBtn) {
    const focusables = () => $$('a[href], button:not([disabled])', mobile);
    const setMobile = (open) => {
      mobile.dataset.open = String(open);
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      mobile.inert = !open;
      (open ? closeBtn : openBtn).focus();
    };
    mobile.inert = true;
    openBtn.addEventListener('click', () => setMobile(true));
    closeBtn.addEventListener('click', () => setMobile(false));
    $$('[data-menu-close]', mobile).forEach((el) => el.addEventListener('click', () => setMobile(false)));
    $$('.mnav-panel a[href]', mobile).forEach((a) => a.addEventListener('click', () => setMobile(false)));
    mobile.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMobile(false);
      if (e.key !== 'Tab') return;
      const f = focusables(); const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches && mobile.dataset.open === 'true') setMobile(false); });
  }

  /* ---------- Hero carousel (cross-fade; the active tab's progress line drives autoplay) ---------- */
  $$('[data-carousel]').forEach((root) => {
    const slides = $$('.hero-slide', root);
    const tabs = $$('[data-carousel-dot]', root);
    if (slides.length < 2) return;
    const DUR = (parseFloat(getComputedStyle(root).getPropertyValue('--slide-dur')) || 7) * 1000;
    let i = 0; let timer = null; let remaining = DUR; let startedAt = 0; let paused = false;
    const run = () => { if (paused) return; clearTimeout(timer); startedAt = Date.now(); timer = setTimeout(() => go(i + 1), remaining); };
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        const on = k === i;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        $$('a, button', s).forEach((el) => { el.tabIndex = on ? 0 : -1; });
      });
      tabs.forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
      remaining = DUR; run();
    };
    const pause = (on) => {
      if (on === paused) return;
      paused = on; root.classList.toggle('is-paused', on);
      if (on) { clearTimeout(timer); remaining = Math.max(0, remaining - (Date.now() - startedAt)); } else run();
    };
    tabs.forEach((t) => t.addEventListener('click', () => go(Number(t.dataset.carouselDot))));
    root.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) pause(true); }); root.addEventListener('focusout', () => pause(false));
    root.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    let x0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1); x0 = null; });
    document.addEventListener('visibilitychange', () => pause(document.hidden));
    go(0);

  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add('is-visible'));

  /* ---------- Count-up numbers ---------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduceMotion) { el.textContent = target.toLocaleString('en-IN', { minimumFractionDigits: dec }); return; }
    const start = performance.now(); const dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1); const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } }), { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Accessible tabs ---------- */
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus = true) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t, false));
      t.addEventListener('keydown', (e) => {
        const k = e.key; let n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n); }
      });
    });
  });

  /* ---------- Toggle-button filters (case studies) ---------- */
  $$('[data-filter-group]').forEach((group) => {
    const target = document.getElementById(group.dataset.filterGroup);
    const status = document.getElementById(group.dataset.filterStatus);
    if (!target) return;
    const items = $$('[data-category]', target);
    $$('[data-filter]', group).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-filter]', group).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const f = btn.dataset.filter; let shown = 0;
        items.forEach((it) => {
          const match = f === 'all' || it.dataset.category.split(' ').includes(f);
          it.hidden = !match; if (match) shown++;
        });
        const [one, many] = (group.dataset.filterNoun || 'project|projects').split('|');
        if (status) status.textContent = `Showing ${shown} ${shown === 1 ? one : many}`;
      });
    });
  });

  /* ---------- Scrollspy for in-page side nav ---------- */
  const spy = $('[data-scrollspy]');
  if (spy && 'IntersectionObserver' in window) {
    const links = $$('a[href^="#"]', spy);
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = map.get(en.target.id); if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- Scroll story: highlight the step in view ---------- */
  const steps = $$('.step');
  if (steps.length && 'IntersectionObserver' in window) {
    const stio = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) steps.forEach((s) => { s.dataset.active = String(s === en.target); });
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => stio.observe(s));
    steps[0].dataset.active = 'true';
  }

  /* ---------- Form validation (shared; exposed for careers.js) ---------- */
  const messages = {
    valueMissing: 'This field is required.',
    typeMismatch: { email: 'Enter a valid email address, e.g. name@company.com.', url: 'Enter a full URL, starting with https://' },
    patternMismatch: 'Please check the format.',
    tooShort: (el) => `Please use at least ${el.minLength} characters.`,
  };
  const errorFor = (el) => {
    const v = el.validity;
    if (el.type === 'checkbox' && el.required && !el.checked) return el.dataset.msg || 'Please confirm to continue.';
    if (v.valueMissing) return el.dataset.msg || messages.valueMissing;
    if (v.typeMismatch) return messages.typeMismatch[el.type] || 'Invalid value.';
    if (v.patternMismatch) return el.dataset.patternMsg || messages.patternMismatch;
    if (v.tooShort) return messages.tooShort(el);
    if (v.customError) return el.validationMessage;
    return '';
  };
  const showError = (el, msg) => {
    const box = el.closest('[data-field]') || el.parentElement;
    let err = box.querySelector('.field-error');
    if (!msg) { el.removeAttribute('aria-invalid'); if (err) err.remove(); return; }
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.id = `${el.id || el.name}-error`;
      box.appendChild(err);
    }
    err.innerHTML = `<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5m0 3h.01"/></svg>${msg}`;
    el.setAttribute('aria-invalid', 'true');
    const described = new Set((el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    described.add(err.id); el.setAttribute('aria-describedby', [...described].join(' '));
  };
  const validateField = (el) => { const m = errorFor(el); showError(el, m); return !m; };

  const validateForm = (form) => {
    const fields = $$('input, select, textarea', form).filter((el) => el.willValidate);
    let firstBad = null;
    fields.forEach((el) => { if (!validateField(el) && !firstBad) firstBad = el; });
    const summary = form.querySelector('[data-form-summary]');
    if (summary) {
      summary.hidden = !firstBad;
      if (firstBad) summary.textContent = 'Please review the highlighted fields and try again.';
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  };

  const wireLiveValidation = (form) => {
    $$('input, select, textarea', form).forEach((el) => {
      el.addEventListener('blur', () => { if (el.value || el.hasAttribute('aria-invalid')) validateField(el); });
      el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) validateField(el); });
      el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid')) validateField(el); });
    });
  };

  // Simulated submit — replace with fetch() to your API / form service.
  const fakeSubmit = (form) => new Promise((resolve) => setTimeout(resolve, 900));

  const handleSubmit = (form, onSuccess) => {
    form.setAttribute('novalidate', '');
    wireLiveValidation(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const btn = form.querySelector('[type="submit"]');
      const label = btn.innerHTML;
      btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = '<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3"/></svg> Sending…';
      try {
        await fakeSubmit(form, new FormData(form));
        onSuccess && onSuccess(form);
      } finally {
        btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = label;
      }
    });
  };

  const showSuccess = (form) => {
    const panel = document.getElementById(form.dataset.success);
    if (!panel) return;
    form.hidden = true; panel.hidden = false;
    panel.setAttribute('tabindex', '-1'); panel.focus();
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };

  window.SMEC = { validateForm, validateField, handleSubmit, showSuccess, $, $$ };

  $$('form.js-validate').forEach((f) => handleSubmit(f, showSuccess));

  /* ---------- Newsletter ---------- */
  $$('.js-newsletter').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type=email]');
      const msg = form.querySelector('.js-newsletter-msg');
      if (!input.checkValidity()) { msg.textContent = 'Please enter a valid work email.'; input.focus(); return; }
      msg.textContent = 'Thank you — you’re subscribed.'; form.reset();
    });
  });

  /* ---------- Character counters ---------- */
  $$('textarea[maxlength]').forEach((ta) => {
    const out = document.getElementById(`${ta.id}-count`);
    if (!out) return;
    const upd = () => { out.textContent = `${ta.value.length} / ${ta.maxLength}`; };
    ta.addEventListener('input', upd); upd();
  });

  /* ---------- Open a <details> targeted by the URL hash ---------- */
  const openFromHash = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const d = el && (el.matches('details') ? el : el.querySelector('details'));
    if (d) d.open = true;
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Pre-select a contact topic from ?topic= ---------- */
  const topic = new URLSearchParams(location.search).get('topic');
  if (topic) { const r = document.querySelector(`input[name="topic"][value="${CSS.escape(topic)}"]`); if (r) r.checked = true; }

  /* ---------- Misc ---------- */
  $$('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
