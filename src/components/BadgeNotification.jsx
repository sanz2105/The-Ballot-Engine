export default function BadgeNotification({ badge }) {
  if (!badge) return null

  return (
    <div
      className="anim-notif"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        background: 'var(--bg-card)',
        border: '2px solid var(--gold)',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 0 20px rgba(245, 200, 66, 0.3)',
        maxWidth: '320px',
      }}
    >
      {/* Badge Icon */}
      <div
        className="anim-badgepop"
        style={{
          fontSize: '3rem',
          marginBottom: '0.75rem',
        }}
      >
        {badge.icon}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem',
        }}
      >
        BADGE UNLOCKED
      </div>

      {/* Badge Name */}
      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        {badge.name}
      </h3>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {badge.description}
      </p>
    </div>
  )
}
