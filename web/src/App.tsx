import { HealthBadge } from './components/HealthBadge'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useHealth } from './hooks/useHealth'
import { useTasks } from './hooks/useTasks'

export default function App() {
  const up = useHealth()
  const { tasks, loading, error, addTask } = useTasks()

  return (
    <main>
      <header>
        <h1>Tasks</h1>
        <HealthBadge up={up} />
      </header>
      <TaskForm onCreate={addTask} />
      {error ? <p role="alert">{error}</p> : <TaskList tasks={tasks} loading={loading} />}
    </main>
  )
}
