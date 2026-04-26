import { describe, it, expect } from 'vitest'
import { getLevelForXP, getNextLevel, getXPProgress } from '../../data/levels'
import { calculateGrade } from '../../hooks/useGameEngine'

describe('Game Logic Tests', () => {
  it('getLevelForXP should return correct levels', () => {
    expect(getLevelForXP(0).title).toBe('Ballot Newbie')
    expect(getLevelForXP(150).title).toBe('Civic Observer')
    expect(getLevelForXP(500).title).toBe('Election Commissioner')
  })

  it('getNextLevel should return correct next level thresholds', () => {
    expect(getNextLevel(0).title).toBe('Civic Observer')
    expect(getNextLevel(150).title).toBe('Policy Analyst')
    expect(getNextLevel(500)).toBeNull()
  })

  it('getXPProgress should return correct percentage', () => {
    expect(getXPProgress(0)).toBe(0)
    expect(getXPProgress(50)).toBe(50) // 50/100 -> 50%
    expect(getXPProgress(150)).toBe(0) // Level 2 base is 100, next is 200 -> 50/100 -> 50%
  })

  it('calculateGrade should assign correct grades', () => {
    expect(calculateGrade(24, 24).grade).toBe('S')
    expect(calculateGrade(20, 24).grade).toBe('A') // 83.3%
    expect(calculateGrade(16, 24).grade).toBe('B') // 66.6%
    expect(calculateGrade(12, 24).grade).toBe('C') // 50%
    expect(calculateGrade(10, 24).grade).toBe('D') // <50%
  })
})
