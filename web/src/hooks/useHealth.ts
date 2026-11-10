import { useEffect, useState } from 'react'
import { getHealth } from '../api/client'

export function useHealth() {
  const [up, setUp] = useState<boolean | null>(null)

  useEffect(() => {
    let ignore = false

    async function check() {
      try {
        const health = await getHealth()
        if (!ignore) setUp(health.status === 'ok')
      } catch {
        if (!ignore) setUp(false)
      }
    }

    void check()
    const timer = window.setInterval(() => void check(), 60_000)
    return () => {
      ignore = true
      window.clearInterval(timer)
    }
  }, [])

  return up
}
