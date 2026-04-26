import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../context/TranslationContext'

export default function IntroScreen({ onStart, user, onSignIn, onSignOut }) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-dark)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <LanguageSelector />
      </div>

      {/* Radial glow background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 50% -10%, rgba(245,200,66,0.1), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Scanline texture overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.15em',
            marginBottom: '2rem',
            textTransform: 'uppercase',
          }}
        >
          {t('Anthro Challenge · Election Education')}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(3rem, 10vw, 5.5rem)',
            fontWeight: 700,
            color: 'var(--gold)',
            margin: '0 0 1.5rem 0',
            textShadow: '0 0 30px rgba(245, 200, 66, 0.3)',
            lineHeight: 1.1,
          }}
        >
          {t('THE BALLOT ENGINE')}
        </h1>

        {/* Divider */}
        <div
          style={{
            width: '60px',
            height: '2px',
            background: 'var(--gold)',
            margin: '2rem auto',
          }}
        />

        {/* Intro copy */}
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}
        >
          {t("You are Verdania's newly appointed Chief Election Commissioner. Eight high-stakes rulings stand between chaos and democracy.")}
        </p>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: t('Phases'), value: '8' },
            { label: t('Max Points'), value: '24' },
            { label: t('Badges'), value: '8' },
            { label: t('Ranks'), value: '6' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--gold)',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.05em',
                  marginTop: '0.25rem',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Auth section */}
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              justifyContent: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(245, 200, 66, 0.05)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                }}
              />
            )}
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Signed in
              </div>
            </div>
            <button
              onClick={onSignOut}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
              }}
            onMouseOver={(e) => {
              if (e.target.style) {
                e.target.style.borderColor = 'var(--gold)'
                e.target.style.background = 'rgba(245, 200, 66, 0.06)'
              }
            }}
            onMouseOut={(e) => {
              if (e.target.style) {
                e.target.style.borderColor = 'var(--border-subtle)'
                e.target.style.background = 'var(--bg-card)'
              }
            }}
            onFocus={(e) => {
              if (e.target.style) {
                e.target.style.borderColor = 'var(--gold)'
                e.target.style.background = 'rgba(245, 200, 66, 0.06)'
              }
            }}
            onBlur={(e) => {
              if (e.target.style) {
                e.target.style.borderColor = 'var(--border-subtle)'
                e.target.style.background = 'var(--bg-card)'
              }
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={onSignIn}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(245, 200, 66, 0.15)',
            border: '1px solid var(--border-gold)',
            color: 'var(--text-primary)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginBottom: '2rem',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            if (e.target.style) e.target.style.background = 'rgba(245, 200, 66, 0.25)'
          }}
          onMouseOut={(e) => {
            if (e.target.style) e.target.style.background = 'rgba(245, 200, 66, 0.15)'
          }}
          onFocus={(e) => {
            if (e.target.style) e.target.style.background = 'rgba(245, 200, 66, 0.25)'
          }}
          onBlur={(e) => {
            if (e.target.style) e.target.style.background = 'rgba(245, 200, 66, 0.15)'
          }}
        >
          Sign in with Google
        </button>
      )}

      {/* CTA Button */}
      <button
        onClick={onStart}
        style={{
          padding: '1rem 2rem',
          background: 'var(--gold)',
          border: 'none',
          color: 'var(--bg-dark)',
          borderRadius: '6px',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 20px rgba(245, 200, 66, 0.2)',
        }}
        onMouseOver={(e) => {
          if (e.target.style) {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 0 40px rgba(245, 200, 66, 0.4)'
          }
        }}
        onMouseOut={(e) => {
          if (e.target.style) {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 0 20px rgba(245, 200, 66, 0.2)'
          }
        }}
        onFocus={(e) => {
          if (e.target.style) {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 0 40px rgba(245, 200, 66, 0.4)'
          }
        }}
        onBlur={(e) => {
          if (e.target.style) {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 0 20px rgba(245, 200, 66, 0.2)'
          }
        }}
        >
          {t('Begin Election')} →
        </button>

        {/* Footer */}
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '3rem',
          }}
        >
          Powered by Gemini AI · Every decision gets personalised analysis
        </p>
      </div>
    </div>
  )
}
