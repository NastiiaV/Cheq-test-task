import { useCallback, useEffect, useState } from 'react'
import { createTask, getTasks, type Task } from '../api/client'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      const next = await getTasks()
      setTasks(next)
      setError(null)
    } catch {
      setError('Could not load tasks. Check that the API is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  async function addTask(title: string) {
    const created = await createTask(title)
    setTasks((current) => [created, ...current])
    setError(null)
  }

  return { tasks, loading, error, addTask }
}
