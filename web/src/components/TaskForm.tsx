import { useState, type SubmitEvent } from 'react'
import type { TaskFormProps } from './types'

export function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title is required.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onCreate(trimmed)
      setTitle('')
    } catch {
      setError('Could not add the task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <label>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={submitting}
        />
      </label>
      <button type="submit" disabled={submitting}>
        Add task
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  )
}
