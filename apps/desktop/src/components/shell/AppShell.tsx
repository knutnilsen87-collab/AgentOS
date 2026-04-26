import type { ReactNode } from 'react';
import type { UiDisplayProfile } from '@agentos/shared-types';

interface AppShellProps {
  profile: UiDisplayProfile;
  header: ReactNode;
  leftRail: ReactNode;
  center: ReactNode;
  rightRail: ReactNode;
  conversationDock: ReactNode;
  runtimeDock: ReactNode;
}

export function AppShell({ profile, header, leftRail, center, rightRail, conversationDock, runtimeDock }: AppShellProps) {
  return (
    <div className={`app-shell profile-${profile}`}>
      {header}
      <main className="shell-grid">
        {leftRail}
        {center}
        {rightRail}
      </main>
      {conversationDock}
      {runtimeDock}
    </div>
  );
}
