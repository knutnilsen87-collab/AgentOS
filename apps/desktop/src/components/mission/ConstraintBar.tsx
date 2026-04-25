import type { ApprovalMode } from '@agentos/shared-types';

interface ConstraintBarProps {
  approvalMode: ApprovalMode;
  scope: string;
  allowedTools: string[];
  roles: string[];
}

export function ConstraintBar({ approvalMode, scope, allowedTools, roles }: ConstraintBarProps) {
  return (
    <div className="constraint-bar" aria-label="Mission constraints">
      <div>
        <span className="label">Scope</span>
        <strong>{scope}</strong>
      </div>
      <div>
        <span className="label">Approval</span>
        <strong>{approvalMode}</strong>
      </div>
      <div>
        <span className="label">Allowed tools</span>
        <strong>{allowedTools.join(', ')}</strong>
      </div>
      <div>
        <span className="label">Roles</span>
        <strong>{roles.join(', ')}</strong>
      </div>
    </div>
  );
}
