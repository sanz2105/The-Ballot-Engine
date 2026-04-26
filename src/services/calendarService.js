import { useState, useCallback } from 'react'

import { ensureAccessToken, initGoogleAuth } from './googleAuthService'

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
let gapiInited = false

const loadGapi = () => {
  return new Promise((resolve, reject) => {
    if (gapiInited) {
      resolve()
      return
    }

    const gapiScript = document.createElement('script')
    gapiScript.src = 'https://apis.google.com/js/api.js'
    gapiScript.async = true
    gapiScript.defer = true
    gapiScript.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        })
        gapiInited = true
        resolve()
      })
    }
    gapiScript.onerror = reject
    document.head.appendChild(gapiScript)
  })
}

export const exportToGoogleCalendar = async (timelineResults, electionDay) => {
  await Promise.all([loadGapi(), initGoogleAuth()])

  const accessToken = await ensureAccessToken()
  window.gapi.client.setToken({ access_token: accessToken })
  const events = timelineResults.map((res, index) => {
    // Calculate date relative to election day (e.g., 1 phase per day leading up to it)
    const eventDate = new Date(electionDay)
    eventDate.setDate(eventDate.getDate() - (7 - index))

    let colorId = '11' // Red
    if (res.points === 3) colorId = '10' // Green
    else if (res.points > 0) colorId = '5' // Yellow

    return {
      summary: `Verdania Election: ${res.title}`,
      description: `Decision: ${res.decision}\nScore: ${res.points}/3\nXP: ${res.xpEarned}`,
      start: { date: eventDate.toISOString().split('T')[0] },
      end: { date: eventDate.toISOString().split('T')[0] },
      colorId,
    }
  })

  // Sequential creation to avoid rate limits
  for (const event of events) {
    await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })
  }

  return {
    success: true,
    calendarLink: 'https://calendar.google.com/',
  }
}

export const useCalendarExport = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const exportCalendar = useCallback(async (timelineResults, electionDay) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const result = await exportToGoogleCalendar(timelineResults, electionDay)
      setSuccess(true)
      return result
    } catch (err) {
      setError(err.message || 'Failed to export to calendar')
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  return { exportCalendar, loading, error, success }
}
