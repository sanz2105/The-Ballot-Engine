import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { getPerformance, trace } from 'firebase/performance'

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
export const perf = isConfigured && typeof window !== 'undefined' ? getPerformance(app) : null

const provider = isConfigured ? new GoogleAuthProvider() : null

export const signInWithGoogle = () => {
  if (!isConfigured) return Promise.resolve()
  return signInWithPopup(auth, provider)
}

export const signOutUser = () => {
  if (!isConfigured) return Promise.resolve()
  return signOut(auth)
}

/**
 * Log a Firebase Analytics event.
 * All custom events are prefixed with 'be_' (ballot_engine) to avoid collisions.
 */
export const trackEvent = (eventName, params = {}) => {
  if (analytics) logEvent(analytics, eventName, params)
}

/**
 * Track key user engagement milestones with rich Analytics parameters.
 */
export const trackPhaseComplete = (phaseNumber, optionId, points, timeTaken, combo) => {
  trackEvent('be_phase_complete', {
    phase_number: phaseNumber,
    option_chosen: optionId,
    points_earned: points,
    is_correct: points > 0,
    is_perfect: points === 3,
    time_taken_seconds: Math.round(timeTaken),
    combo_streak: combo,
  })
}

export const trackGameComplete = (totalXp, grade, totalPoints, badgesCount) => {
  trackEvent('be_game_complete', {
    total_xp: totalXp,
    grade,
    total_points: totalPoints,
    badges_earned: badgesCount,
  })
}

export const trackBadgeUnlocked = (badgeId) => {
  trackEvent('be_badge_unlocked', { badge_id: badgeId })
}

export const trackSignIn = () => {
  trackEvent('be_sign_in', { method: 'google' })
}

export const trackSignOut = () => {
  trackEvent('be_sign_out')
}

export const trackGameStarted = (isAuthenticated) => {
  trackEvent('be_game_started', { is_authenticated: isAuthenticated })
}

// Advanced Analytics Helpers
export const logPhaseCompleted = (phase_number, score, xp_earned, time_taken_seconds) => {
  if (analytics) logEvent(analytics, 'phase_completed', { phase_number, score, xp_earned, time_taken_seconds })
}

export const logBadgeUnlocked = (badge_id, badge_name) => {
  if (analytics) logEvent(analytics, 'badge_unlocked', { badge_id, badge_name })
}

export const logGameCompleted = (total_score, grade, total_xp, phases_perfect) => {
  if (analytics) logEvent(analytics, 'game_completed', { total_score, grade, total_xp, phases_perfect })
}

export const logExportCalendar = (success) => {
  if (analytics) logEvent(analytics, 'export_calendar', { success })
}

export const logExportSheets = (success) => {
  if (analytics) logEvent(analytics, 'export_sheets', { success })
}

export const logLanguageChanged = (from_lang, to_lang) => {
  if (analytics) logEvent(analytics, 'language_changed', { from_lang, to_lang })
}

/**
 * Create a Firebase Performance trace.
 */
export const createPerfTrace = (traceName) => {
  if (!perf) return { start: () => {}, stop: () => {}, putAttribute: () => {}, putMetric: () => {} }
  return trace(perf, traceName)
}

