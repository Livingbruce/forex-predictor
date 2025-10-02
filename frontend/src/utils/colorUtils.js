/**
 * Safe Color Utility
 * Prevents crashes when calling .toLowerCase() on non-string values
 */

/**
 * Safely maps a string value to a color using a provided mapping
 * @param {any} value - The value to map (can be string, object, or undefined)
 * @param {Object} colorMap - Object mapping lowercase strings to colors
 * @param {string} fallback - Default color if value is invalid or not found
 * @returns {string} The mapped color or fallback
 */
export const safeColor = (value, colorMap, fallback = '#8c8c8c') => {
  let str = value

  // If value is an object with common property names, extract the string
  if (typeof value === 'object' && value !== null) {
    str = value.type || value.level || value.name || value.action || value.status || value.value
  }

  // If value is undefined, null, or still not a string after extraction
  if (typeof str !== 'string') {
    // Only warn for truly unexpected values, not undefined during loading
    if (str !== undefined) {
      console.warn('Unexpected value in safeColor:', value, 'Expected string, got:', typeof str)
    }
    return fallback
  }
  
  const lowerValue = str.toLowerCase()
  return colorMap[lowerValue] || fallback
}

/**
 * Signal color mapping
 */
export const SIGNAL_COLORS = {
  buy: '#52c41a',   // Green
  sell: '#ff4d4f',  // Red
  hold: '#faad14'   // Orange
}

/**
 * Volatility color mapping
 */
export const VOLATILITY_COLORS = {
  high: '#ff4d4f',    // Red
  medium: '#faad14',  // Orange
  low: '#52c41a'      // Green
}

/**
 * Session color mapping
 */
export const SESSION_COLORS = {
  london: '#1890ff',     // Blue
  'new york': '#52c41a', // Green
  tokyo: '#faad14',      // Orange
  sydney: '#722ed1'      // Purple
}

/**
 * Convenience functions for common use cases
 */
export const getSignalColor = (signal) => safeColor(signal, SIGNAL_COLORS)
export const getVolatilityColor = (volatility) => safeColor(volatility, VOLATILITY_COLORS)
export const getSessionColor = (session) => safeColor(session, SESSION_COLORS)

export default {
  safeColor,
  getSignalColor,
  getVolatilityColor,
  getSessionColor,
  SIGNAL_COLORS,
  VOLATILITY_COLORS,
  SESSION_COLORS
}
