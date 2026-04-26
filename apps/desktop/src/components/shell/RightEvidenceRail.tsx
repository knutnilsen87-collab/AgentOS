import type { ApprovalState, GitReviewSummary, ProjectSummary, TaskRecord, VerificationCheck } from '@agentos/shared-types';
import { ApprovalPanel } from '../review/ApprovalPanel';
import { VerificationChecklist } from '../review/VerificationChecklist';

interface RightEvidenceRailProps {
  approvalState: ApprovalState;
  projectSummary: ProjectSummary | null;
  selectedTask: TaskRecord | null;
  checks: VerificationCheck[];
  gitReview: GitReviewSummary | null;
  isBusy: boolean;
  onRefreshGitReview: () => void;
  onApproveReadOnly: () => void;
  onRequestRework: () => void;
}

export function RightEvidenceRail({
  approvalState,
  projectSummary,
  selectedTask,
  checks,
  gitReview,
  isBusy,
  onRefreshGitReview,
  onApproveReadOnly,
  onRequestRework
}: RightEvidenceRailProps) {
  return (
    <aside className="rail right-rail" aria-label="Evidence and approvals">
      <ApprovalPanel
        state={approvalState}
        canAct={Boolean(selectedTask)}
        onApproveReadOnly={onApproveReadOnly}
        onRequestRework={onRequestRework}
      />

      <section className="rail-section">
        <div className="section-header">
          <h2>Evidence</h2>
          <button type="button" className="button button-secondary button-compact" onClick={onRefreshGitReview} disabled={isBusy}>
            Refresh
          </button>
        </div>
        <ul className="evidence-list">
          <li>
            <strong>Scanner</strong>
            <span>{projectSummary ? `${projectSummary.estimatedFileCount} files scanned` : 'Waiting for project scan'}</span>
          </li>
          <li>
            <strong>Manifests</strong>
            <span>{projectSummary ? `${projectSummary.manifests.length} clues` : 'No evidence yet'}</span>
          </li>
          <li>
            <strong>Affected files</strong>
            <span>{gitReview?.changedFiles.length ?? selectedTask?.reviewPackage.touchedFiles.length ?? 0} detected by review scan</span>
          </li>
          <li>
            <strong>Git branch</strong>
            <span>{gitReview?.branch ?? 'not available'}</span>
          </li>
          <li>
            <strong>Working tree</strong>
            <span>{gitReview?.hasUncommittedChanges ? 'changes present' : 'clean or no tracked changes'}</span>
          </li>
          <li>
            <strong>Diff stat</strong>
            <span>{gitReview?.diffStat.length ? `${gitReview.diffStat.length} lines` : gitReview?.error ?? 'no tracked diff stat'}</span>
          </li>
        </ul>
      </section>

      <VerificationChecklist checks={checks} />

      <section className="rail-section">
        <h2>Selected task</h2>
        {selectedTask ? (
          <div className="compact-card">
            <p className="label">Prompt</p>
            <p>{selectedTask.prompt}</p>
            <p className="label">Project root</p>
            <p className="path">{selectedTask.projectRoot}</p>
          </div>
        ) : (
          <p className="empty-state">Generate a plan to populate the review lane.</p>
        )}
      </section>
    </aside>
  );
}
