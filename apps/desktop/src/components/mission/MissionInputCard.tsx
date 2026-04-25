interface MissionInputCardProps {
  prompt: string;
  isBusy: boolean;
  lastSavedPath: string | null;
  onPromptChange: (prompt: string) => void;
  onGeneratePlan: () => void;
}

export function MissionInputCard({ prompt, isBusy, lastSavedPath, onPromptChange, onGeneratePlan }: MissionInputCardProps) {
  return (
    <article className="section-card mission-input-card">
      <div className="section-header">
        <div>
          <p className="label">Mission input</p>
          <h3>What do you want to achieve?</h3>
        </div>
        <button type="button" className="button" onClick={onGeneratePlan} disabled={isBusy || !prompt.trim()}>
          Generate plan
        </button>
      </div>
      <label className="field">
        <span>Objective</span>
        <textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} rows={5} placeholder="Describe the project outcome, not a chat message" />
      </label>
      <div className="micro-copy">
        <span>Suggested: keep the first pass read-only.</span>
        <span>Latest save: {lastSavedPath ?? 'not saved in this session'}</span>
      </div>
    </article>
  );
}
