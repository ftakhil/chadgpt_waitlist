/* ═══════════════════════════════════════════════════════════════
   CHADGPT WAITING LIST — MINIMAL SCRIPT
   Countdown, FAQ toggle, form submit, navbar scroll
   ═══════════════════════════════════════════════════════════════ */

// ─── Supabase (placeholders) ───
const SUPABASE_URL = 'https://ikztxbvnnzknfgikanmp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_g0BQEUUCNrz7pSW96tei2A_25IYvm2h';

let sb = null;
try {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn('Supabase not configured — running in demo mode.');
}

const isDemo = !sb || SUPABASE_URL.includes('YOUR_PROJECT_ID');

// ═══════════════════════════════════════════════════════════════
// NAVBAR SCROLL
// ═══════════════════════════════════════════════════════════════
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const el = document.querySelector(a.getAttribute('href'));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ═══════════════════════════════════════════════════════════════
// COUNTDOWN — April 20, 2026
// ═══════════════════════════════════════════════════════════════
const LAUNCH = new Date('2026-04-20T00:00:00+05:30').getTime();
const cdD = document.getElementById('cd-days');
const cdH = document.getElementById('cd-hours');
const cdM = document.getElementById('cd-mins');
const cdS = document.getElementById('cd-secs');

function tick() {
  const diff = Math.max(0, LAUNCH - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  cdD.textContent = String(d).padStart(2, '0');
  cdH.textContent = String(h).padStart(2, '0');
  cdM.textContent = String(m).padStart(2, '0');
  cdS.textContent = String(s).padStart(2, '0');
}
tick();
setInterval(tick, 1000);

// ═══════════════════════════════════════════════════════════════
// WAITLIST COUNTER
// ═══════════════════════════════════════════════════════════════
const countEl = document.getElementById('waitlist-count');

async function loadCount() {
  if (isDemo) {
    animateNum(countEl, 247);
    return;
  }
  try {
    // SECURE: Use the RPC function to get the real count without exposing all data
    const { data, error } = await sb.rpc('get_chad_count');
    if (!error) animateNum(countEl, data || 0);
  } catch { countEl.textContent = '—'; }
}

function animateNum(el, target) {
  const dur = 1500;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

setTimeout(loadCount, 500);

// ═══════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');

    // close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

    // toggle current
    if (!wasOpen) item.classList.add('open');
  });
});

// ═══════════════════════════════════════════════════════════════
// FORM SUBMIT
// ═══════════════════════════════════════════════════════════════
const form = document.getElementById('waitlist-form');
const nameIn = document.getElementById('input-name');
const emailIn = document.getElementById('input-email');
const errEl = document.getElementById('form-error');
const btnEl = document.getElementById('btn-submit');
const successEl = document.getElementById('form-success');

function showErr(msg) {
  errEl.textContent = msg;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  showErr('');

  const name = nameIn.value.trim();
  const email = emailIn.value.trim().toLowerCase();

  if (!name) return showErr('Please enter your name.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr('Please enter a valid email.');

  btnEl.disabled = true;
  btnEl.textContent = 'Joining...';

  if (isDemo) {
    await new Promise(r => setTimeout(r, 1200));
    form.style.display = 'none';
    errEl.style.display = 'none';
    successEl.classList.add('visible');
    return;
  }

  try {
    const { error } = await sb.from('chad_waitlist').insert([{ name, email }]);

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        showErr("You're already on the list. Chad doesn't forget.");
        btnEl.disabled = false;
        btnEl.textContent = 'Get Notified';
        return;
      }
      throw error;
    }

    form.style.display = 'none';
    errEl.style.display = 'none';
    successEl.classList.add('visible');
    loadCount();

  } catch (err) {
    console.error(err);
    showErr('Something went wrong. Try again.');
    btnEl.disabled = false;
    btnEl.textContent = 'Get Notified';
  }
});
// ═══════════════════════════════════════════════════════════════
// INTERACTION REVEAL (Mouselens)
// ═══════════════════════════════════════════════════════════════
const revealTarget = document.getElementById('reveal-target');
if (revealTarget) {
  revealTarget.addEventListener('mousemove', e => {
    const rect = revealTarget.getBoundingClientRect();
    // Calculate percentage position
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    revealTarget.style.setProperty('--mx', `${x}%`);
    revealTarget.style.setProperty('--my', `${y}%`);
  });

  // Optional: reset on leave
  revealTarget.addEventListener('mouseleave', () => {
    revealTarget.style.setProperty('--mx', '50%');
    revealTarget.style.setProperty('--my', '50%');
  });
}
