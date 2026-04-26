import { useCalendarExport } from '../services/calendarService'
import { useSheetsExport } from '../services/sheetsService'

export default function ExportPanel({ gameResults, playerName }) {
  const { exportCalendar, loading: calLoading, error: calError, success: calSuccess } = useCalendarExport()
  const { exportSheet, loading: sheetLoading, error: sheetError, spreadsheetUrl } = useSheetsExport()

  const handleCalendar = async () => {
    // Defaulting to a week from now for election day if not specified
    const electionDay = new Date()
    electionDay.setDate(electionDay.getDate() + 7)
    await exportCalendar(gameResults, electionDay)
  }

  const handleSheets = async () => {
    await exportSheet(gameResults, playerName)
  }

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.85rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-gold)',
    borderRadius: '6px',
    color: 'var(--gold)',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        padding: '2rem',
        background: 'rgba(7, 11, 20, 0.4)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        marginTop: '2rem',
      }}
    >
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
          marginBottom: '1.5rem',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        Export Your Civic Record
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Calendar Button */}
        <div>
          <button
            onClick={handleCalendar}
            disabled={calLoading}
            aria-label="Export to Google Calendar"
            style={{
              ...btnStyle,
              opacity: calLoading ? 0.6 : 1,
            }}
          >
            {calLoading ? <span className="anim-pulse">Creating calendar events…</span> : '📅 Export to Google Calendar'}
          </button>
          
          <div aria-live="polite" style={{ marginTop: '0.5rem', textAlign: 'center', minHeight: '1.2rem' }}>
            {calSuccess && (
              <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>
                ✓ Opened in <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Google Calendar ↗</a>
              </span>
            )}
            {calError && (
              <div style={{ color: 'var(--red)', fontSize: '0.85rem' }}>
                {calError} <button onClick={handleCalendar} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>Retry</button>
              </div>
            )}
          </div>
        </div>

        {/* Sheets Button */}
        <div>
          <button
            onClick={handleSheets}
            disabled={sheetLoading}
            aria-label="Export to Google Sheets"
            style={{
              ...btnStyle,
              opacity: sheetLoading ? 0.6 : 1,
            }}
          >
            {sheetLoading ? <span className="anim-pulse">Building your learning record…</span> : '📊 Export to Google Sheets'}
          </button>

          <div aria-live="polite" style={{ marginTop: '0.5rem', textAlign: 'center', minHeight: '1.2rem' }}>
            {spreadsheetUrl && (
              <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>
                ✓ <a href={spreadsheetUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>View Spreadsheet ↗</a>
              </span>
            )}
            {sheetError && (
              <div style={{ color: 'var(--red)', fontSize: '0.85rem' }}>
                {sheetError} <button onClick={handleSheets} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>Retry</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
