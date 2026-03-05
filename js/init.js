// ============================================================
// init.js — App initialization and Service Worker registration
// ============================================================
(function init() {
  drawTickMarks();
  loadState();
  if (!state.timeLeft) { state.timeLeft = getModeTime('work'); state.totalTime = state.timeLeft; state.mode = 'work'; }
  applyLang();
  updateModeUI();
  updateDisplay();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  setInterval(() => { if (state.running) saveState(); }, 5000);
  // Weather
  fetchWeather(); setInterval(fetchWeather, 1800000);
  // Ramadan
  updateRamadan(); setInterval(updateRamadan, 1000);
  // Theme
  initTheme();
  // Firebase Auth
  initFirebaseAuth();
})();

// Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
