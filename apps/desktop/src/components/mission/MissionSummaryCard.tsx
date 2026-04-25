import type { TaskPlan } from '@agentos/shared-types';

interface MissionSummaryCardProps {
  plan: TaskPlan;
}

export function MissionSummaryCard({ plan }: MissionSummaryCardProps) {
  return (
    <article className="section-card">
      <p className="label">Mission summary</p>
      <h3>{plan.objective}</h3>
      <p>{plan.nextAction}</p>
    </article>
  );
}
