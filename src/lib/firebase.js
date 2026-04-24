import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, logEvent } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const isConfigured = !!firebaseConfig.apiKey

const app = isConfigured ? initializeApp(firebaseConfig) : null
export const auth = isConfigured ? getAuth(app) : null
export const db = isConfigured ? getFirestore(app) : null
export const analytics = isConfigured && typeof window !== 'undefined' ? getAnalytics(app) : null
const provider = isConfigured ? new GoogleAuthProvider() : null

export const signInWithGoogle = () => {
  if (!isConfigured) return Promise.resolve()
  return signInWithPopup(auth, provider)
}

export const signOutUser = () => {
  if (!isConfigured) return Promise.resolve()
  return signOut(auth)
}

export const trackEvent = (eventName, params = {}) => {
  if (analytics) logEvent(analytics, eventName, params)
}
