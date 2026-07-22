/**
 * Shared constants and configuration used across frontend components.
 *
 * Centralizing these prevents duplication and makes them easy to update.
 */

export const STATUS_OPTIONS = ['', 'Open', 'In Progress', 'Closed'] as const

/**
 * Visual configuration for each ticket status.
 * Each entry defines Tailwind classes for the status badge.
 */
export const STATUS_BADGES: Record<string, { bg: string; text: string; dot: string }> = {
  'Open': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Closed': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
}

/**
 * Maximum number of tickets to display before pagination is needed.
 * Currently unused — placeholder for future pagination feature.
 */
export const PAGE_SIZE = 50