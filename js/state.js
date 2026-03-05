// ============================================================
// state.js — App state, persistence, analytics
// ============================================================
const CIRCUMFERENCE = 2 * Math.PI * 140;

let state = {
  mode: 'work', running: false, timeLeft: 0, totalTime: 0,
  sessionCount: 0, pomodoroNumber: 1, targetEndTime: null,
  settings: { work: 25, short: 5, long: 15, autoSwitch: true }
};
let tickInterval = null;

function saveState() {
  localStorage.setItem('zaman_state', JSON.stringify({
    mode: state.mode, running: state.running, timeLeft: state.timeLeft,
    totalTime: state.totalTime, sessionCount: state.sessionCount,
    pomodoroNumber: state.pomodoroNumber, targetEndTime: state.targetEndTime,
    settings: state.settings, savedAt: Date.now()
  }));
}

function loadState() {
  const raw = localStorage.getItem('zaman_state');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved.running && saved.targetEndTime) {
      const remaining = Math.floor((saved.targetEndTime - Date.now()) / 1000);
      saved.timeLeft = Math.max(0, remaining);
      if (saved.timeLeft === 0) { Object.assign(state, saved); handleSessionEnd(true); return; }
    }
    Object.assign(state, saved);
    updateModeUI(); updateDisplay();
    if (state.running) {
      tickInterval = setInterval(tick, 1000);
      document.getElementById('clockWrap').classList.add('running');
      document.getElementById('clockHint').textContent = t('clickPause');
    }
  } catch(e) { console.warn('State load failed', e); }
}

// Analytics
function getTodayKey() { return new Date().toISOString().slice(0, 10); }
function getAnalytics() { const r = localStorage.getItem('zaman_analytics'); return r ? JSON.parse(r) : {}; }
function recordPomodoro() {
  const k = getTodayKey(), a = getAnalytics(); a[k] = (a[k] || 0) + 1;
  localStorage.setItem('zaman_analytics', JSON.stringify(a));
}
