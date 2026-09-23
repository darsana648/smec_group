/* SMEC Group — careers: job search & filters, job detail, applications */
(() => {
  'use strict';
  const JOBS = window.SMEC_JOBS || [];
  const { $, $$, handleSubmit, showSuccess, validateField } = window.SMEC;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const unique = (key) => [...new Set(JOBS.map((j) => j[key]))].sort();
  const daysAgo = (iso) => {
    const d = Math.max(0, Math.round((Date.now() - new Date(iso + 'T00:00:00')) / 864e5));
    return d === 0 ? 'Posted today' : d === 1 ? 'Posted yesterday' : d < 30 ? `Posted ${d} days ago` : `Posted ${new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  };
  const arrow = '<span class="inline-flex transition-transform duration-150 group-hover:translate-x-1"><i data-lucide="arrow-right" class="h-5 w-5"></i></span>';

  $$('[data-jobs-count]').forEach((el) => { el.textContent = JOBS.length; });

  /* =========================================================
     Job listings (careers.html)
  ========================================================= */
  const list = $('#job-list');
  if (list) {
    const form = $('#job-filters');
    const q = $('#job-search');
    const selects = { company: $('#f-company'), department: $('#f-dept'), location: $('#f-location'), type: $('#f-type') };
    const sort = $('#f-sort');
    const count = $('#job-count');
    const empty = $('#job-empty');
    const clearBtns = $$('[data-clear-filters]');
    const chipsWrap = $('#job-active');

    // Populate filter options from data
    Object.entries(selects).forEach(([key, sel]) => {
      unique(key).forEach((v) => {
        const n = JOBS.filter((j) => j[key] === v).length;
        sel.insertAdjacentHTML('beforeend', `<option value="${esc(v)}">${esc(v)} (${n})</option>`);
      });
    });

    // Department quick links
    const deptNav = $('#dept-quick');
    if (deptNav) {
      deptNav.innerHTML = unique('company').map((d) =>
        `<li><button type="button" class="group flex min-h-[48px] w-full items-center justify-between gap-4 border-b border-paper-200 px-2 py-3 text-left text-sm transition-colors hover:bg-paper-50 hover:text-brand" data-dept="${esc(d)}"><span>${esc(d)}</span><span class="tag">${JOBS.filter((j) => j.company === d).length}</span></button></li>`
      ).join('');
      deptNav.addEventListener('click', (e) => {
        const b = e.target.closest('[data-dept]'); if (!b) return;
        selects.company.value = b.dataset.dept; render(true);
        $('#open-roles').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Read state from URL
    const params = new URLSearchParams(location.search);
    q.value = params.get('q') || '';
    Object.entries(selects).forEach(([k, sel]) => { if (params.get(k)) sel.value = params.get(k); });
    if (params.get('sort')) sort.value = params.get('sort');

    const matches = (job, term) => !term || [job.title, job.company, job.department, job.location, job.summary, job.type, job.mode]
      .join(' ').toLowerCase().includes(term);

    const render = (pushState = false) => {
      const term = q.value.trim().toLowerCase();
      let rows = JOBS.filter((j) => matches(j, term) && Object.entries(selects).every(([k, s]) => !s.value || j[k] === s.value));
      rows = rows.sort(sort.value === 'az' ? (a, b) => a.title.localeCompare(b.title) : (a, b) => b.posted.localeCompare(a.posted));

      list.innerHTML = rows.map((j) => `
        <li class="border-b border-paper-200">
          <a href="job.html?id=${encodeURIComponent(j.id)}" class="job-row group grid gap-4 px-2 py-6 sm:px-4 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
            <div>
              <p class="text-sm text-ink-600">${esc(j.company)} · ${esc(j.department)}</p>
              <h3 class="job-title mt-1 text-xl transition-colors">${esc(j.title)}</h3>
              <p class="mt-2 max-w-2xl text-sm text-ink-600">${esc(j.summary)}</p>
              <p class="mt-3 flex flex-wrap gap-2"><span class="tag">${esc(j.mode)}</span><span class="tag">${esc(j.type)}</span></p>
            </div>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-600 md:justify-end">
              <span class="inline-flex items-center gap-1.5"><i data-lucide="map-pin" class="h-4 w-4"></i>${esc(j.location)}</span>
              <span class="hidden items-center gap-1.5 text-ink-500 lg:inline-flex"><i data-lucide="clock" class="h-4 w-4"></i>${daysAgo(j.posted)}</span>
              <span class="ml-auto text-brand md:ml-0">${arrow}</span>
            </div>
          </a>
        </li>`).join('');

      const total = rows.length;
      count.textContent = `${total} ${total === 1 ? 'role' : 'roles'}${term || Object.values(selects).some((s) => s.value) ? (total === 1 ? ' matches your search' : ' match your search') : ' open'}`;
      empty.hidden = total > 0;
      list.hidden = total === 0;

      // Active filter chips
      const active = [];
      if (term) active.push(['q', `“${q.value.trim()}”`]);
      Object.entries(selects).forEach(([k, s]) => { if (s.value) active.push([k, s.value]); });
      chipsWrap.innerHTML = active.map(([k, v]) =>
        `<button type="button" class="tag gap-1.5 !bg-brand !py-1 !pl-3 !pr-2 !text-white transition-colors hover:!bg-brand-600" data-remove="${k}" aria-label="Remove filter ${esc(v)}">${esc(v)}<i data-lucide="x" class="h-3.5 w-3.5"></i></button>`
      ).join('');
      chipsWrap.hidden = active.length === 0;
      clearBtns.forEach((b) => { if (b.closest('#job-filters')) b.hidden = active.length === 0; });

      // Sync URL (shareable searches)
      const p = new URLSearchParams();
      if (q.value.trim()) p.set('q', q.value.trim());
      Object.entries(selects).forEach(([k, s]) => s.value && p.set(k, s.value));
      if (sort.value !== 'new') p.set('sort', sort.value);
      const url = `${location.pathname}${p.toString() ? '?' + p : ''}${pushState ? '#open-roles' : location.hash}`;
      history.replaceState(null, '', url);
    };

    let t;
    q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 160); });
    [...Object.values(selects), sort].forEach((s) => s.addEventListener('change', () => render()));
    form.addEventListener('submit', (e) => { e.preventDefault(); render(); });
    chipsWrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]'); if (!b) return;
      const k = b.dataset.remove; if (k === 'q') q.value = ''; else selects[k].value = '';
      render(); q.focus();
    });
    clearBtns.forEach((b) => b.addEventListener('click', () => {
      q.value = ''; Object.values(selects).forEach((s) => { s.value = ''; }); sort.value = 'new'; render(); q.focus();
    }));

    // Hero search → listings
    const hero = $('#hero-search');
    if (hero) hero.addEventListener('submit', (e) => {
      e.preventDefault();
      q.value = $('#hero-q').value; render(true);
      $('#open-roles').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => q.focus({ preventScroll: true }), 500);
    });

    render();
  }

  /* =========================================================
     Job detail (job.html)
  ========================================================= */
  const root = $('#job-root');
  if (root) {
    const id = new URLSearchParams(location.search).get('id');
    const job = JOBS.find((j) => j.id === id);
    if (!job) {
      $('#job-missing').hidden = false; root.hidden = true;
    } else {
      document.title = `${job.title} — Careers at SMEC Group`;
      const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
      const li = (arr) => arr.map((x) => `<li class="flex gap-3"><i data-lucide="check" class="mt-0.5 h-5 w-5 shrink-0 text-brand"></i><span>${esc(x)}</span></li>`).join('');

      set('#jd-crumb', esc(job.title));
      set('#jd-dept', `${esc(job.company)} · ${esc(job.department)}`);
      set('#jd-title', esc(job.title));
      set('#jd-summary', esc(job.summary));
      set('#jd-meta', [
        ['Company', job.company, 'building-2'], ['Location', job.location, 'map-pin'], ['Employment', `${job.type} · ${job.mode}`, 'briefcase-business'], ['Experience', job.experience, 'clock'],
      ].map(([k, v, ic]) => `<div class="flex gap-4 bg-white p-5"><i data-lucide="${ic}" class="icon text-brand"></i><div><dt class="text-xs tracking-[0.32px] text-ink-600">${k}</dt><dd class="mt-1">${esc(v)}</dd></div></div>`).join(''));
      set('#jd-posted', daysAgo(job.posted));
      set('#jd-about', esc(job.about));
      set('#jd-resp', li(job.responsibilities));
      set('#jd-req', li(job.requirements));
      set('#jd-nice', li(job.niceToHave || []));
      set('#apply-role', esc(job.title));
      const hidden = $('#apply-job-id'); if (hidden) hidden.value = job.id;

      // Related roles: same department first, then others
      const related = JOBS.filter((j) => j.id !== job.id)
        .sort((a, b) => ((b.company === job.company) + (b.department === job.department)) - ((a.company === job.company) + (a.department === job.department))).slice(0, 3);
      set('#jd-related', related.map((j) => `
        <li class="flex"><a href="job.html?id=${encodeURIComponent(j.id)}" class="tile group w-full">
          <p class="text-xs tracking-[0.32px] text-ink-600">${esc(j.company)}</p>
          <p class="mt-2 text-xl group-hover:text-brand">${esc(j.title)}</p>
          <p class="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-600"><i data-lucide="map-pin" class="h-4 w-4"></i>${esc(j.location)}</p>
          <p class="mt-3 flex flex-wrap gap-2"><span class="tag">${esc(j.mode)}</span><span class="tag">${esc(j.type)}</span></p>
          <span class="tile-arrow"><i data-lucide="arrow-right" class="h-5 w-5"></i></span>
        </a></li>`).join(''));

      // Structured data for search engines (Google Jobs)
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'JobPosting', title: job.title,
        description: `<p>${job.about}</p>`, datePosted: job.posted,
        employmentType: job.type === 'Full-time' ? 'FULL_TIME' : job.type === 'Contract' ? 'CONTRACTOR' : 'INTERN',
        hiringOrganization: { '@type': 'Organization', name: job.company, parentOrganization: 'SMEC Automation Pvt. Ltd.' },
        jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: /Dubai|Abu Dhabi/.test(job.location) ? 'AE' : 'IN' } },
      });
      document.head.appendChild(ld);

      // Copy link
      const copy = $('#jd-copy');
      if (copy) copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(location.href); copy.querySelector('span').textContent = 'Link copied'; }
        catch { copy.querySelector('span').textContent = 'Copy failed'; }
        setTimeout(() => { copy.querySelector('span').textContent = 'Copy link'; }, 2000);
      });
    }
  }

  /* =========================================================
     Application forms (job.html + general application on careers.html)
  ========================================================= */
  const ACCEPT = ['pdf', 'doc', 'docx'];
  const MAX = 5 * 1024 * 1024;

  $$('.dropzone').forEach((zone) => {
    const input = $('input[type=file]', zone);
    const label = $('[data-file-label]', zone);
    const clear = $('[data-file-clear]', zone.parentElement);
    const defaultLabel = label.innerHTML;

    const update = () => {
      const f = input.files[0];
      input.setCustomValidity('');
      if (f) {
        const ext = f.name.split('.').pop().toLowerCase();
        if (!ACCEPT.includes(ext)) input.setCustomValidity('Please upload a PDF, DOC or DOCX file.');
        else if (f.size > MAX) input.setCustomValidity('File is larger than 5 MB. Please upload a smaller file.');
        label.innerHTML = `<span class="font-semibold text-ink">${esc(f.name)}</span> <span class="text-ink-500">· ${(f.size / 1024 / 1024).toFixed(2)} MB</span>`;
        if (clear) clear.hidden = false;
      } else {
        label.innerHTML = defaultLabel;
        if (clear) clear.hidden = true;
      }
      validateField(input);
    };
    input.addEventListener('change', update);
    ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-drag'); }));
    ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('is-drag'); }));
    zone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; update(); }
    });
    if (clear) clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  });

  $$('form.js-apply').forEach((f) => handleSubmit(f, (form) => {
    const name = form.querySelector('[name=firstName]');
    const who = document.querySelector(`#${form.dataset.success} [data-applicant]`);
    if (who && name) who.textContent = name.value.trim();
    showSuccess(form);
  }));
})();
