import type { ApprovalMode, TaskRiskLevel, UiDisplayProfile, UiPhase } from '@agentos/shared-types';

interface TopStatusBarProps {
  projectName: string;
  phase: UiPhase;
  approvalMode: ApprovalMode;
  risk: TaskRiskLevel;
  platform: string;
  sandboxStatus: string;
  profile: UiDisplayProfile;
  onToggleProfile: () => void;
}

export function TopStatusBar({
  projectName,
  phase,
  approvalMode,
  risk,
  platform,
  sandboxStatus,
  profile,
  onToggleProfile
}: TopStatusBarProps) {
  return (
    <header className="top-status-bar">
      <div className="brand-lockup">
        <p className="eyebrow">AgentOS</p>
        <h1>{projectName}</h1>
        <p className="lede">Mission-control workspace for local, review-first project work.</p>
      </div>
      <div className="status-cluster" aria-label="Current runtime and approval state">
        <span className="status-badge">Phase: {phase}</span>
        <span className="status-badge">Approval: {approvalMode}</span>
        <span className={`status-badge risk-${risk}`}>Risk: {risk}</span>
        <span className="status-badge">Platform: {platform}</span>
        <span className="status-badge">Sandbox: {sandboxStatus}</span>
        <button type="button" className="button button-secondary" onClick={onToggleProfile}>
          {profile === 'guided' ? 'Advanced' : 'Guided'}
        </button>
      </div>
    </header>
  );
}
