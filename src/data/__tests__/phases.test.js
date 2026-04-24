import { describe, it, expect } from 'vitest'
import { PHASES } from '../phases'

describe('PHASES data', () => {
  it('has exactly 8 phases', () => {
    expect(PHASES).toHaveLength(8)
  })

  it('each phase has exactly 4 options', () => {
    PHASES.forEach((phase) => {
      expect(phase.options).toHaveLength(4)
    })
  })

  it('each phase has exactly one option with isCorrect === true', () => {
    PHASES.forEach((phase) => {
      const correctOptions = phase.options.filter((o) => o.isCorrect)
      expect(correctOptions).toHaveLength(1)
    })
  })

  it('each correct option has points === 3', () => {
    PHASES.forEach((phase) => {
      const correctOption = phase.options.find((o) => o.isCorrect)
      expect(correctOption.points).toBe(3)
    })
  })

  it('no option has points > 3 or points < 0', () => {
    PHASES.forEach((phase) => {
      phase.options.forEach((option) => {
        expect(option.points).toBeGreaterThanOrEqual(0)
        expect(option.points).toBeLessThanOrEqual(3)
      })
    })
  })

  it('all phase numbers are unique strings 01 through 08', () => {
    const numbers = PHASES.map((p) => p.number)
    expect(numbers).toEqual(['01', '02', '03', '04', '05', '06', '07', '08'])
  })
})
