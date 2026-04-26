import type { LifecycleEvent, TaskRecord, UiPhase, VerificationCheck } from '@agentos/shared-types';
import type { Mission as KernelMission } from '@agentos/mission-kernel';
import type { ConversationMessage } from './BottomConversationDock';

interface ActiveWorkPanelProps {
  phase: UiPhase;
  isBusy: boolean;
  statusMessage: string;
  selectedTask: TaskRecord | null;
  kernelMission: KernelMission | null;
  messages: ConversationMessage[];
  checks: VerificationCheck[];
}

function formatEvent(event: LifecycleEvent) {
  return `${event.kind}: ${event.message}`;
}

export function ActiveWorkPanel({
  phase,
  isBusy,
  statusMessage,
  selectedTask,
  kernelMission,
  messages,
  checks
}: ActiveWorkPanelProps) {
  const lifecycle = selectedTask?.lifecycle ?? [];
  const commandLog = selectedTask?.reviewPackage.commandLog ?? [];
  const visibleChecks = checks.slice(0, 4);

  return (
    <article className="section-card active-work-panel">
      <div className="section-header">
        <div>
          <p className="label">Active work</p>
          <h2>{isBusy ? 'Jobber nå' : selectedTask ? 'Task workspace' : 'Klar for operatørinput'}</h2>
        </div>
        <span className={`status-badge active-work-state ${isBusy ? 'is-live' : ''}`}>{isBusy ? 'live' : phase}</span>
      </div>

      <div className="active-work-grid">
        <section className="active-thread" aria-label="Active task conversation">
          <div className="active-thread-header">
            <span>Aktiv chat</span>
            <span>{messages.length} meldinger</span>
          </div>
          <div className="active-thread-list">
            {messages.map((message) => (
              <p className={`active-message active-message-${message.author}`} key={message.id}>
                <strong>{message.author === 'operator' ? 'You' : 'AgentOS'}</strong>
                <span>{message.text}</span>
              </p>
            ))}
          </div>
        </section>

        <section className="active-job" aria-label="Active job status">
          <div>
            <p className="label">Status nå</p>
            <p>{statusMessage}</p>
          </div>
          <div>
            <p className="label">Mission kernel</p>
            <p>{kernelMission ? `${kernelMission.phase} / ${kernelMission.state}` : 'No kernel mission yet'}</p>
          </div>
          <div>
            <p className="label">Task</p>
            <p>{selectedTask ? selectedTask.summary ?? selectedTask.prompt : 'Draft mission'}</p>
          </div>
        </section>
      </div>

      <div className="active-work-bottom">
        <section>
          <p className="label">Livsløp</p>
          {lifecycle.length ? (
            <ul className="active-mini-list">
              {lifecycle.slice(-4).map((event) => (
                <li key={event.id}>{formatEvent(event)}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Ingen lifecycle-events ennå.</p>
          )}
        </section>

        <section>
          <p className="label">Verification</p>
          <ul className="active-mini-list">
            {visibleChecks.map((check) => (
              <li key={check.id}>
                <span className={`check-${check.status}`}>{check.status}</span> {check.label}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="label">Command evidence</p>
          {commandLog.length ? <p>{commandLog[commandLog.length - 1]}</p> : <p className="empty-state">Ingen command output ennå.</p>}
        </section>
      </div>
    </article>
  );
}
