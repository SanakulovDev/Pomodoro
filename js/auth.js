// ============================================================
// auth.js — Firebase Authentication and cloud data
// ============================================================
const FREE_POMODOROS = 3;
let currentUser = null;
let guestPomos = parseInt(localStorage.getItem('zaman_guest_pomos') || '0');

function checkAuthWall() { if (currentUser) return; if (guestPomos >= FREE_POMODOROS) showAuthWall(); }
function showAuthWall() { document.getElementById('authWall').classList.add('visible'); }
function hideAuthWall() { document.getElementById('authWall').classList.remove('visible'); }
function skipAuth() { hideAuthWall(); notify(t('limitedMode')); }

async function firebaseLogin() {
  const btn = document.getElementById('googleLoginBtn');
  const hdrBtn = document.getElementById('headerLoginBtn');
  if (btn) { btn.textContent = t('signingIn'); btn.disabled = true; }
  if (hdrBtn) { hdrBtn.textContent = '...'; hdrBtn.disabled = true; }
  try {
    const fb = window._fb; if (!fb) { console.error('Firebase not loaded'); return; }
    await fb.signInWithPopup(fb.auth, fb.provider);
  } catch(e) {
    console.error('Auth error:', e.code, e.message);
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
      try { await window._fb.signInWithRedirect(window._fb.auth, window._fb.provider); } catch(e2) {}
    }
    if (btn) { btn.innerHTML = t('googleLogin'); btn.disabled = false; }
    if (hdrBtn) { hdrBtn.textContent = t('signIn'); hdrBtn.disabled = false; }
  }
}

async function firebaseLogout() {
  const fb = window._fb; if (!fb) return;
  await fb.signOut(fb.auth);
  currentUser = null; updateUserUI(null); notify(t('loggedOut'));
}

function updateUserUI(user) {
  const slot = document.getElementById('headerUserSlot'), cw = document.getElementById('userChipWrap');
  const hdrLogin = document.getElementById('headerLoginBtn');
  if (user) {
    document.getElementById('userAvatar').src = user.photoURL || '';
    document.getElementById('userName').textContent = user.displayName?.split(' ')[0] || 'User';
    cw.style.display = 'block'; slot.appendChild(cw); hideAuthWall();
    if (hdrLogin) hdrLogin.style.display = 'none';
  } else {
    cw.style.display = 'none'; slot.innerHTML = '';
    if (hdrLogin) hdrLogin.style.display = '';
  }
}

async function cloudSaveAnalytics() {
  if (!currentUser || !window._fb) return;
  try {
    const fb = window._fb;
    await fb.setDoc(fb.doc(fb.db, 'users', currentUser.uid), {
      analytics: getAnalytics(), settings: state.settings, updatedAt: Date.now(),
      displayName: currentUser.displayName, email: currentUser.email
    }, { merge: true });
  } catch(e) {}
}

async function cloudLoadData() {
  if (!currentUser || !window._fb) return;
  try {
    const fb = window._fb, snap = await fb.getDoc(fb.doc(fb.db, 'users', currentUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data.analytics) {
        const local = getAnalytics(), merged = { ...data.analytics };
        Object.keys(local).forEach(k => merged[k] = Math.max(merged[k] || 0, local[k] || 0));
        localStorage.setItem('zaman_analytics', JSON.stringify(merged));
      }
      if (data.settings) Object.assign(state.settings, data.settings);
    }
    notify(t('cloudLoaded'));
  } catch(e) {}
}

function initFirebaseAuth() {
  if (!window._fb) { setTimeout(initFirebaseAuth, 200); return; }
  window._fb.getRedirectResult(window._fb.auth).catch(() => {});
  window._fb.onAuthStateChanged(window._fb.auth, async (user) => {
    currentUser = user; updateUserUI(user);
    if (user) {
      guestPomos = 0; localStorage.removeItem('zaman_guest_pomos'); hideAuthWall();
      await cloudLoadData();
      listenTimerSync(user.uid);
      setInterval(cloudSaveAnalytics, 120000);
    } else {
      stopTimerSync();
      checkAuthWall();
    }
  });
}

// Guest pomodoro tracking
const _origRecord = recordPomodoro;
window.recordPomodoro = function() {
  _origRecord();
  if (!currentUser) { guestPomos++; localStorage.setItem('zaman_guest_pomos', guestPomos); checkAuthWall(); }
  else { clearTimeout(window._syncTimer); window._syncTimer = setTimeout(cloudSaveAnalytics, 3000); }
};
