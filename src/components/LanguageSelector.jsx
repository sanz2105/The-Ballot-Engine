import { useTranslation } from '../context/TranslationContext'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
  { code: 'ar', label: 'AR' },
]

export default function LanguageSelector() {
  const { language = 'en', setLanguage = () => {}, isTranslating = false } = useTranslation()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {isTranslating && (
        <span 
          className="anim-pulse" 
          style={{ fontSize: '0.75rem', color: 'var(--gold)', fontStyle: 'italic' }}
        >
          Translating...
        </span>
      )}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select Language"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          padding: '0.35rem 0.5rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
