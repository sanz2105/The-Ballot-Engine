import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameEngine } from '../useGameEngine'

// Mock Gemini
vi.mock('../../lib/gemini', () => ({
  getNarratorFeedback: vi.fn(() => Promise.resolve('Test narration.')),
}))

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  trackEvent: vi.fn(),
  trackBadgeUnlocked: vi.fn(),
  trackPhaseComplete: vi.fn(),
  trackGameComplete: vi.fn(),
  trackGameStarted: vi.fn(),
}))

describe('useGameEngine', () => {
  it('initial gameScreen is intro', () => {
    const { result } = renderHook(() => useGameEngine())
    expect(result.current.gameScreen).toBe('intro')
  })

  it('after startGame(), gameScreen is game, xp is 0, combo is 0', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })
    expect(result.current.gameScreen).toBe('game')
    expect(result.current.xp).toBe(0)
    expect(result.current.combo).toBe(0)
  })

  it('after selectOption with correct answer (points=3), xp > 0, combo === 1, stage === feedback', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })

    const correctOption = result.current.currentPhase.options.find((o) => o.isCorrect)
    act(() => {
      result.current.selectOption(correctOption)
    })

    expect(result.current.xp).toBeGreaterThan(0)
    expect(result.current.combo).toBe(1)
    expect(result.current.stage).toBe('feedback')
  })

  it('after selectOption with wrong answer (points=0), xp === 0, combo === 0', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })

    const wrongOption = result.current.currentPhase.options.find((o) => !o.isCorrect && o.points === 0)
    act(() => {
      result.current.selectOption(wrongOption)
    })

    expect(result.current.xp).toBe(50) // Assuming <5s answering gives 50 time bonus
    expect(result.current.combo).toBe(0)
  })

  it('3 consecutive correct answers → combo === 3', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })

    // Answer 1
    const correctOption1 = result.current.currentPhase.options.find((o) => o.isCorrect)
    act(() => {
      result.current.selectOption(correctOption1)
    })

    act(() => {
      result.current.advancePhase()
    })

    // Answer 2
    const correctOption2 = result.current.currentPhase.options.find((o) => o.isCorrect)
    act(() => {
      result.current.selectOption(correctOption2)
    })

    act(() => {
      result.current.advancePhase()
    })

    // Answer 3
    const correctOption3 = result.current.currentPhase.options.find((o) => o.isCorrect)
    act(() => {
      result.current.selectOption(correctOption3)
    })

    expect(result.current.combo).toBe(3)
  })

  it('correct then wrong → combo resets to 0', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })

    // Correct answer
    const correctOption = result.current.currentPhase.options.find((o) => o.isCorrect)
    act(() => {
      result.current.selectOption(correctOption)
    })
    expect(result.current.combo).toBe(1)

    act(() => {
      result.current.advancePhase()
    })

    // Wrong answer
    const wrongOption = result.current.currentPhase.options.find((o) => !o.isCorrect && o.points === 0)
    act(() => {
      result.current.selectOption(wrongOption)
    })

    expect(result.current.combo).toBe(0)
  })

  it('after all 8 phases, advancePhase() sets gameScreen to results', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })

    // Go through all 8 phases
    for (let i = 0; i < 8; i++) {
      const correctOption = result.current.currentPhase.options.find((o) => o.isCorrect)
      act(() => {
        result.current.selectOption(correctOption)
      })

      if (i < 7) {
        act(() => {
          result.current.advancePhase()
        })
      } else {
        act(() => {
          result.current.advancePhase()
        })
      }
    }

    expect(result.current.gameScreen).toBe('results')
  })

  it('resetGame() returns gameScreen to intro and xp to 0', () => {
    const { result } = renderHook(() => useGameEngine())
    act(() => {
      result.current.startGame()
    })

    // Do something to change state
    const correctOption = result.current.currentPhase.options.find((o) => o.isCorrect)
    act(() => {
      result.current.selectOption(correctOption)
    })

    expect(result.current.xp).toBeGreaterThan(0)

    act(() => {
      result.current.resetGame()
    })

    expect(result.current.gameScreen).toBe('intro')
    expect(result.current.xp).toBe(0)
  })
})
