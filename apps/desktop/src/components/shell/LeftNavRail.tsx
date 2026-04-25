import type { TaskRecord } from '@agentos/shared-types';

interface LeftNavRailProps {
  selectedProject: string;
  recentTasks: TaskRecord[];
  selectedTaskId: string | null;
  isBusy: boolean;
  sandboxReady: boolean;
  onStartSandbox: () => void;
  onSelectProject: () => void;
  onSelectTask: (taskId: string) => void;
}

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp));
}

export function LeftNavRail({
  selectedProject,
  recentTasks,
  selectedTaskId,
  isBusy,
  sandboxReady,
  onStartSandbox,
  onSelectProject,
  onSelectTask
}: LeftNavRailProps) {
  return (
    <aside className="rail left-rail" aria-label="Projects and recent tasks">
      <section className="rail-section">
        <div className="section-header">
          <h2>Projects</h2>
          <button type="button" className="button button-secondary" onClick={onSelectProject} disabled={isBusy || !sandboxReady}>
            Open
          </button>
        </div>
        <div className="project-tile">
          <p className="label">Active root</p>
          <p className="path">{selectedProject || 'No project selected'}</p>
        </div>
      </section>

      <section className="rail-section">
        <h2>Recent tasks</h2>
        <ul className="stack-list">
          {recentTasks.length > 0 ? (
            recentTasks.slice(0, 6).map((task) => (
              <li key={task.id}>
                <button type="button" className={`list-button${task.id === selectedTaskId ? ' active' : ''}`} onClick={() => onSelectTask(task.id)}>
                  <strong>{task.prompt}</strong>
                  <span>{task.summary ?? task.status}</span>
                  <small>{formatTimestamp(task.updatedAt)}</small>
                </button>
              </li>
            ))
          ) : (
            <li className="empty-state">No saved task runs yet.</li>
          )}
        </ul>
      </section>

      <section className="rail-section">
        <h2>Quick actions</h2>
        <div className="quick-actions">
          <button type="button" className="button button-secondary" onClick={sandboxReady ? onSelectProject : onStartSandbox} disabled={isBusy}>
            {sandboxReady ? 'Connect local project' : 'Start sandbox'}
          </button>
          <button type="button" className="button button-secondary" disabled>
            Open existing task
          </button>
          <button type="button" className="button button-secondary" disabled>
            Run health check
          </button>
        </div>
      </section>
    </aside>
  );
}
