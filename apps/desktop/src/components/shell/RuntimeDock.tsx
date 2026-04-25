interface RuntimeDockProps {
  nodeVersion?: string;
  electronVersion?: string;
  chromeVersion?: string;
  dataDir?: string;
  currentTaskState: string;
  nextAction: string;
  canRunVerification: boolean;
  isBusy: boolean;
  onRunVerification: () => void;
}

export function RuntimeDock({
  nodeVersion,
  electronVersion,
  chromeVersion,
  dataDir,
  currentTaskState,
  nextAction,
  canRunVerification,
  isBusy,
  onRunVerification
}: RuntimeDockProps) {
  return (
    <footer className="runtime-dock" aria-label="Runtime telemetry">
      <div>
        <span className="label">Runtime</span>
        <strong>Node {nodeVersion ?? 'n/a'}</strong>
      </div>
      <div>
        <span className="label">Shell</span>
        <strong>Electron {electronVersion ?? 'n/a'} / Chrome {chromeVersion ?? 'n/a'}</strong>
      </div>
      <div>
        <span className="label">Task</span>
        <strong>{currentTaskState}</strong>
      </div>
      <div className="dock-wide">
        <span className="label">Next action</span>
        <strong>{nextAction}</strong>
      </div>
      <div className="dock-wide">
        <span className="label">Data</span>
        <strong>{dataDir ?? 'n/a'}</strong>
      </div>
      <div>
        <span className="label">MVP action</span>
        <button type="button" className="button" disabled={!canRunVerification || isBusy} onClick={onRunVerification}>
          Run verification
        </button>
      </div>
    </footer>
  );
}
