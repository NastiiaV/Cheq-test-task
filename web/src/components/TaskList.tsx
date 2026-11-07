import type { Task } from '../api/client'

type TaskListProps = {
  tasks: Task[]
  loading: boolean
}

export function TaskList({ tasks, loading }: TaskListProps) {
  if (loading) return <p>Loading tasks…</p>
  if (tasks.length === 0) return <p>No tasks yet.</p>

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title}
          <time dateTime={task.createdAt}>
            {new Date(task.createdAt).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  )
}
