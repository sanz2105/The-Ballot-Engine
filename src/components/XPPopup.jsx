export default function XPPopup({ popup }) {
  if (!popup) return null

  const getColor = () => {
    if (popup.isCorrect) return 'var(--green)'
    if (popup.earned > 0) return 'var(--orange)'
    return 'var(--red)'
  }

  return (
    <div
      className="anim-floatup"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        pointerEvents: 'none',
      }}
    >
      {/* XP Number */}
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '3rem',
          fontWeight: 700,
          color: getColor(),
          textAlign: 'center',
          marginBottom: '0.5rem',
          lineHeight: 1,
        }}
      >
        +{popup.earned}
      </div>

      {/* Labels */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
        }}
      >
        {popup.isCorrect && <span>✓ CORRECT</span>}
        {popup.isFast && <span>⚡ SPEED BONUS</span>}
        {popup.combo >= 2 && <span>🔥 {popup.combo}x COMBO</span>}
      </div>
    </div>
  )
}
