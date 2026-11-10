import type { Task } from '../api/types'

export type TaskListProps = {
  tasks: Task[]
  loading: boolean
  onDelete: (id: string) => Promise<void>
}

export type TaskFormProps = {
  onCreate: (title: string) => Promise<void>
}

export type HealthBadgeProps = {
  up: boolean | null
}
