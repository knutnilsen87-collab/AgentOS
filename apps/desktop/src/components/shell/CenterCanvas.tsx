import type { ReactNode } from 'react';
import type { UiPhase } from '@agentos/shared-types';

interface CenterCanvasProps {
  phase: UiPhase;
  statusMessage: string;
  headline: string;
  children: ReactNode;
}

export function CenterCanvas({ phase, statusMessage, headline, children }: CenterCanvasProps) {
  return (
    <section className="center-canvas" aria-label="Mission workspace">
      <div className="mission-state">
        <div>
          <p className="label">Current mission phase</p>
          <h2>{headline}</h2>
        </div>
        <span className="phase-chip">{phase}</span>
        <p>{statusMessage}</p>
      </div>
      {children}
    </section>
  );
}
