export const LEVELS = [
  { title: 'Ballot Newbie', color: '#9CA3AF', minXP: 0 },
  { title: 'Ward Officer', color: '#10B981', minXP: 80 },
  { title: 'District Chief', color: '#3B82F6', minXP: 200 },
  { title: 'Constituency Head', color: '#8B5CF6', minXP: 360 },
  { title: 'Election Commissioner', color: '#F59E0B', minXP: 500 },
  { title: 'Democracy Architect', color: '#EF4444', minXP: 680 },
]

export const getLevelForXP = (xp) => {
  let currentLevel = LEVELS[0]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i]
      break
    }
  }
  return currentLevel
}

export const getNextLevel = (xp) => {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].minXP) {
      return LEVELS[i]
    }
  }
  return LEVELS[LEVELS.length - 1]
}

export const getXPProgress = (xp) => {
  const current = getLevelForXP(xp)
  const next = getNextLevel(xp)

  if (current.minXP === next.minXP) return 100

  const xpInCurrentLevel = xp - current.minXP
  const xpNeededForNext = next.minXP - current.minXP
  return Math.round((xpInCurrentLevel / xpNeededForNext) * 100)
}
