import { useState, useRef, useCallback, useEffect } from 'react'
import { PHASES } from '../data/phases'
import { BADGES } from '../data/badges'
import { getNarratorFeedback, getHintText } from '../services/geminiService'
import { trackBadgeUnlocked, trackPhaseComplete, trackGameComplete, trackGameStarted } from '../lib/firebase'

export const calculateGrade = (points, maxPoints) => {
  const pct = (points / maxPoints) * 100
  if (pct === 100) return { grade: 'S', color: '#F5C842' }
  if (pct >= 83) return { grade: 'A', color: '#10B981' }
  if (pct >= 66) return { grade: 'B', color: '#3B82F6' }
  if (pct >= 50) return { grade: 'C', color: '#8B5CF6' }
  return { grade: 'D', color: '#EF4444' }
}

export const useGameEngine = () => {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [stage, setStage] = useState('question')
  const [chosenOptionId, setChosenOptionId] = useState(null)
  const [xp, setXp] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [phasesCompleted, setPhasesCompleted] = useState(0)
  const [perfectPhases, setPerfectPhases] = useState(0)
  const [fastCorrectAnswers, setFastCorrectAnswers] = useState(0)
  const [unlockedBadges, setUnlockedBadges] = useState([])
  const [phaseResults, setPhaseResults] = useState([])
  const [timeline, setTimeline] = useState([])
  const [narration, setNarration] = useState('')
  const [isNarrationLoading, setIsNarrationLoading] = useState(false)
  const [newBadgeNotification, setNewBadgeNotification] = useState(null)
  const [xpPopup, setXpPopup] = useState(null)
  const [hintText, setHintText] = useState('')
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [hintsUsedTotal, setHintsUsedTotal] = useState(0)
  const [currentPhaseHintUsed, setCurrentPhaseHintUsed] = useState(false)
  const [gameScreen, setGameScreen] = useState('intro')

  const phaseStartTimeRef = useRef(null)

  useEffect(() => {
    phaseStartTimeRef.current = Date.now()
  }, [])
  const abortControllerRef = useRef(null)
  const badgeNotificationTimeoutRef = useRef(null)
  const xpPopupTimeoutRef = useRef(null)

  const checkBadges = useCallback(
    (stats) => {
      const newBadges = []
      for (const badge of BADGES) {
        if (badge.check(stats) && !unlockedBadges.includes(badge.id)) {
          newBadges.push(badge)
          setUnlockedBadges((prev) => [...prev, badge.id])
          trackBadgeUnlocked(badge.id)
        }
      }
      return newBadges
    },
    [unlockedBadges]
  )

  const selectOption = useCallback(
    (option) => {
      if (stage !== 'question') return

      const timeTaken = (Date.now() - phaseStartTimeRef.current) / 1000
      const isFast = timeTaken < 5

      const baseXP = option.points === 3 ? 100 : option.points === 2 ? 60 : option.points === 1 ? 30 : 0
      const timeBonus = isFast ? 50 : timeTaken < 10 ? 25 : timeTaken < 20 ? 10 : 0
      const newCombo = option.isCorrect ? combo + 1 : 0
      const newMaxCombo = Math.max(maxCombo, newCombo)
      const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : newCombo >= 2 ? 1.5 : 1
      const earnedXP = Math.round((baseXP + timeBonus) * multiplier)

      setChosenOptionId(option.id)
      setStage('feedback')
      setXp((prev) => prev + earnedXP)
      setCombo(newCombo)
      setMaxCombo(newMaxCombo)

      const currentPhase = PHASES[phaseIndex]
      const correctOption = currentPhase.options.find((o) => o.isCorrect)

      if (option.isCorrect) {
        setPhasesCompleted((prev) => prev + 1)
        if (option.points === 3) {
          setPerfectPhases((prev) => prev + 1)
        }
        if (isFast && option.isCorrect) {
          setFastCorrectAnswers((prev) => prev + 1)
        }
      }

      setPhaseResults((prev) => [
        ...prev,
        { phaseId: currentPhase.id, optionId: option.id, points: option.points, xpEarned: earnedXP },
      ])

      setTimeline((prev) => [
        ...prev,
        {
          number: currentPhase.number,
          milestone: currentPhase.milestone,
          points: option.points,
          daysToElection: currentPhase.daysToElection,
        },
      ])

      setXpPopup({
        earned: earnedXP,
        isCorrect: option.isCorrect,
        isFast,
        combo: newCombo,
      })

      if (xpPopupTimeoutRef.current) clearTimeout(xpPopupTimeoutRef.current)
      xpPopupTimeoutRef.current = setTimeout(() => setXpPopup(null), 1600)

      // Check badges and handle notifications
      const stats = {
        phasesCompleted: phasesCompleted + (option.isCorrect ? 1 : 0),
        perfectPhases: perfectPhases + (option.points === 3 ? 1 : 0),
        fastCorrectAnswers: fastCorrectAnswers + (isFast && option.isCorrect ? 1 : 0),
        currentCombo: newCombo,
        maxCombo: newMaxCombo,
      }
      const newBadges = checkBadges(stats)
      if (newBadges.length > 0) {
        setNewBadgeNotification(newBadges[0])
        if (badgeNotificationTimeoutRef.current) clearTimeout(badgeNotificationTimeoutRef.current)
        badgeNotificationTimeoutRef.current = setTimeout(() => setNewBadgeNotification(null), 3200)
      }

      // Get AI feedback
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsNarrationLoading(true)
      setNarration('')

      getNarratorFeedback(currentPhase, option, correctOption, newCombo, controller.signal)
        .then((text) => {
          if (!controller.signal.aborted && text) {
            setNarration(text)
          }
          setIsNarrationLoading(false)
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Narration error:', error)
            setIsNarrationLoading(false)
          }
        })

      trackPhaseComplete(currentPhase.number, option.id, option.points, timeTaken, newCombo)
    },
    [stage, phaseIndex, combo, maxCombo, phasesCompleted, perfectPhases, fastCorrectAnswers, checkBadges]
  )

  const requestHint = useCallback(async () => {
    if (stage !== 'question' || currentPhaseHintUsed || xp < 15) return

    setIsHintLoading(true)
    setXp((prev) => prev - 15)
    setCurrentPhaseHintUsed(true)
    setHintsUsedTotal((prev) => prev + 1)

    try {
      const hint = await getHintText(currentPhase, currentPhase.options)
      setHintText(hint)
    } catch (error) {
      console.error('Hint error:', error)
    } finally {
      setIsHintLoading(false)
    }
  }, [stage, currentPhaseHintUsed, xp, currentPhase])

  const advancePhase = useCallback(() => {
    if (phaseIndex >= PHASES.length - 1) {
      const totalPoints = phaseResults.reduce((sum, r) => sum + r.points, 0)
      const maxPoints = PHASES.length * 3
      const { grade } = calculateGrade(totalPoints, maxPoints)
      const badgesCount = phaseResults.length > 0 ? unlockedBadges.length : 0
      setGameScreen('results')
      trackGameComplete(xp, grade, totalPoints, badgesCount)
    } else {
      setPhaseIndex((prev) => prev + 1)
      setStage('question')
      setChosenOptionId(null)
      setNarration('')
      setHintText('')
      setCurrentPhaseHintUsed(false)
      phaseStartTimeRef.current = Date.now()
    }
  }, [phaseIndex, xp, phaseResults, unlockedBadges.length])

  const startGame = useCallback(() => {
    setGameScreen('game')
    setPhaseIndex(0)
    setStage('question')
    setChosenOptionId(null)
    setXp(0)
    setCombo(0)
    setMaxCombo(0)
    setPhasesCompleted(0)
    setPerfectPhases(0)
    setFastCorrectAnswers(0)
    setUnlockedBadges([])
    setPhaseResults([])
    setTimeline([])
    setNarration('')
    setIsNarrationLoading(false)
    setNewBadgeNotification(null)
    setXpPopup(null)
    setHintText('')
    setIsHintLoading(false)
    setHintsUsedTotal(0)
    setCurrentPhaseHintUsed(false)
    phaseStartTimeRef.current = Date.now()
  }, [])

  const resetGame = useCallback(() => {
    startGame()
    setGameScreen('intro')
  }, [startGame])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (badgeNotificationTimeoutRef.current) clearTimeout(badgeNotificationTimeoutRef.current)
      if (xpPopupTimeoutRef.current) clearTimeout(xpPopupTimeoutRef.current)
      abortControllerRef.current?.abort()
    }
  }, [])

  const currentPhase = PHASES[phaseIndex]

  return {
    trackGameStarted,
    gameScreen,
    phaseIndex,
    stage,
    chosenOptionId,
    xp,
    combo,
    maxCombo,
    unlockedBadges,
    phaseResults,
    timeline,
    narration,
    isNarrationLoading,
    newBadgeNotification,
    xpPopup,
    currentPhase,
    startGame,
    selectOption,
    requestHint,
    advancePhase,
    resetGame,
    hintText,
    isHintLoading,
    currentPhaseHintUsed,
    hintsUsedTotal,
  }
}
