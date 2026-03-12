// ============================================================
// init.js — App initialization and Service Worker registration
// ============================================================
function scheduleNonCriticalTask(task, delay = 0) {
  const runner = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => task(), { timeout: 2000 });
    else setTimeout(task, 0);
  };
  if (delay > 0) setTimeout(runner, delay);
  else runner();
}

(function init() {
  drawTickMarks();
  loadState();
  if (!state.timeLeft) { state.timeLeft = getModeTime('work'); state.totalTime = state.timeLeft; state.mode = 'work'; }
  initTheme();
  applyLang();
  updateModeUI();
  updateDisplay();
  if (typeof renderWeather === 'function') renderWeather();
  updateContextScene();
  updateRamadan();
  setInterval(() => { if (state.running) saveState(); }, 5000);
  scheduleNonCriticalTask(() => {
    fetchWeather();
    setInterval(fetchWeather, 1800000);
  }, 250);
  setInterval(updateContextScene, 60000);
  scheduleNonCriticalTask(() => {
    updateDailyQuote();
    setInterval(updateDailyQuote, 3600000);
  }, 700);
  setInterval(updateRamadan, 1000);
  scheduleNonCriticalTask(() => {
    if (typeof scheduleFirebaseBootstrap === 'function') scheduleFirebaseBootstrap();
  }, 1200);
})();

// Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
