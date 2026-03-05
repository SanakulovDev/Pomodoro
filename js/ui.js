// ============================================================
// ui.js — Notifications, Wake Lock, Fullscreen, Theme, Keyboard
// ============================================================

// --- Notifications ---
function notify(msg) {
  const el = document.getElementById('notification');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('TIKITAK', { body: msg, icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏱</text></svg>' });
  }
}

// --- Wake Lock ---
let wakeLock = null;

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    if (wakeLock) return;
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      if (!document.hidden) setTimeout(requestWakeLock, 1000);
    });
  } catch(e) {}
}

function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null; }
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) requestWakeLock();
});
requestWakeLock();

// --- Fullscreen ---
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.navigator.standalone === true;
let iosFakeFullscreen = false;

function toggleFullscreen() {
  const btn = document.getElementById('fullscreenBtn');
  if (isIOS) {
    iosFakeFullscreen = !iosFakeFullscreen;
    document.body.classList.toggle('ios-fullscreen', iosFakeFullscreen);
    btn.textContent = iosFakeFullscreen ? '✕' : '⛶';
    if (iosFakeFullscreen) requestWakeLock();
    else if (!state.running) releaseWakeLock();
  } else {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  }
}

document.addEventListener('fullscreenchange', () => {
  document.getElementById('fullscreenBtn').textContent = document.fullscreenElement ? '✕' : '⛶';
  if (document.fullscreenElement) requestWakeLock();
  else if (!state.running) releaseWakeLock();
});

if (isStandalone) { window.addEventListener('load', () => requestWakeLock()); }

// Visibility — recalculate timer on return from background
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.running && state.targetEndTime) {
    state.timeLeft = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
    if (state.timeLeft <= 0) handleSessionEnd(false);
    else updateDisplay();
  }
});

// --- Keyboard shortcuts ---
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); toggleTimer(); }
  if (e.code === 'KeyR') resetTimer();
  if (e.code === 'Digit1') switchMode('work');
  if (e.code === 'Digit2') switchMode('short');
  if (e.code === 'Digit3') switchMode('long');
  if (e.code === 'KeyF') toggleFullscreen();
});

// --- Theme ---
function initTheme() { applyTheme(localStorage.getItem('zaman_theme') || 'dark'); }
function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
  document.getElementById('themeToggle').textContent = t === 'light' ? '☀️' : '🌙';
  localStorage.setItem('zaman_theme', t);
}
function toggleTheme() { applyTheme(document.body.classList.contains('light') ? 'dark' : 'light'); }
