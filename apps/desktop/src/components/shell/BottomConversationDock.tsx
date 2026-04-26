import type { UiDisplayProfile, UiPhase } from '@agentos/shared-types';

export interface ConversationMessage {
  id: string;
  author: 'operator' | 'agentos';
  text: string;
}

interface BottomConversationDockProps {
  projectLabel: string;
  taskLabel: string;
  phase: UiPhase;
  profile: UiDisplayProfile;
  value: string;
  placeholder: string;
  messages: ConversationMessage[];
  canRunVerification: boolean;
  isBusy: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onQuickAction: (action: string) => void;
  onRunVerification: () => void;
}

const quickActions = ['Explain', 'Revise plan', 'Narrow scope', 'Show evidence', 'Run verification'];

export function BottomConversationDock({
  projectLabel,
  taskLabel,
  phase,
  profile,
  value,
  placeholder,
  messages,
  canRunVerification,
  isBusy,
  onValueChange,
  onSubmit,
  onQuickAction,
  onRunVerification
}: BottomConversationDockProps) {
  function handleQuickAction(action: string) {
    if (action === 'Run verification') {
      onRunVerification();
      return;
    }

    onQuickAction(action);
  }

  return (
    <section className="conversation-dock" aria-label="Task-aware command dock">
      <div className="conversation-context" aria-label="Current command context">
        <span>Project: {projectLabel}</span>
        <span>Task: {taskLabel}</span>
        <span>Phase: {phase}</span>
        <span>Profile: {profile}</span>
      </div>

      <div className="conversation-body conversation-body-input-only">
        <div className="command-surface">
          <div className="quick-action-row">
            {quickActions.map((action) => (
              <button
                type="button"
                className="chip-button"
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isBusy || (action === 'Run verification' && !canRunVerification)}
              >
                {action}
              </button>
            ))}
          </div>
          <div className="command-input-row">
            <textarea
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              rows={2}
              placeholder={placeholder}
              aria-label="Task-aware command input"
            />
            <button type="button" className="button" onClick={onSubmit} disabled={isBusy || !value.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
