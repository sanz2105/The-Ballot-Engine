import { useState, useEffect } from 'react'
import { auth, signInWithGoogle, signOutUser } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(!!auth)

  useEffect(() => {
    if (!auth) {
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      // User closed popup or cancelled - not an error
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return
      }
      console.error('Sign-in error:', error)
    }
  }

  const signOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Sign-out error:', error)
    }
  }

  return { user, isLoading, signIn, signOut }
}
