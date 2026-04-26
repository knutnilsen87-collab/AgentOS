import type { GitReviewSummary, TaskRecord } from '@agentos/shared-types';

interface ReviewPackageCardProps {
  task: TaskRecord | null;
  bundlePreview: string;
  gitReview: GitReviewSummary | null;
}

export function ReviewPackageCard({ task, bundlePreview, gitReview }: ReviewPackageCardProps) {
  return (
    <article className="section-card">
      <p className="label">Review package</p>
      <h3>{task ? 'Saved task record' : 'Current preview'}</h3>
      <div className="review-grid">
        <div>
          <p className="label">Approval decision</p>
          <p>{task?.approvalDecision ?? 'pending'}</p>
        </div>
        <div>
          <p className="label">Lifecycle events</p>
          <p>{task?.lifecycle?.length ?? 0} recorded</p>
        </div>
        <div>
          <p className="label">Affected files</p>
          <p>{gitReview?.changedFiles.length ?? task?.reviewPackage.touchedFiles.length ?? 0} detected</p>
        </div>
        <div>
          <p className="label">Command log</p>
          <p>{task?.reviewPackage.commandLog.length ?? 0} commands tracked</p>
        </div>
      </div>
      <div className="changed-files">
        <p className="label">Git review scan</p>
        {gitReview?.changedFiles.length ? (
          <ul>
            {gitReview.changedFiles.slice(0, 12).map((file) => (
              <li key={`${file.rawStatus}-${file.path}`}>
                <span>{file.rawStatus}</span>
                <strong>{file.path}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{gitReview?.error ?? 'No changed files detected by Git review scan.'}</p>
        )}
      </div>
      <div className="changed-files">
        <p className="label">Tracked diff stat</p>
        {gitReview?.diffStat.length ? (
          <pre className="diff-stat">{gitReview.diffStat.join('\n')}</pre>
        ) : (
          <p className="empty-state">{gitReview?.error ?? 'No tracked diff stat yet.'}</p>
        )}
      </div>
      <pre className="bundle-preview">{bundlePreview}</pre>
    </article>
  );
}
