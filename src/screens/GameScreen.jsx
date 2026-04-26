import { useEffect } from 'react'
import XPBar from '../components/XPBar'
import OptionButton from '../components/OptionButton'
import NarratorPanel from '../components/NarratorPanel'
import XPPopup from '../components/XPPopup'
import BadgeNotification from '../components/BadgeNotification'
import { PHASES } from '../data/phases'
import { BADGES } from '../data/badges'
import { getLevelForXP, getNextLevel, getXPProgress } from '../data/levels'
import { useTranslation } from '../context/TranslationContext'

export default function GameScreen({ engine }) {
  const {
    currentPhase,
    phaseIndex,
    stage,
    chosenOptionId,
    xp,
    combo,
    narration,
    isNarrationLoading,
    xpPopup,
    newBadgeNotification,
    selectOption,
    advancePhase,
    requestHint,
    hintText,
    isHintLoading,
    currentPhaseHintUsed,
  } = engine

  const { t, language, registerStrings } = useTranslation()

  useEffect(() => {
    if (language !== 'en' && registerStrings) {
      const strings = [
        currentPhase.title,
        currentPhase.scenario,
        ...currentPhase.options.map(o => o.text)
      ]
      registerStrings(strings)
    }
  }, [currentPhase, language, registerStrings])

  const currentLevel = getLevelForXP(xp)
  const nextLevel = getNextLevel(xp)
  const xpPercent = getXPProgress(xp)

  const completedPhases = engine.phaseResults.map((r) => r.phaseId)
  const currentPhaseNumber = phaseIndex + 1

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-dark)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <XPBar
        xp={xp}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        xpPercent={xpPercent}
        combo={combo}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '190px 1fr',
          height: 'calc(100vh - 80px)',
          gap: 0,
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            background: 'rgba(7, 11, 20, 0.6)',
            borderRight: '1px solid var(--border-subtle)',
            overflowY: 'auto',
            padding: '1.5rem 1rem',
          }}
        >
          {/* Phases Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              {t('Phases')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PHASES.map((phase, idx) => {
                const isDone = completedPhases.includes(phase.id)
                const isCurrent = idx === phaseIndex
                const isFuture = idx > phaseIndex

                return (
                  <div
                    key={phase.id}
                    aria-current={isCurrent ? 'true' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      border: isCurrent ? '1px solid var(--gold)' : '1px solid transparent',
                      background: isCurrent ? 'rgba(245, 200, 66, 0.1)' : 'transparent',
                      opacity: isFuture ? 0.38 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isDone ? 'var(--green)' : isCurrent ? 'var(--gold)' : 'var(--text-muted)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {phase.number}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.5rem 0' }} />

          {/* Badges Section */}
          <div>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              {t('Badges')}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}
            >
              {BADGES.map((badge) => {
                const isUnlocked = engine.unlockedBadges.includes(badge.id)
                return (
                  <div
                    key={badge.id}
                    title={`${badge.name}: ${badge.description}`}
                    style={{
                      fontSize: '1.2rem',
                      opacity: isUnlocked ? 1 : 0.3,
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      cursor: 'default',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: isUnlocked ? '1px solid var(--gold)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {badge.icon}
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          id="main-content"
          style={{
            overflowY: 'auto',
            padding: '2rem 2rem 6rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
          {/* Phase Header */}
          <div
            style={{
              paddingLeft: '1rem',
              borderLeft: '3px solid var(--gold)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              {t('PHASE')} {currentPhase.number} / 08
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--gold)',
                margin: '0.5rem 0 0 0',
              }}
            >
              {t(currentPhase.title)}
            </h2>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginTop: '0.5rem',
              }}
            >
              {8 - currentPhaseNumber} {t('phases remaining')}
            </p>
          </div>

          {/* Scenario Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '1.5rem',
              borderTop: '2px solid var(--gold)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
              }}
            >
              🗳️ {t('Situation Report')}
            </div>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {t(currentPhase.scenario)}
            </p>
          </div>

          {/* Options or Feedback */}
          {stage === 'question' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentPhase.options.map((option, idx) => (
                <div
                  key={option.id}
                  className="anim-fadeup"
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  <OptionButton
                    option={option}
                    isChosen={chosenOptionId === option.id}
                    stage={stage}
                    onSelect={selectOption}
                  />
                </div>
              ))}

              {/* Hint Section */}
              <div style={{ marginTop: '0.5rem' }}>
                {!currentPhaseHintUsed ? (
                  <button
                    onClick={requestHint}
                    disabled={engine.xp < 15}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: engine.xp < 15 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      opacity: engine.xp < 15 ? 0.5 : 1,
                    }}
                  >
                    💡 {t('Hint')} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>(-15 XP)</span>
                  </button>
                ) : (
                  <div
                    className="anim-fadeup"
                    style={{
                      padding: '1rem',
                      background: 'rgba(245, 200, 66, 0.05)',
                      borderLeft: '2px solid var(--gold)',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      color: 'var(--gold)',
                    }}
                  >
                    {isHintLoading ? (
                      <span className="anim-pulse">{t('Thinking...')}</span>
                    ) : (
                      <>
                        <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>HINT:</span>
                        {t(hintText)}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentPhase.options.map((option) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isChosen={chosenOptionId === option.id}
                    stage={stage}
                    onSelect={selectOption}
                  />
                ))}
              </div>

              {/* Score Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: '8px',
                }}
              >
                {[
                  { label: 'Decision Score', value: `${engine.phaseResults[phaseIndex]?.points || 0}/3` },
                  {
                    label: 'XP Earned',
                    value: `+${engine.phaseResults[phaseIndex]?.xpEarned || 0}`,
                  },
                  { label: 'Combo', value: combo > 0 ? `🔥 ${combo}x` : '—' },
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
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--gold)',
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Narrator Panel */}
              <NarratorPanel narration={narration} isLoading={isNarrationLoading} />

              {/* Advance Button */}
              <button
                onClick={advancePhase}
                disabled={isNarrationLoading}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--gold)',
                  border: 'none',
                  color: 'var(--bg-dark)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: isNarrationLoading ? 'not-allowed' : 'pointer',
                  opacity: isNarrationLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  alignSelf: 'flex-start',
                  marginTop: '1rem',
                }}
                onMouseOver={(e) => {
                  if (!isNarrationLoading && e.target.style) {
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseOut={(e) => {
                  if (e.target.style) {
                    e.target.style.transform = 'scale(1)'
                  }
                }}
                onFocus={(e) => {
                  if (!isNarrationLoading && e.target.style) {
                    e.target.style.transform = 'scale(1.05)'
                  }
                }}
                onBlur={(e) => {
                  if (e.target.style) {
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {currentPhaseNumber === 8 ? t('See Final Results →') : `${t('Advance to Phase')} ${currentPhaseNumber + 1} →`}
              </button>
            </>
          )}

          {/* Timeline Strip (placeholder) */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                height: '4px',
              }}
            >
              {PHASES.map((phase) => {
                const result = engine.phaseResults.find((r) => r.phaseId === phase.id)
                let color = 'var(--text-muted)'
                if (result) {
                  if (result.points === 3) color = 'var(--green)'
                  else if (result.points > 0) color = 'var(--orange)'
                  else color = 'var(--red)'
                }
                return (
                  <div
                    key={phase.id}
                    style={{
                      flex: 1,
                      background: color,
                      borderRadius: '2px',
                      opacity: result ? 1 : 0.2,
                      transition: 'all 0.2s ease',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Overlays */}
      <XPPopup popup={xpPopup} />
      <BadgeNotification badge={newBadgeNotification} />
    </div>
  )
}
