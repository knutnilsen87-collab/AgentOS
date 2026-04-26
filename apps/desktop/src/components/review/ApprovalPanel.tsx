import type { ApprovalState } from '@agentos/shared-types';

interface ApprovalPanelProps {
  state: ApprovalState;
  canAct: boolean;
  compact?: boolean;
  onApproveReadOnly: () => void;
  onRequestRework: () => void;
}

export function ApprovalPanel({ state, canAct, compact = false, onApproveReadOnly, onRequestRework }: ApprovalPanelProps) {
  return (
    <section className={`approval-panel risk-border-${state.risk}${compact ? ' approval-panel-compact' : ''}`}>
      <p className="label">Approval</p>
      <h2>{state.mode}</h2>
      {compact ? null : <p>{state.summary}</p>}
      <p className="decision-line">Decision: {state.decision}</p>
      {compact ? null : <div className="approval-actions">
        <button type="button" className="button button-secondary" onClick={onApproveReadOnly} disabled={!canAct}>
          Approve read-only
        </button>
        <button type="button" className="button button-secondary" onClick={onRequestRework} disabled={!canAct}>
          Request rework
        </button>
      </div>}
    </section>
  );
}
