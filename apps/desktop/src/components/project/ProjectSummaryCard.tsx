import type { ProjectSummary } from '@agentos/shared-types';

interface ProjectSummaryCardProps {
  summary: ProjectSummary | null;
  compact?: boolean;
}

export function ProjectSummaryCard({ summary, compact = false }: ProjectSummaryCardProps) {
  if (!summary) {
    return (
      <article className={`section-card empty-card${compact ? ' compact-project-card' : ''}`}>
        <p className="label">Project summary</p>
        <h3>Connect a local project</h3>
        <p>Open a folder to build the first read-only project profile.</p>
      </article>
    );
  }

  return (
    <article className={`section-card${compact ? ' compact-project-card' : ''}`}>
      <p className="label">Project summary</p>
      <h3>{summary.rootPath}</h3>
      <div className="summary-grid">
        <div>
          <span className="metric">{summary.estimatedFileCount}</span>
          <p>files scanned</p>
        </div>
        <div>
          <span className="metric">{summary.manifests.length}</span>
          <p>manifest clues</p>
        </div>
        <div className="full-width">
          <p className="label">Stack signals</p>
          <p>{summary.languages.slice(0, 14).join(', ') || 'No extensions detected yet'}</p>
        </div>
        <div className="full-width">
          <p className="label">Likely entry points</p>
          <p>{summary.topLevelEntries.join(', ') || 'No top-level entries detected yet'}</p>
        </div>
      </div>
    </article>
  );
}
