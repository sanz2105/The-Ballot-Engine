import { describe, it, expect } from 'vitest'
import { getLevelForXP, getNextLevel, getXPProgress } from '../../data/levels'
import { calculateGrade } from '../../hooks/useGameEngine'

describe('Game Logic Tests', () => {
  it('getLevelForXP should return correct levels', () => {
    // LEVELS: Ballot Newbie(0), Ward Officer(80), District Chief(200),
    //         Constituency Head(360), Election Commissioner(500), Democracy Architect(680)
    expect(getLevelForXP(0).title).toBe('Ballot Newbie')
    expect(getLevelForXP(150).title).toBe('Ward Officer')   // 150 >= 80, < 200
    expect(getLevelForXP(500).title).toBe('Election Commissioner') // exactly 500
  })

  it('getNextLevel should return correct next level thresholds', () => {
    expect(getNextLevel(0).title).toBe('Ward Officer')        // next above 0 is minXP:80
    expect(getNextLevel(150).title).toBe('District Chief')    // next above 150 is minXP:200
    expect(getNextLevel(500).title).toBe('Democracy Architect') // next above 500 is minXP:680
  })

  it('getXPProgress should return correct percentage', () => {
    // At xp=0: in Ballot Newbie(0→80), progress = 0/80 = 0%
    expect(getXPProgress(0)).toBe(0)
    // At xp=50: in Ballot Newbie(0→80), progress = 50/80 = 63%
    expect(getXPProgress(50)).toBe(63)
    // At xp=140: in Ward Officer(80→200), progress = 60/120 = 50%
    expect(getXPProgress(140)).toBe(50)
  })

  it('calculateGrade should assign correct grades', () => {
    expect(calculateGrade(24, 24).grade).toBe('S')
    expect(calculateGrade(20, 24).grade).toBe('A') // 83.3%
    expect(calculateGrade(16, 24).grade).toBe('B') // 66.6%
    expect(calculateGrade(12, 24).grade).toBe('C') // 50%
    expect(calculateGrade(10, 24).grade).toBe('D') // <50%
  })
})

