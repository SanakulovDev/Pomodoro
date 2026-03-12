// ============================================================
// auth.js — Firebase Authentication and cloud data
// ============================================================
const FREE_POMODOROS = 3;
let currentUser = null;
let guestPomos = parseInt(localStorage.getItem('zaman_guest_pomos') || '0');
let firebaseLoadPromise = null;
let firebaseAuthReady = false;
const FIREBASE_MODULE_SRC = '/js/firebase.js?v=20260306-11';

function checkAuthWall() { if (currentUser) return; if (guestPomos >= FREE_POMODOROS) showAuthWall(); }
function showAuthWall() {
  const wall = document.getElementById('authWall');
  wall.classList.add('visible');
  wall.setAttribute('aria-hidden', 'false');
}
function hideAuthWall() {
  const wall = document.getElementById('authWall');
  wall.classList.remove('visible');
  wall.setAttribute('aria-hidden', 'true');
}
function skipAuth() { hideAuthWall(); notify(t('limitedMode')); }

function waitForFirebase(resolve, reject, attempt = 0) {
  if (window._fb) {
    resolve(window._fb);
    return;
  }
  if (attempt > 80) {
    firebaseLoadPromise = null;
    reject(new Error('Firebase bootstrap timed out'));
    return;
  }
  setTimeout(() => waitForFirebase(resolve, reject, attempt + 1), 50);
}

function ensureFirebaseLoaded() {
  if (window._fb) return Promise.resolve(window._fb);
  if (firebaseLoadPromise) return firebaseLoadPromise;

  firebaseLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-firebase-loader]');
    if (existing) {
      waitForFirebase(resolve, reject);
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = FIREBASE_MODULE_SRC;
    script.dataset.firebaseLoader = 'true';
    script.onload = () => waitForFirebase(resolve, reject);
    script.onerror = () => {
      firebaseLoadPromise = null;
      reject(new Error('Firebase load failed'));
    };
    document.head.appendChild(script);
  });

  return firebaseLoadPromise;
}

function scheduleFirebaseBootstrap() {
  const boot = () => { initFirebaseAuth(); };
  if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 2500 });
  else setTimeout(boot, 1200);
}

async function firebaseLogin() {
  const btn = document.getElementById('googleLoginBtn');
  const hdrBtn = document.getElementById('headerLoginBtn');
  const btnLabel = btn ? btn.querySelector('span') : null;
  if (btn) {
    if (btnLabel) btnLabel.textContent = t('signingIn');
    else btn.textContent = t('signingIn');
    btn.disabled = true;
  }
  if (hdrBtn) { hdrBtn.textContent = '...'; hdrBtn.disabled = true; }
  try {
    const fb = await ensureFirebaseLoaded();
    if (!firebaseAuthReady) await initFirebaseAuth();
    await fb.signInWithPopup(fb.auth, fb.provider);
  } catch(e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
      try { await window._fb.signInWithRedirect(window._fb.auth, window._fb.provider); } catch(e2) {}
    }
    if (btn) {
      if (btnLabel) btnLabel.textContent = t('googleLogin');
      else btn.textContent = t('googleLogin');
      btn.disabled = false;
    }
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
    const avatar = document.getElementById('userAvatar');
    const shortName = user.displayName?.split(' ')[0] || 'User';
    avatar.src = user.photoURL || '';
    avatar.alt = shortName;
    document.getElementById('userName').textContent = shortName;
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
  if (firebaseAuthReady) return Promise.resolve();
  return ensureFirebaseLoaded().then(() => {
    if (firebaseAuthReady) return;
    firebaseAuthReady = true;
    window._fb.getRedirectResult(window._fb.auth).catch(() => {});
    window._fb.onAuthStateChanged(window._fb.auth, async (user) => {
      currentUser = user; updateUserUI(user);
      if (typeof updateDailyQuote === 'function') updateDailyQuote();
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
  }).catch(() => {});
}

// Guest pomodoro tracking
const _origRecord = recordPomodoro;
window.recordPomodoro = function() {
  _origRecord();
  if (!currentUser) { guestPomos++; localStorage.setItem('zaman_guest_pomos', guestPomos); checkAuthWall(); }
  else { clearTimeout(window._syncTimer); window._syncTimer = setTimeout(cloudSaveAnalytics, 3000); }
};
