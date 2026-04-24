export default function XPBar({ xp, currentLevel, nextLevel, xpPercent, combo }) {
  return (
    <header
      className="xp-bar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(245, 200, 66, 0.1)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
      }}
    >
      {/* Left: Title */}
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        THE BALLOT ENGINE
      </div>

      {/* Center: Level + XP Progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '0.5rem',
          }}
        >
          <span
            style={{
              color: currentLevel.color,
              fontWeight: 600,
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
            }}
          >
            {currentLevel.title}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {xp} / {nextLevel?.minXP || xp} XP
          </span>
        </div>

        {/* Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={xp}
          aria-valuemin={currentLevel.minXP}
          aria-valuemax={nextLevel?.minXP || xp}
          aria-label={`XP progress: ${xp} of ${nextLevel?.minXP || xp}`}
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${xpPercent}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${currentLevel.color}, var(--gold))`,
              transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              borderRadius: '3px',
            }}
          />
        </div>
      </div>

      {/* Right: Combo Badge */}
      {combo > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--red)',
            fontWeight: 600,
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
          }}
        >
          <span>🔥</span>
          <span>{combo}x</span>
        </div>
      )}
    </header>
  )
}
