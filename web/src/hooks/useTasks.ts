import { useCallback, useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks } from '../api/client'
import type { Task } from '../api/types'

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

  async function removeTask(id: string) {
    try {
      await deleteTask(id)
      setTasks((current) => current.filter((task) => task.id !== id))
      setError(null)
    } catch {
      setError('Could not delete the task. Please try again.')
    }
  }

  return { tasks, loading, error, addTask, removeTask }
}
