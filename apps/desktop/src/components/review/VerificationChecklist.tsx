import type { VerificationCheck } from '@agentos/shared-types';

interface VerificationChecklistProps {
  checks: VerificationCheck[];
  compact?: boolean;
}

export function VerificationChecklist({ checks, compact = false }: VerificationChecklistProps) {
  const visibleChecks = compact ? checks.slice(0, 2) : checks;

  return (
    <section className="rail-section">
      <h2>Verification</h2>
      <ul className="check-list">
        {visibleChecks.map((check) => (
          <li key={check.id}>
            <span className={`check-status check-${check.status}`}>{check.status}</span>
            <div>
              <strong>{check.label}</strong>
              <p>{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
