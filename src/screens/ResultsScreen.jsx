import { useState, useEffect } from 'react'
import { PHASES } from '../data/phases'
import { BADGES } from '../data/badges'
import { getLevelForXP } from '../data/levels'
import { calculateGrade } from '../hooks/useGameEngine'
import { submitScore, getTopScores, getUserRank } from '../services/leaderboard'
import { createPerfTrace, trackEvent } from '../lib/firebase'

export default function ResultsScreen({ phaseResults, xp, unlockedBadges, user, onRestart }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    const submitAndFetch = async () => {
      if (user) {
        const perfTrace = createPerfTrace('score_submission_latency')
        perfTrace.start()

        const totalPoints = phaseResults.reduce((sum, r) => sum + r.points, 0)
        const { grade } = calculateGrade(totalPoints, PHASES.length * 3)

        await submitScore(user.uid, user.displayName, user.photoURL, {
          xp,
          totalPoints,
          grade,
          badgesEarned: unlockedBadges,
          completedAt: Date.now(),
        })

        const topScores = await getTopScores(10)
        setLeaderboard(topScores)

        const rank = await getUserRank(user.uid)
        setUserRank(rank)

        perfTrace.putAttribute('grade', grade)
        perfTrace.stop()
        
        trackEvent('be_results_viewed', { final_xp: xp, final_grade: grade })
      }
    }

    submitAndFetch()
  }, [user, xp, phaseResults, unlockedBadges])

  const totalPoints = phaseResults.reduce((sum, r) => sum + r.points, 0)
  const maxPoints = PHASES.length * 3
  const { grade, color } = calculateGrade(totalPoints, maxPoints)
  const level = getLevelForXP(xp)

  const unlockedBadgeObjects = BADGES.filter((b) => unlockedBadges.includes(b.id))

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-dark)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
        <h1
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}
        >
          Verdania Election — Complete
        </h1>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--gold)',
            marginBottom: '2rem',
          }}
        >
          THE BALLOT ENGINE
        </h2>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '2rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
          }}
        >
          {[
            { label: 'Grade', value: grade, color },
            { label: 'Total XP', value: xp },
            { label: 'Points', value: `${totalPoints}/${maxPoints}` },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: stat.color || 'var(--gold)',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Final Rank Card */}
        <div
          style={{
            padding: '1.5rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: level.color,
            }}
          >
            {level.title}
          </div>
        </div>

        {/* Phase Breakdown */}
        <div
          style={{
            padding: '1.5rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--text-primary)',
            }}
          >
            Phase Results
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {PHASES.map((phase, idx) => {
              const result = phaseResults[idx]
              const bgColor =
                result?.points === 3
                  ? 'rgba(16, 185, 129, 0.1)'
                  : result?.points > 0
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)'
              const borderColor =
                result?.points === 3
                  ? 'rgba(16, 185, 129, 0.4)'
                  : result?.points > 0
                    ? 'rgba(245, 158, 11, 0.4)'
                    : 'rgba(239, 68, 68, 0.4)'

              return (
                <div
                  key={phase.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{phase.title}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--gold)',
                    }}
                  >
                    {result?.points || 0}/3
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Badges Earned */}
        {unlockedBadgeObjects.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              borderRadius: '8px',
              marginBottom: '2rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary)',
              }}
            >
              Badges Earned
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
              }}
            >
              {unlockedBadgeObjects.map((badge) => (
                <div key={badge.id} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {badge.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {user && leaderboard.length > 0 && (
          <div
            style={{
              width: '100%',
              padding: '1.5rem',
              background: 'var(--bg-card)',
              borderRadius: '8px',
              marginBottom: '2rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary)',
              }}
            >
              Global Leaderboard
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {leaderboard.map((entry) => {
                const isCurrentUser = user.uid === entry.userId
                return (
                  <div
                    key={entry.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      background: isCurrentUser ? 'rgba(245, 200, 66, 0.1)' : 'transparent',
                      border: isCurrentUser ? '1px solid var(--gold)' : 'none',
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--gold)',
                        minWidth: '30px',
                      }}
                    >
                      #{entry.rank}
                    </div>
                    {entry.photoURL && (
                      <img
                        src={entry.photoURL}
                        alt={entry.displayName}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {entry.displayName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gold)' }}>
                        {entry.xp} XP
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {entry.grade}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {userRank && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(245, 200, 66, 0.05)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: 'var(--gold)',
                  fontWeight: 600,
                }}
              >
                Your Rank: #{userRank}
              </div>
            )}
          </div>
        )}

        {/* Restart Button */}
        <button
          onClick={onRestart}
          style={{
            padding: '1rem 2rem',
            background: 'var(--gold)',
            border: 'none',
            color: 'var(--bg-dark)',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)'
          }}
        >
          Run Another Election
        </button>
      </div>
    </div>
  )
}
