import { db } from '../lib/firebase'
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

export const submitScore = async (userId, displayName, photoURL, scoreData) => {
  if (!db) return { success: false, isNewRecord: false }
  try {
    const userDocRef = doc(db, 'leaderboard', userId)
    const existingDoc = await getDoc(userDocRef)

    const existingXp = existingDoc.exists() ? existingDoc.data().xp : 0
    const isNewRecord = scoreData.xp > existingXp

    if (isNewRecord || !existingDoc.exists()) {
      await setDoc(userDocRef, {
        userId,
        displayName,
        photoURL,
        xp: scoreData.xp,
        totalPoints: scoreData.totalPoints,
        grade: scoreData.grade,
        badgesEarned: scoreData.badgesEarned,
        completedAt: scoreData.completedAt,
        updatedAt: Date.now(),
      })

      return { success: true, isNewRecord: true }
    }

    return { success: true, isNewRecord: false }
  } catch (error) {
    console.error('Error submitting score:', error)
    return { success: false, isNewRecord: false }
  }
}

export const getTopScores = async (limitCount = 10) => {
  if (!db) return []
  try {
    const leaderboardRef = collection(db, 'leaderboard')
    const q = query(leaderboardRef, orderBy('xp', 'desc'), limit(limitCount))
    const querySnapshot = await getDocs(q)

    const scores = []
    let rank = 1
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      scores.push({
        rank,
        userId: data.userId,
        displayName: data.displayName,
        photoURL: data.photoURL,
        xp: data.xp,
        grade: data.grade,
        badgesEarned: data.badgesEarned,
      })
      rank++
    })

    return scores
  } catch (error) {
    console.error('Error fetching top scores:', error)
    return []
  }
}

export const getUserRank = async (userId) => {
  if (!db) return null
  try {
    const leaderboardRef = collection(db, 'leaderboard')
    const q = query(leaderboardRef, orderBy('xp', 'desc'))
    const querySnapshot = await getDocs(q)

    let rank = 1
    for (const doc of querySnapshot.docs) {
      if (doc.data().userId === userId) {
        return rank
      }
      rank++
    }

    return null
  } catch (error) {
    console.error('Error fetching user rank:', error)
    return null
  }
}
