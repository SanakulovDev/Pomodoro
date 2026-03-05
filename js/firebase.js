// ============================================================
// firebase.js — Firebase initialization (ES module)
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVkBum8vWy-LmUmTERun9UqUoArwgjBME",
  authDomain: "pomodoro-e1835.firebaseapp.com",
  projectId: "pomodoro-e1835",
  storageBucket: "pomodoro-e1835.firebasestorage.app",
  messagingSenderId: "769997683153",
  appId: "1:769997683153:web:bae99d33fd3da14d4cc8f0",
  measurementId: "G-KLMWN6C7F8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window._fb = { auth, db, provider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, increment, onSnapshot };
