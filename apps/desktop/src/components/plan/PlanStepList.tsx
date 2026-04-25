import type { TaskPlan } from '@agentos/shared-types';

interface PlanStepListProps {
  plan: TaskPlan;
}

export function PlanStepList({ plan }: PlanStepListProps) {
  return (
    <article className="section-card">
      <div className="section-header">
        <div>
          <p className="label">Plan review</p>
          <h3>Ordered plan</h3>
        </div>
        <span className={`status-badge risk-${plan.risk}`}>{plan.risk} risk</span>
      </div>
      <ol className="plan-list">
        {plan.steps.map((step) => (
          <li key={step.id}>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
