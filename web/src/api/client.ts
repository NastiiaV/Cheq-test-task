import type { Health, Task } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

export function getTasks(): Promise<Task[]> {
  return fetch(`${API_BASE}/tasks`).then((response) => readJson<Task[]>(response))
}

export function createTask(title: string): Promise<Task> {
  return fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }).then((response) => readJson<Task>(response))
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
}

export function getHealth(): Promise<Health> {
  return fetch(`${API_BASE}/health`).then((response) => readJson<Health>(response))
}
