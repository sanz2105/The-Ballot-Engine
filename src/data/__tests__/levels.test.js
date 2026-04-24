import { describe, it, expect } from 'vitest'
import { getLevelForXP, getXPProgress } from '../levels'

describe('getLevelForXP', () => {
  it('returns Ballot Newbie for xp=0', () => {
    const level = getLevelForXP(0)
    expect(level.title).toBe('Ballot Newbie')
  })

  it('returns Ward Officer for xp=80', () => {
    const level = getLevelForXP(80)
    expect(level.title).toBe('Ward Officer')
  })

  it('returns Ward Officer for xp=199 (not yet District Chief)', () => {
    const level = getLevelForXP(199)
    expect(level.title).toBe('Ward Officer')
  })

  it('returns District Chief for xp=200', () => {
    const level = getLevelForXP(200)
    expect(level.title).toBe('District Chief')
  })

  it('returns Democracy Architect for xp=680', () => {
    const level = getLevelForXP(680)
    expect(level.title).toBe('Democracy Architect')
  })

  it('returns Democracy Architect for xp=999 (max level)', () => {
    const level = getLevelForXP(999)
    expect(level.title).toBe('Democracy Architect')
  })
})

describe('getXPProgress', () => {
  it('returns 0 for xp=0', () => {
    expect(getXPProgress(0)).toBe(0)
  })

  it('returns 50 for xp=40 (halfway from 0 to 80)', () => {
    expect(getXPProgress(40)).toBe(50)
  })

  it('returns 0 for xp=80 (start of new level bracket)', () => {
    expect(getXPProgress(80)).toBe(0)
  })

  it('returns 100 for xp=999 (max level, full bar)', () => {
    expect(getXPProgress(999)).toBe(100)
  })
})
