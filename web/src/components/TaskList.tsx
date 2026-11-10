import type { TaskListProps } from './types'

export function TaskList({ tasks, loading, onDelete }: TaskListProps) {
  if (loading) return <p>Loading tasks…</p>
  if (tasks.length === 0) return <p>No tasks yet.</p>

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <div>
            {task.title}
            <time dateTime={task.createdAt}>
              {new Date(task.createdAt).toLocaleString()}
            </time>
          </div>
          <button type="button" onClick={() => void onDelete(task.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
