/**
 * Shared Google OAuth2 service for Calendar and Sheets APIs.
 * Uses Google Identity Services (GIS) — free, no billing required.
 */

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ')

let tokenClient = null
let accessToken = null

export function initGoogleAuth() {
  return new Promise((resolve) => {
    if (tokenClient) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            accessToken = response.access_token
          }
        },
      })
      resolve()
    }
    document.head.appendChild(script)
  })
}

export function requestAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error('Auth not initialized')); return }
    tokenClient.callback = (response) => {
      if (response.error) { reject(response); return }
      accessToken = response.access_token
      resolve(accessToken)
    }
    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export function getAccessToken() { return accessToken }

export async function ensureAccessToken() {
  if (accessToken) return accessToken
  return requestAccessToken()
}
