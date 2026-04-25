import type { ProjectSummary } from '@agentos/shared-types';

interface ScannerFindingsListProps {
  summary: ProjectSummary | null;
}

export function ScannerFindingsList({ summary }: ScannerFindingsListProps) {
  const findings = summary
    ? [
        `${summary.manifests.length} manifest files found`,
        `${summary.languages.length} extension groups detected`,
        'Read-only scanner mode preserved'
      ]
    : ['No scanner evidence yet', 'Open a local folder to begin', 'Project profiling stays read-only'];

  return (
    <article className="section-card">
      <p className="label">Scanner findings</p>
      <ul className="detail-list">
        {findings.map((finding) => (
          <li key={finding}>{finding}</li>
        ))}
      </ul>
    </article>
  );
}
