// ============================================================
// sync.js — Real-time Firestore timer sync across devices
// ============================================================
let _syncUnsub = null;
let _lastSyncId = null;
let _applyingRemote = false;

function syncTimerState() {
  if (!currentUser || !window._fb) return;
  const fb = window._fb;
  const syncId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  _lastSyncId = syncId;
  const payload = {
    syncId,
    running: state.running,
    mode: state.mode,
    timeLeft: state.timeLeft,
    targetEndTime: state.running ? state.targetEndTime : null,
    sessionCount: state.sessionCount,
    updatedAt: Date.now()
  };
  fb.setDoc(fb.doc(fb.db, 'users', currentUser.uid), { timerState: payload }, { merge: true })
    .catch(() => {});
}

function applyRemoteState(data) {
  if (!data || data.syncId === _lastSyncId) return;
  _applyingRemote = true;
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  state.mode = data.mode || state.mode;
  state.sessionCount = data.sessionCount ?? state.sessionCount;
  state.running = data.running;
  if (data.running && data.targetEndTime) {
    state.targetEndTime = data.targetEndTime;
    state.timeLeft = Math.max(0, Math.round((data.targetEndTime - Date.now()) / 1000));
    if (state.timeLeft <= 0) { handleSessionEnd(false); }
    else {
      document.getElementById('clockWrap').classList.add('running');
      document.getElementById('clockHint').textContent = t('clickPause');
      tickInterval = setInterval(tick, 1000);
    }
  } else {
    state.timeLeft = data.timeLeft ?? state.timeLeft;
    state.targetEndTime = null;
    document.getElementById('clockWrap').classList.remove('running');
    document.getElementById('clockHint').textContent = t('clickResume');
  }
  updateDisplay();
  updateModeUI();
  _applyingRemote = false;
}

function listenTimerSync(uid) {
  if (_syncUnsub) { _syncUnsub(); _syncUnsub = null; }
  const fb = window._fb;
  _syncUnsub = fb.onSnapshot(fb.doc(fb.db, 'users', uid), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.timerState) applyRemoteState(data.timerState);
  });
}

function stopTimerSync() {
  if (_syncUnsub) { _syncUnsub(); _syncUnsub = null; }
}
