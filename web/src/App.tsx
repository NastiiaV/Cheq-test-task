import { HealthBadge } from './components/HealthBadge'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useHealth } from './hooks/useHealth'
import { useTasks } from './hooks/useTasks'

export default function App() {
  const up = useHealth()
  const { tasks, loading, error, addTask, removeTask } = useTasks()

  return (
    <main>
      <header>
        <h1>Tasks</h1>
        <HealthBadge up={up} />
      </header>
      <TaskForm onCreate={addTask} />
      {error ? <p role="alert">{error}</p> : null}
      {error && tasks.length === 0 ? null : (
        <TaskList tasks={tasks} loading={loading} onDelete={removeTask} />
      )}
    </main>
  )
}
