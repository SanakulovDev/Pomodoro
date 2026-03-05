// ============================================================
// timer.js — Pomodoro timer core (display, modes, tick, session)
// ============================================================
function drawTickMarks() {
  const g = document.getElementById('tickMarks');
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 360, rad = (angle - 90) * Math.PI / 180;
    const r1 = i % 5 === 0 ? 128 : 134, r2 = 140;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 150 + r1 * Math.cos(rad)); line.setAttribute('y1', 150 + r1 * Math.sin(rad));
    line.setAttribute('x2', 150 + r2 * Math.cos(rad)); line.setAttribute('y2', 150 + r2 * Math.sin(rad));
    line.setAttribute('stroke', i % 5 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)');
    line.setAttribute('stroke-width', i % 5 === 0 ? '2' : '1');
    g.appendChild(line);
  }
}

function getModeTime(mode) {
  const s = state.settings;
  return mode === 'work' ? s.work * 60 : mode === 'short' ? s.short * 60 : s.long * 60;
}

function switchMode(mode) {
  if (state.running) stopTimer();
  state.mode = mode; state.timeLeft = getModeTime(mode); state.totalTime = state.timeLeft;
  state.targetEndTime = null;
  updateModeUI(); updateDisplay(); saveState();
}

function updateModeUI() {
  document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === state.mode));
  const labels = { work: t('workTime'), short: t('shortTime'), long: t('longTime') };
  const colors = { work: 'var(--work)', short: 'var(--short)', long: 'var(--long)' };
  document.getElementById('modeLabel').textContent = labels[state.mode];
  document.getElementById('timeDisplay').style.color = colors[state.mode];
  document.getElementById('progressArc').style.stroke = colors[state.mode];
  document.getElementById('statusBar').className = 'status-bar ' + state.mode;
  const cw = document.getElementById('clockWrap');
  cw.classList.remove('mode-work','mode-short','mode-long');
  cw.classList.add('mode-' + state.mode);
  updateSessionDots();
}

function updateDisplay() {
  const mins = Math.floor(state.timeLeft / 60), secs = state.timeLeft % 60;
  const str = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  document.getElementById('timeDisplay').textContent = str;
  document.title = str + ' — TIKITAK';
  const total = state.totalTime || getModeTime(state.mode);
  const offset = CIRCUMFERENCE * (1 - state.timeLeft / total);
  document.getElementById('progressArc').style.strokeDashoffset = offset;
}

function updateSessionDots() {
  const c = document.getElementById('sessionDots'); c.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div'); d.className = 'session-dot';
    if (i < state.pomodoroNumber - 1) d.classList.add('done');
    else if (i === state.pomodoroNumber - 1 && state.mode === 'work') d.classList.add('current');
    c.appendChild(d);
  }
}

function toggleTimer() { if (state.running) stopTimer(); else startTimer(); }

function startTimer() {
  if (state.timeLeft === 0) { state.timeLeft = getModeTime(state.mode); state.totalTime = state.timeLeft; }
  state.running = true;
  state.targetEndTime = Date.now() + state.timeLeft * 1000;
  document.getElementById('clockWrap').classList.add('running');
  document.getElementById('clockHint').textContent = t('clickPause');
  tickInterval = setInterval(tick, 1000);
  requestWakeLock(); saveState();
  syncTimerState();
}

function stopTimer() {
  state.running = false; state.targetEndTime = null;
  clearInterval(tickInterval); tickInterval = null;
  document.getElementById('clockWrap').classList.remove('running');
  document.getElementById('clockHint').textContent = t('clickResume');
  if (!document.fullscreenElement) releaseWakeLock(); saveState();
  syncTimerState();
}

function resetTimer() {
  if (state.running) stopTimer();
  state.timeLeft = getModeTime(state.mode); state.totalTime = state.timeLeft; state.targetEndTime = null;
  document.getElementById('clockHint').textContent = t('clickStart');
  updateDisplay(); saveState();
  syncTimerState();
}

function skipSession() { if (state.running) stopTimer(); handleSessionEnd(false); }

function tick() {
  if (state.targetEndTime) {
    state.timeLeft = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
  } else if (state.timeLeft > 0) { state.timeLeft--; }
  updateDisplay();
  if (state.timeLeft <= 0) handleSessionEnd(false);
  else if (state.timeLeft % 10 === 0) saveState();
}

function handleSessionEnd(silent) {
  clearInterval(tickInterval); tickInterval = null;
  state.running = false; state.targetEndTime = null;
  document.getElementById('clockWrap').classList.remove('running');
  document.getElementById('clockHint').textContent = t('clickStart');
  if (!document.fullscreenElement) releaseWakeLock();
  if (state.mode === 'work') {
    state.sessionCount++; recordPomodoro();
    if (!silent) { playAlertSound(); notify(t('pomoDone')); }
    if (state.pomodoroNumber >= 4) {
      state.pomodoroNumber = 1;
      if (state.settings.autoSwitch) setTimeout(() => switchMode('long'), 500);
    } else {
      state.pomodoroNumber++;
      if (state.settings.autoSwitch) setTimeout(() => switchMode('short'), 500);
    }
  } else {
    if (!silent) { playAlertSound(); notify(t('breakDone')); }
    if (state.settings.autoSwitch) setTimeout(() => switchMode('work'), 500);
  }
  updateSessionDots(); saveState();
}
