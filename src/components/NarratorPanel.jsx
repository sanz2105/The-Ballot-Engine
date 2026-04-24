export default function NarratorPanel({ narration, isLoading }) {
  return (
    <div
      role="status"
      style={{
        background: 'var(--bg-card)',
        borderRadius: '8px',
        padding: '1.5rem',
        borderTop: '2px solid',
        borderImage: 'linear-gradient(90deg, #6366F1, #8B5CF6) 1',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        {/* Robot Icon Circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        >
          🤖
        </div>

        {/* Label */}
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
          }}
        >
          Gemini AI — Verdania Report
        </span>

        {/* Loading Indicator */}
        {isLoading && (
          <span
            className="anim-tick"
            style={{
              marginLeft: 'auto',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontStyle: 'italic',
            }}
          >
            Analysing…
          </span>
        )}
      </div>

      {/* Narration Text */}
      <p
        aria-live="polite"
        aria-atomic="true"
        style={{
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          opacity: isLoading ? 0.35 : 1,
          transition: 'opacity 0.3s ease',
          margin: 0,
        }}
      >
        {narration}
      </p>
    </div>
  )
}
