import type { HealthBadgeProps } from './types'

export function HealthBadge({ up }: HealthBadgeProps) {
  const label = up === null ? 'Checking API' : up ? 'API up' : 'API down'
  const status = up === null ? 'unknown' : up ? 'up' : 'down'

  return <p className={`badge ${status}`}>{label}</p>
}
