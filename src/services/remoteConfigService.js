/**
 * Firebase Remote Config service.
 * Controls game difficulty and feature flags without redeployment.
 * @module remoteConfigService
 */

import { remoteConfig } from '../lib/firebase.js'
import { fetchAndActivate, getValue } from 'firebase/remote-config'

// Default values (used before first fetch or if fetch fails)
if (remoteConfig) {
  remoteConfig.defaultConfig = {
    hint_xp_cost: 15,
    max_phases: 8,
    combo_multiplier_threshold: 3,
    show_leaderboard: true,
    narrator_enabled: true,
    welcome_message: 'Welcome to The Ballot Engine. Democracy needs you.',
  }
}

/**
 * Fetches and activates the latest Remote Config values.
 * @returns {Promise<boolean>} true if new values were activated
 */
export async function initRemoteConfig() {
  if (!remoteConfig) return false
  try {
    const activated = await fetchAndActivate(remoteConfig)
    return activated
  } catch (error) {
    console.warn('Remote Config fetch failed, using defaults:', error.message)
    return false
  }
}

/**
 * Gets a Remote Config value as the appropriate type.
 * @param {string} key - The config key
 * @returns {string|number|boolean} The config value
 */
export function getConfig(key) {
  if (!remoteConfig) return null
  return getValue(remoteConfig, key)
}

export function getHintXpCost() {
  if (!remoteConfig) return 15
  return getValue(remoteConfig, 'hint_xp_cost').asNumber()
}

export function isNarratorEnabled() {
  if (!remoteConfig) return true
  return getValue(remoteConfig, 'narrator_enabled').asBoolean()
}

export function getWelcomeMessage() {
  if (!remoteConfig) return 'Welcome to The Ballot Engine. Democracy needs you.'
  return getValue(remoteConfig, 'welcome_message').asString()
}
