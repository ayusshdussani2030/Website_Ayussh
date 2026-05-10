/* ============================================================
   bytefort.xyz — script.js (Cyberpunk v3)
   ============================================================ */

/* ── 0. Boot Intro Overlay ──────────────────────────────── */
(function () {
  const overlay = document.getElementById('bootIntro');
  const bar     = document.getElementById('biBar');
  const pct     = document.getElementById('biPct');
  const status  = document.getElementById('biStatus');
  if (!overlay) return;

  const MSGS = [
    'LOADING KERNEL MODULES...',
    'MOUNTING STORAGE VOLUMES...',
    'STARTING SERVICES...',
    'ALL SYSTEMS OPERATIONAL',
  ];
  const DUR = 1700;
  const t0  = performance.now();

  (function step(now) {
    const p    = Math.min((now - t0) / DUR, 1);
    const pVal = Math.round(p * 100);
    bar.style.width   = pVal + '%';
    pct.textContent   = pVal + '%';
    status.textContent = MSGS[Math.min(Math.floor(p * MSGS.length), MSGS.length - 1)];
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      overlay.classList.add('hide');
      setTimeout(() => overlay.remove(), 600);
    }
  })(t0);
})();


/* ── 0b. Custom Cursor ──────────────────────────────────── */
(function () {
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (!dot || !ring) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = -200, my = -200, rx = -200, ry = -200, shown = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (!shown) { dot.style.opacity = '1'; ring.style.opacity = '1'; shown = true; }
  });

  (function loopRing() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loopRing);
  })();

  document.querySelectorAll('a, button, .svc-card, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (shown) { dot.style.opacity = '1'; ring.style.opacity = '1'; }
  });
})();


/* ── 0c. Live Uptime Counter ────────────────────────────── */
(function () {
  const el = document.getElementById('uptimeDays');
  if (!el) return;
  const since = new Date('2024-03-01');
  el.textContent = Math.floor((Date.now() - since) / 86400000);
})();


/* ── 0d. Scroll To Top ──────────────────────────────────── */
(function () {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 700);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ── 0e. Clipboard Copy — SSH Command ───────────────────── */
(function () {
  const cmd   = document.getElementById('sshCmd');
  const toast = document.getElementById('toast');
  if (!cmd || !toast) return;

  let timer;
  cmd.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('ping bytefort.xyz');
      showToast('COPIED TO CLIPBOARD');
    } catch {
      showToast('ping bytefort.xyz');
    }
  });

  function showToast(msg) {
    clearTimeout(timer);
    toast.textContent = msg;
    toast.classList.add('show');
    timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
})();


/* ── 0f. Text Scramble on Section Tags ──────────────────── */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CHARS = '!<>-_\\/[]{}=+*^?#@~01';

  function scramble(el) {
    const target = el.textContent.trim();
    const queue  = target.split('').map((ch, i) => ({
      to:    ch,
      start: (Math.random() * 6 + i * 1.4) | 0,
      end:   (Math.random() * 8 + 16 + i)  | 0,
      char:  '',
    }));
    let frame = 0;

    (function tick() {
      let out = '', done = 0;
      queue.forEach(q => {
        if (frame >= q.end) {
          out += q.to; done++;
        } else if (frame >= q.start) {
          if (!q.char || Math.random() < 0.3)
            q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          out += `<span class="sc-rand">${q.char}</span>`;
        } else {
          out += '<span class="sc-rand"> </span>';
        }
      });
      el.innerHTML = out;
      if (done < queue.length) { frame++; requestAnimationFrame(tick); }
      else el.textContent = target;
    })();
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('.section-tag').forEach(el => obs.observe(el));
})();


/* ── 0g. Click Ripple — disabled in v4 ──────────────────── */


/* ── 1. Scroll Progress Bar ─────────────────────────────── */
(function () {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive: true });
})();


/* ── 2. Mouse Glow ──────────────────────────────────────── */
(function () {
  const glow = document.getElementById('mouseGlow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  });
})();


/* ── 3. Hero Canvas — Particle Network ──────────────────── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx    = canvas.getContext('2d');
  const COLORS = ['#00FF9C', '#00D4FF', '#FF2E97', '#9B59FE'];
  const COUNT  = 85;
  const LINK_D = 130;
  const REPEL  = 90;
  let W, H, pts;
  const mouse  = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function init() {
    pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  Math.random() * 1.5 + 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK_D) {
          ctx.strokeStyle = `rgba(0,255,156,${(1 - d / LINK_D) * 0.22})`;
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + 'AA';
      ctx.fill();

      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d  = Math.hypot(dx, dy);
      if (d < REPEL && d > 0) {
        const f = (REPEL - d) / REPEL * 0.9;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }

      const spd = Math.hypot(p.vx, p.vy);
      if (spd > 2.2) { p.vx *= 2.2 / spd; p.vy *= 2.2 / spd; }
      p.vx *= 0.994; p.vy *= 0.994;

      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
    });

    requestAnimationFrame(frame);
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('resize', () => { resize(); init(); });
  resize(); init(); frame();
})();


/* ── 4. Hero Typing Animation ───────────────────────────── */
(function () {
  const el = document.getElementById('typedText');
  if (!el) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Homelab Engineer';
    return;
  }
  const roles = [
    'Homelab Engineer',
    'AI Researcher',
    'Network Architect',
    'Self-Hoster',
    'Digital Fortress Builder',
  ];
  let idx = 0, pos = 0, del = false;
  const T_TYPE = 68, T_DEL = 32, T_PAUSE = 2400, T_REST = 420;

  function tick() {
    const word = roles[idx];
    if (!del) {
      el.textContent = word.slice(0, ++pos);
      if (pos === word.length) { del = true; return setTimeout(tick, T_PAUSE); }
    } else {
      el.textContent = word.slice(0, --pos);
      if (pos === 0) { del = false; idx = (idx + 1) % roles.length; return setTimeout(tick, T_REST); }
    }
    setTimeout(tick, del ? T_DEL : T_TYPE);
  }
  setTimeout(tick, 1400);
})();


/* ── 5. Animated Counters ───────────────────────────────── */
(function () {
  function runCounter(el) {
    const target = +el.dataset.count;
    const dur    = 1500;
    const t0     = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
})();


/* ── 6. Navbar ──────────────────────────────────────────── */
(function () {
  const navbar   = document.getElementById('navbar');
  const burger   = document.getElementById('hamburger');
  const menu     = document.getElementById('mobileMenu');
  const mLinks   = document.querySelectorAll('.mobile-link');
  const sections = ['boot', 'homelab', 'services', 'ailab', 'network'];

  function updateActive() {
    const sp    = window.scrollY + 160;
    const links = document.querySelectorAll('.nav-links a');
    let cur = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= sp) cur = id;
    });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActive();
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mLinks.forEach(l => l.addEventListener('click', () => {
    burger.classList.remove('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      burger.classList.remove('open');
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      burger.focus();
    }
  });
})();


/* ── 7. Boot Sequence Scroll Driver ─────────────────────── */
(function () {
  const section   = document.getElementById('boot');
  const terminal  = document.getElementById('bootTerminal');
  const bootBar   = document.getElementById('bootBar');
  const bootPct   = document.getElementById('bootPct');
  const bootStats = document.getElementById('bootStats');
  if (!section || !terminal) return;

  const LINES = [
    { cls: 'ok',   text: '[ OK ] Initializing kernel modules...' },
    { cls: 'ok',   text: '[ OK ] VMware ESXi 6.5 hypervisor loaded' },
    { cls: 'ok',   text: '[ OK ] Network interface eth0: ACTIVE' },
    { cls: 'ok',   text: '[ OK ] Cloudflare Zero Trust tunnel: CONNECTED' },
    { cls: 'ok',   text: '[ OK ] ZFS storage pool: 8.0 TiB available' },
    { cls: 'ok',   text: '[ OK ] Docker daemon: running (14 containers)' },
    { cls: 'ok',   text: '[ OK ] Starting service containers...' },
    { cls: 'info', text: '  → dash.bytefort.xyz        [Dashboard]    ONLINE' },
    { cls: 'info', text: '  → jellyfin.bytefort.xyz    [Jellyfin]     ONLINE' },
    { cls: 'info', text: '  → jellyseerr.bytefort.xyz  [Jellyseerr]   ONLINE' },
    { cls: 'info', text: '  → prowlarr.bytefort.xyz    [Prowlarr]     ONLINE' },
    { cls: 'info', text: '  → proxy.bytefort.xyz       [Nginx PM]     ONLINE' },
    { cls: 'info', text: '  → qbit.bytefort.xyz        [qBittorrent]  ONLINE' },
    { cls: 'info', text: '  → radarr.bytefort.xyz      [Radarr]       ONLINE' },
    { cls: 'info', text: '  → sonarr.bytefort.xyz      [Sonarr]       ONLINE' },
    { cls: 'info', text: '  → vmware.bytefort.xyz      [VMware UI]    ONLINE' },
    { cls: 'info', text: '  → wetty1.bytefort.xyz      [WeTTY]        ONLINE' },
    { cls: 'ok',   text: "[ OK ] SSL certificates verified (Let's Encrypt)" },
    { cls: 'ok',   text: '[ OK ] Uptime monitor: 99.9% — all checks passing' },
    { cls: 'done', text: '[BOOT] All systems operational. bytefort.xyz online.' },
  ];

  let lineEls = [];
  terminal.innerHTML = '<div class="t-prompt"><span class="t-caret">▋</span></div>';

  function syncLines(count) {
    const target = Math.min(count, LINES.length);

    while (lineEls.length < target) {
      const i   = lineEls.length;
      const div = document.createElement('div');
      div.className   = `t-line ${LINES[i].cls}`;
      div.textContent = LINES[i].text;
      const prompt    = terminal.querySelector('.t-prompt');
      terminal.insertBefore(div, prompt);
      lineEls.push(div);
      requestAnimationFrame(() => div.classList.add('show'));
    }

    while (lineEls.length > target) {
      lineEls.pop().remove();
    }

    const prompt = terminal.querySelector('.t-prompt');
    if (prompt) prompt.style.display = target >= LINES.length ? 'none' : '';
  }

  window.addEventListener('scroll', () => {
    const sTop = section.offsetTop;
    const sH   = section.offsetHeight;
    const vH   = window.innerHeight;
    const prog = Math.max(0, Math.min(1, (window.scrollY - sTop) / (sH - vH)));

    if (bootBar) bootBar.style.width = (prog * 100) + '%';
    if (bootPct) bootPct.textContent = Math.round(prog * 100) + '%';

    syncLines(Math.ceil(prog * LINES.length));

    if (bootStats) bootStats.classList.toggle('show', prog >= 0.98);
  }, { passive: true });
})();


/* ── 8. Homelab Scroll Driver ───────────────────────────── */
(function () {
  const section = document.getElementById('homelab');
  if (!section) return;
  const stages = [0, 1, 2, 3].map(i => document.getElementById('hlStage' + i));
  const panels = [0, 1, 2, 3].map(i => document.getElementById('hlPanel' + i));
  let cur = 0;

  stages[0] && stages[0].classList.add('active');
  panels[0] && panels[0].classList.add('active');

  window.addEventListener('scroll', () => {
    const sTop = section.offsetTop;
    const sH   = section.offsetHeight;
    const vH   = window.innerHeight;
    const prog = Math.max(0, Math.min(1, (window.scrollY - sTop) / (sH - vH)));
    const next = Math.min(3, Math.floor(prog * 4));

    if (next === cur) return;
    if (stages[cur]) { stages[cur].classList.remove('active'); panels[cur] && panels[cur].classList.remove('active'); }
    cur = next;
    if (stages[cur]) { stages[cur].classList.add('active'); panels[cur] && panels[cur].classList.add('active'); }
  }, { passive: true });
})();


/* ── 9. Scroll Reveal ───────────────────────────────────── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('.reveal-up').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 60}ms`;
    obs.observe(el);
  });
})();


/* ── 10. Service Card 3D Hover ──────────────────────────── */
(function () {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -7;
      const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * 7;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();


/* ── 11. Service Filter ─────────────────────────────────── */
(function () {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.svc-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f  = btn.dataset.filter;
      let vi   = 0;
      cards.forEach(card => {
        const match = f === 'all' || card.dataset.category === f;
        card.classList.toggle('hidden', !match);
        card.style.transitionDelay = match ? `${(vi++ % 6) * 45}ms` : '0ms';
      });
    });
  });
})();

/* ── 12. Live telemetry section ──────────────────────────── */
(() => {
  const sect = document.getElementById('telemetry');
  if (!sect) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sparkline helpers
  const histories = new WeakMap();
  function pushHistory(svg, val, max = 60) {
    let h = histories.get(svg);
    if (!h) { h = []; histories.set(svg, h); }
    h.push(val);
    if (h.length > max) h.shift();
    return h;
  }
  function pathFromHistory(h, w, hgt, withArea = false) {
    if (!h.length) return { line: '', area: '' };
    const max = Math.max(...h, 1);
    const min = Math.min(...h, 0);
    const range = (max - min) || 1;
    const stepX = w / Math.max(h.length - 1, 1);
    const pts = h.map((v, i) => {
      const x = i * stepX;
      const y = hgt - ((v - min) / range) * (hgt - 4) - 2;
      return [x, y];
    });
    const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
    const area = `${line} L${w},${hgt} L0,${hgt} Z`;
    return { line, area };
  }

  // Smoothly animate a number's text
  function animateNum(el, from, to, decimals = 0, dur = 600) {
    if (reduced) { el.textContent = to.toFixed(decimals); return; }
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * ease;
      el.textContent = decimals ? v.toFixed(decimals) : Math.round(v);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // State — temp:null means API is live but no sensor available → show "--"
  const state = {
    cpu: 14, mem: 38, netUp: 4.2, netDn: 18.7,
    disk: 2.8, diskTotal: 8, diskFrag: null,
    temp: 42, req: 284,
  };
  const cards = sect.querySelectorAll('.tlm-card');

  function readVal(card, attr = 'data-tlm-val') {
    return parseFloat(card.querySelector(`[${attr}]`)?.textContent || '0');
  }

  function simulate() {
    state.cpu   = Math.max(4,   Math.min(92,  state.cpu   + (Math.random() - 0.45) * 8));
    state.mem   = Math.max(20,  Math.min(85,  state.mem   + (Math.random() - 0.5)  * 4));
    state.netUp = Math.max(0.1, state.netUp + (Math.random() - 0.5) * 3);
    state.netDn = Math.max(0.5, state.netDn + (Math.random() - 0.5) * 8);
    const t     = state.temp ?? 42;
    state.temp  = Math.max(36,  Math.min(72,  t + (Math.random() - 0.5) * 2));
    state.req   = Math.max(80,  Math.min(500, state.req   + (Math.random() - 0.5)  * 60));
  }

  function renderMetrics() {
    cards.forEach(card => {
      const m       = card.dataset.metric;
      const valEl   = card.querySelector('[data-tlm-val]');
      const val2El  = card.querySelector('[data-tlm-val2]');
      const fillEl  = card.querySelector('[data-tlm-fill]');
      const sparkLine = card.querySelector('[data-tlm-line]');
      const sparkArea = card.querySelector('[data-tlm-area]');

      if (m === 'cpu' && valEl) {
        animateNum(valEl, readVal(card), state.cpu, 0);
        if (sparkLine) {
          const h = pushHistory(card, state.cpu, 60);
          const { line, area } = pathFromHistory(h, 240, 60, true);
          sparkLine.setAttribute('d', line);
          if (sparkArea) sparkArea.setAttribute('d', area);
        }
      } else if (m === 'mem' && valEl) {
        animateNum(valEl, readVal(card), state.mem, 0);
        if (fillEl) fillEl.style.width = state.mem + '%';
      } else if (m === 'net' && valEl && val2El) {
        animateNum(valEl,  readVal(card, 'data-tlm-val'),  state.netUp, 1);
        animateNum(val2El, readVal(card, 'data-tlm-val2'), state.netDn, 1);
        if (sparkLine) {
          const h = pushHistory(card, state.netDn, 50);
          const { line } = pathFromHistory(h, 200, 40);
          sparkLine.setAttribute('d', line);
        }
      } else if (m === 'disk' && valEl) {
        animateNum(valEl, readVal(card), state.disk, 1);
        if (fillEl) fillEl.style.width = (state.disk / state.diskTotal * 100) + '%';
      } else if (m === 'temp' && valEl) {
        if (state.temp === null) {
          valEl.textContent = '--';
          if (fillEl) fillEl.style.width = '0%';
        } else {
          animateNum(valEl, readVal(card), state.temp, 0);
          if (fillEl) fillEl.style.width = state.temp + '%';
        }
      }
    });

    // Stats card (bars + req)
    const statCard = sect.querySelector('.tlm-stats');
    if (statCard) {
      const valEl = statCard.querySelector('[data-tlm-val]');
      if (valEl) animateNum(valEl, parseFloat(valEl.textContent), state.req, 0);
      const bars = statCard.querySelectorAll('.tb');
      bars.forEach(b => {
        const v = 25 + Math.random() * 75;
        b.style.height = v + '%';
        b.style.opacity = 0.35 + (v / 100) * 0.55;
      });
    }
  }

  // Fetch real metrics; fall back to simulation on any failure.
  // Field map: cpu mem net_up net_dn disk disk_total disk_frag temp req → state
  async function update() {
    let apiOk = false;
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 3000);
      const res  = await fetch('https://api.bytefort.xyz/metrics', { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        const d = await res.json();
        if (typeof d.cpu        === 'number') state.cpu       = Math.max(0, Math.min(100, d.cpu));
        if (typeof d.mem        === 'number') state.mem       = Math.max(0, Math.min(100, d.mem));
        if (typeof d.net_up     === 'number') state.netUp     = Math.max(0, d.net_up);
        if (typeof d.net_dn     === 'number') state.netDn     = Math.max(0, d.net_dn);
        if (typeof d.disk       === 'number') state.disk      = Math.max(0, d.disk);
        if (typeof d.disk_total === 'number') state.diskTotal = Math.max(1, d.disk_total);
        if (typeof d.disk_frag  === 'number') state.diskFrag  = d.disk_frag;
        state.temp = typeof d.temp === 'number' ? Math.max(0, d.temp) : null;
        if (typeof d.req        === 'number') state.req       = Math.max(0, d.req);

        // Update sub-text elements with real values
        const memSub  = document.getElementById('tlmMemSub');
        const memPill = document.getElementById('tlmMemPill');
        const diskSub = document.getElementById('tlmDiskSub');
        if (memSub && typeof d.mem_used_gb === 'number' && typeof d.mem_total_gb === 'number')
          memSub.textContent = `${d.mem_used_gb} / ${d.mem_total_gb} GB DDR3 ECC`;
        if (memPill && typeof d.mem_total_gb === 'number')
          memPill.textContent = `${d.mem_total_gb}G`;
        if (diskSub && typeof d.disk === 'number' && typeof d.disk_total === 'number') {
          const cr = d.compress_ratio ? ` · ${d.compress_ratio}× compression` : '';
          diskSub.textContent = `${d.disk} / ${d.disk_total} TB used${cr}`;
        }

        apiOk = true;
      }
    } catch { /* network error or timeout — fall through to simulate */ }
    if (!apiOk) simulate();
    renderMetrics();
  }

  // setTimeout chain so each tick starts 2.2 s after the previous one completes,
  // regardless of how long the fetch took.
  function loop() {
    update().then(() => { if (!reduced) setTimeout(loop, 2200); });
  }

  // Run when section enters viewport
  let started = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        loop();
      }
    });
  }, { threshold: 0.15 });
  io.observe(sect);

  // Live log feed
  const logEl = document.getElementById('tlmLog');
  if (logEl) {
    const services = ['nginx', 'jellyfin', 'sonarr', 'radarr', 'authelia', 'pihole', 'cloudflared', 'ollama', 'zfs', 'sshd', 'docker'];
    const ips = ['192.168.1.42', '10.0.0.18', '172.16.4.7', '203.0.113.21', '198.51.100.4', '192.168.1.108'];
    const messages = {
      info: [
        ip => `request 200 GET /api/v1/status from ${ip}`,
        ip => `auth ok user=ayussh from ${ip} via webauthn`,
        ip => `stream open · 4K HEVC · client=${ip}`,
        () => `cron job completed: snapshot.zfs.daily`,
        () => `dns query resolved · cache hit ratio 87.3%`,
        () => `tunnel established cf-edge=BOM ttl=300s`,
        () => `index updated · 12,847 items · 38ms`,
      ],
      ok: [
        () => `health check passed · all 10 services responding`,
        () => `backup verified · 2.8TB · 1m42s`,
        () => `certificate renewed · valid until 2027-02-14`,
      ],
      warn: [
        () => `rate limit approaching · 88% of quota`,
        ip => `failed login attempt from ${ip} · banned 15m`,
        () => `cpu temp 64°C · within thresholds`,
      ],
      err: [
        () => `connection reset by peer · upstream nginx`,
        () => `download timeout · retrying (3/5)`,
      ],
    };
    const weights = [['info', 70], ['ok', 12], ['warn', 13], ['err', 5]];
    function pickLevel() {
      const r = Math.random() * 100;
      let acc = 0;
      for (const [lvl, w] of weights) { acc += w; if (r < acc) return lvl; }
      return 'info';
    }
    function ts() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    function pushLog() {
      const lvl = pickLevel();
      const tmpls = messages[lvl];
      const ip = ips[Math.floor(Math.random() * ips.length)];
      const msg = tmpls[Math.floor(Math.random() * tmpls.length)](ip);
      const src = services[Math.floor(Math.random() * services.length)];
      const line = document.createElement('span');
      line.className = `ll ${lvl}`;
      line.innerHTML = `<span class="t">${ts()}</span><span class="lvl">${lvl.toUpperCase()}</span><span class="src">[${src}]</span><span class="msg">${msg}</span>`;
      logEl.appendChild(line);
      // Trim to last 14 lines
      while (logEl.children.length > 14) logEl.removeChild(logEl.firstChild);
    }
    // Seed a few
    for (let i = 0; i < 8; i++) pushLog();
    if (!reduced) setInterval(pushLog, 1400);
  }
})();


/* ── WeTTY instance picker modal ────────────────────────── */
(() => {
  const modal = document.getElementById('wettyModal');
  if (!modal) return;
  const backdrop = modal.querySelector('.svc-modal-backdrop');
  const closeBtn = modal.querySelector('.svc-modal-close');

  function open() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    modal.addEventListener('transitionend', () => { modal.hidden = true; }, { once: true });
  }

  document.querySelectorAll('[data-modal="wetty"]').forEach(trigger => {
    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();
