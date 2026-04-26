import { useEffect, useState } from 'react';
import { getDefaultApprovalMode, requiresExplicitReview } from '@agentos/policy-engine';
import { renderTaskRunBundle } from '@agentos/status-bundle';
import { buildPhaseOnePlan, summarizeTaskRun } from '@agentos/task-engine';
import type {
  ApprovalMode,
  ApprovalState,
  ApprovalDecision,
  CommandResult,
  GitReviewSummary,
  LifecycleEventKind,
  ProjectSummary,
  TaskPlan,
  TaskRecord,
  TaskRunSummary,
  UiDisplayProfile,
  UiPhase,
  VerificationCheck
} from '@agentos/shared-types';
import { ConstraintBar } from './components/mission/ConstraintBar';
import { MissionInputCard } from './components/mission/MissionInputCard';
import { MissionSummaryCard } from './components/mission/MissionSummaryCard';
import { PlanStepList } from './components/plan/PlanStepList';
import { ProjectSummaryCard } from './components/project/ProjectSummaryCard';
import { ScannerFindingsList } from './components/project/ScannerFindingsList';
import { ReviewPackageCard } from './components/review/ReviewPackageCard';
import { AppShell } from './components/shell/AppShell';
import { CenterCanvas } from './components/shell/CenterCanvas';
import { LeftNavRail } from './components/shell/LeftNavRail';
import { RightEvidenceRail } from './components/shell/RightEvidenceRail';
import { RuntimeDock } from './components/shell/RuntimeDock';
import { TopStatusBar } from './components/shell/TopStatusBar';

declare global {
  interface Window {
    agentos?: {
      platform: string;
      bridge: string;
      repoRoot: string | null;
      dataDir: string | null;
      versions: {
        node: string;
        electron: string;
        chrome: string;
      };
      initializeSandbox: () => Promise<{
        status: 'ready';
        repoRoot: string;
        dataDir: string;
        directories: string[];
        startedAt: string;
      }>;
      openProjectFolder: () => Promise<string | null>;
      scanProject: (rootPath: string) => Promise<ProjectSummary>;
      listTaskRecords: () => Promise<TaskRecord[]>;
      saveTaskRecord: (record: TaskRecord) => Promise<string>;
      updateTaskRecord: (record: TaskRecord) => Promise<string>;
      getGitReviewSummary: () => Promise<GitReviewSummary>;
      runMvpVerification: () => Promise<CommandResult>;
    };
  }
}

const defaultPrompt = 'Open a local project, scan it read-only, and create a reviewable task plan.';
type SandboxStatus = 'not-started' | 'starting' | 'ready' | 'failed';

function createTaskRecord(
  prompt: string,
  approvalMode: ApprovalMode,
  plan: TaskPlan,
  projectRoot: string,
  projectSummary?: ProjectSummary
): TaskRecord {
  const runSummary = summarizeTaskRun(plan, projectSummary);
  const statusBundle = renderTaskRunBundle('AgentOS', 'Phase-1 desktop shell vertical slice', runSummary);
  const now = new Date().toISOString();

  return {
    id: `task-${Date.now()}`,
    prompt,
    status: 'planned',
    approvalMode,
    risk: plan.risk,
    projectRoot,
    createdAt: now,
    updatedAt: now,
    summary: runSummary.statusHeadline,
    approvalDecision: 'pending',
    lifecycle: [
      {
        id: `event-${Date.now()}-created`,
        kind: 'created',
        at: now,
        message: 'Task record created from mission input.'
      },
      {
        id: `event-${Date.now()}-planned`,
        kind: 'planned',
        at: now,
        message: 'Reviewable phase-one plan generated.'
      }
    ],
    verificationChecks: [
      {
        id: 'project-scan',
        label: 'Project scan',
        status: projectSummary ? 'pass' : 'pending',
        detail: projectSummary ? `${projectSummary.estimatedFileCount} files scanned read-only.` : 'Project scan is not available yet.'
      },
      {
        id: 'approval-decision',
        label: 'Approval decision',
        status: 'pending',
        detail: 'Waiting for operator approval or rework request.'
      },
      {
        id: 'mvp-verification',
        label: 'MVP verification',
        status: 'pending',
        detail: 'Run the constrained smoke verification from the runtime dock.'
      }
    ],
    plan,
    projectSummary,
    runSummary,
    reviewPackage: {
      statusBundle,
      touchedFiles: [],
      commandLog: [],
      notes: [
        'Project scanning is read-only in this slice.',
        'Task plan was generated locally from shared package logic.',
        'Diffs and command execution remain explicit next-phase work.'
      ]
    }
  };
}

function derivePhase(projectSummary: ProjectSummary | null, recentTasks: TaskRecord[], selectedTask: TaskRecord | null): UiPhase {
  if (selectedTask) return 'review';
  if (recentTasks.length > 0) return 'verification';
  if (projectSummary) return 'missionCompose';
  return 'onboarding';
}

function createVerificationChecks(projectSummary: ProjectSummary | null, selectedTask: TaskRecord | null): VerificationCheck[] {
  if (selectedTask?.verificationChecks?.length) {
    return selectedTask.verificationChecks;
  }

  return [
    {
      id: 'project-scan',
      label: 'Project scan',
      status: projectSummary ? 'pass' : 'pending',
      detail: projectSummary ? `${projectSummary.estimatedFileCount} files scanned read-only.` : 'Select a local project to scan.'
    },
    {
      id: 'task-record',
      label: 'Task record',
      status: selectedTask ? 'pass' : 'pending',
      detail: selectedTask ? `Saved as ${selectedTask.id}.` : 'Generate a plan to persist a task record.'
    },
    {
      id: 'mvp-verification',
      label: 'MVP verification',
      status: 'pending',
      detail: 'Run the constrained smoke verification from the runtime dock.'
    }
  ];
}

function createLifecycleEvent(kind: LifecycleEventKind, message: string) {
  return {
    id: `event-${Date.now()}-${kind}`,
    kind,
    at: new Date().toISOString(),
    message
  };
}

export function App() {
  const approvalMode = getDefaultApprovalMode();
  const [profile, setProfile] = useState<UiDisplayProfile>('guided');
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [selectedProject, setSelectedProject] = useState('');
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>('not-started');
  const [sandboxMessage, setSandboxMessage] = useState('Sandbox has not started yet.');
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const [plan, setPlan] = useState<TaskPlan>(() => buildPhaseOnePlan(defaultPrompt, approvalMode));
  const [runSummary, setRunSummary] = useState<TaskRunSummary>(() => summarizeTaskRun(buildPhaseOnePlan(defaultPrompt, approvalMode)));
  const [recentTasks, setRecentTasks] = useState<TaskRecord[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null);
  const [gitReview, setGitReview] = useState<GitReviewSummary | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to scan a project and stage the first task plan.');
  const [isBusy, setIsBusy] = useState(false);

  const selectedTask = recentTasks.find((task) => task.id === selectedTaskId) ?? null;
  const phase = derivePhase(projectSummary, recentTasks, selectedTask);
  const requiresReview = requiresExplicitReview(approvalMode);
  const bundlePreview = selectedTask?.reviewPackage.statusBundle ?? renderTaskRunBundle('AgentOS', 'Phase-1 desktop shell vertical slice', runSummary);
  const approvalState: ApprovalState = {
    mode: approvalMode,
    risk: plan.risk,
    requiresReview,
    summary: requiresReview ? 'Plans stay review-first before permanent edits.' : 'Routine work can continue with lighter checks.',
    decision: selectedTask?.approvalDecision ?? 'pending'
  };
  const checks = createVerificationChecks(projectSummary, selectedTask);

  useEffect(() => {
    void hydrateInitialState();
  }, []);

  async function hydrateInitialState() {
    await handleStartSandbox(false);

    if (!window.agentos?.listTaskRecords) return;

    try {
      const tasks = await window.agentos.listTaskRecords();
      setRecentTasks(tasks);
      setSelectedTaskId(tasks[0]?.id ?? null);
    } catch {
      setStatusMessage('Could not load saved task history yet.');
    }

    await refreshGitReview();
  }

  async function handleStartSandbox(announce = true): Promise<boolean> {
    if (!window.agentos?.initializeSandbox) {
      setSandboxStatus('failed');
      setSandboxMessage('Electron preload bridge is not available. Restart the desktop app.');
      setStatusMessage('Sandbox could not start because the desktop bridge is unavailable.');
      return false;
    }

    setSandboxStatus('starting');
    if (announce) {
      setStatusMessage('Starting local sandbox before project connection...');
    }

    try {
      const sandbox = await window.agentos.initializeSandbox();
      setSandboxStatus('ready');
      setSandboxMessage(`Ready at ${sandbox.dataDir}`);
      setStatusMessage('Local sandbox is ready. Connect a project when you are ready.');
      return true;
    } catch {
      setSandboxStatus('failed');
      setSandboxMessage('Sandbox startup failed.');
      setStatusMessage('Sandbox startup failed. Project connection is blocked until it is ready.');
      return false;
    }
  }

  async function refreshGitReview() {
    if (!window.agentos?.getGitReviewSummary) return;

    try {
      const summary = await window.agentos.getGitReviewSummary();
      setGitReview(summary);
    } catch {
      setGitReview({
        isRepository: false,
        branch: null,
        changedFiles: [],
        hasUncommittedChanges: false,
        diffStat: [],
        error: 'Could not read Git review state.'
      });
    }
  }

  async function handleSelectProject() {
    if (!window.agentos?.openProjectFolder) return;
    if (sandboxStatus !== 'ready') {
      const started = await handleStartSandbox(true);
      if (!started) return;
    }

    const rootPath = await window.agentos.openProjectFolder();
    if (!rootPath) return;

    await handleScan(rootPath, true);
  }

  async function handleScan(rootPath: string, announce = true) {
    if (!window.agentos?.scanProject) return;

    setIsBusy(true);
    if (announce) {
      setStatusMessage('Scanning project structure and manifest clues...');
    }

    try {
      const summary = await window.agentos.scanProject(rootPath);
      const nextPlan = buildPhaseOnePlan(prompt, approvalMode, summary);
      const nextRunSummary = summarizeTaskRun(nextPlan, summary);

      setSelectedProject(rootPath);
      setProjectSummary(summary);
      setPlan(nextPlan);
      setRunSummary(nextRunSummary);
      setStatusMessage(`Project summary updated for ${rootPath}.`);
    } catch {
      setStatusMessage('Project scan failed. Check that the folder is accessible.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleGeneratePlan() {
    const nextPlan = buildPhaseOnePlan(prompt, approvalMode, projectSummary ?? undefined);
    const nextRunSummary = summarizeTaskRun(nextPlan, projectSummary ?? undefined);
    const record = createTaskRecord(
      prompt,
      approvalMode,
      nextPlan,
      selectedProject || window.agentos?.repoRoot || '',
      projectSummary ?? undefined
    );

    setPlan(nextPlan);
    setRunSummary(nextRunSummary);
    setStatusMessage('Plan refreshed. Saving task record locally...');
    setIsBusy(true);

    try {
      const savedPath = await window.agentos?.saveTaskRecord(record);
      const tasks = (await window.agentos?.listTaskRecords()) ?? [];
      setRecentTasks(tasks);
      setSelectedTaskId(record.id);
      setLastSavedPath(savedPath ?? null);
      await refreshGitReview();
      setStatusMessage('Plan generated and task record saved to .agentos/tasks.');
    } catch {
      setStatusMessage('Plan generated, but saving the task record failed.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleApprovalDecision(decision: ApprovalDecision) {
    if (!selectedTask || !window.agentos?.updateTaskRecord) return;

    const isApproved = decision === 'approved-read-only';
    const now = new Date().toISOString();
    const nextRecord: TaskRecord = {
      ...selectedTask,
      status: isApproved ? 'needs-review' : 'planned',
      approvalDecision: decision,
      updatedAt: now,
      lifecycle: [
        ...(selectedTask.lifecycle ?? []),
        createLifecycleEvent(
          isApproved ? 'approved' : 'rework-requested',
          isApproved ? 'Operator approved read-only continuation.' : 'Operator requested plan rework before continuation.'
        )
      ],
      verificationChecks: [
        {
          id: 'project-scan',
          label: 'Project scan',
          status: selectedTask.projectSummary ? 'pass' : 'pending',
          detail: selectedTask.projectSummary
            ? `${selectedTask.projectSummary.estimatedFileCount} files scanned read-only.`
            : 'Project scan is not available yet.'
        },
        {
          id: 'approval-decision',
          label: 'Approval decision',
          status: isApproved ? 'pass' : 'pending',
          detail: isApproved ? 'Read-only continuation approved.' : 'Plan rework requested before continuation.'
        },
        {
          id: 'mvp-verification',
          label: 'MVP verification',
          status: 'pending',
          detail: 'Run the constrained smoke verification from the runtime dock.'
        }
      ]
    };

    setIsBusy(true);
    setStatusMessage(isApproved ? 'Persisting read-only approval decision...' : 'Persisting rework request...');

    try {
      await window.agentos.updateTaskRecord(nextRecord);
      const tasks = await window.agentos.listTaskRecords();
      setRecentTasks(tasks);
      setSelectedTaskId(nextRecord.id);
      await refreshGitReview();
      setStatusMessage(isApproved ? 'Read-only approval saved to task history.' : 'Rework request saved to task history.');
    } catch {
      setStatusMessage('Could not persist the approval decision.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRunVerification() {
    if (!selectedTask || !window.agentos?.runMvpVerification || !window.agentos.updateTaskRecord) return;

    setIsBusy(true);
    setStatusMessage('Running constrained MVP verification...');

    try {
      const result = await window.agentos.runMvpVerification();
      const passed = result.exitCode === 0;
      const nextRecord: TaskRecord = {
        ...selectedTask,
        status: passed ? 'done' : 'failed',
        updatedAt: new Date().toISOString(),
        lifecycle: [
          ...(selectedTask.lifecycle ?? []),
          createLifecycleEvent(
            passed ? 'verified' : 'failed',
            passed ? 'Constrained MVP smoke verification passed.' : 'Constrained MVP smoke verification failed.'
          )
        ],
        verificationChecks: [
          ...(selectedTask.verificationChecks ?? []).filter((check) => check.id !== 'mvp-verification'),
          {
            id: 'mvp-verification',
            label: 'MVP verification',
            status: passed ? 'pass' : 'fail',
            detail: `${result.command} exited with code ${result.exitCode}.`
          }
        ],
        reviewPackage: {
          ...selectedTask.reviewPackage,
          commandLog: [
            ...selectedTask.reviewPackage.commandLog,
            [
              `${result.command} -> exit ${result.exitCode}`,
              result.stdout ? `stdout: ${result.stdout}` : '',
              result.stderr ? `stderr: ${result.stderr}` : ''
            ]
              .filter(Boolean)
              .join('\n')
          ],
          notes: [
            ...selectedTask.reviewPackage.notes,
            passed ? 'MVP smoke verification passed from the desktop runtime dock.' : 'MVP smoke verification failed from the desktop runtime dock.'
          ]
        }
      };

      await window.agentos.updateTaskRecord(nextRecord);
      const tasks = await window.agentos.listTaskRecords();
      setRecentTasks(tasks);
      setSelectedTaskId(nextRecord.id);
      await refreshGitReview();
      setStatusMessage(passed ? 'MVP verification passed and was saved to task history.' : 'MVP verification failed and was saved to task history.');
    } catch {
      setStatusMessage('Could not run MVP verification.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AppShell
      profile={profile}
      header={
        <TopStatusBar
          projectName={projectSummary ? 'AgentOS workspace' : 'No project connected'}
          phase={phase}
          approvalMode={approvalMode}
          risk={plan.risk}
          platform={window.agentos?.platform ?? 'browser'}
          sandboxStatus={sandboxStatus === 'ready' ? 'ready / local review-first' : sandboxStatus}
          profile={profile}
          onToggleProfile={() => setProfile((current) => (current === 'guided' ? 'advanced' : 'guided'))}
        />
      }
      leftRail={
        <LeftNavRail
          selectedProject={selectedProject}
          recentTasks={recentTasks}
          selectedTaskId={selectedTaskId}
          isBusy={isBusy}
          sandboxReady={sandboxStatus === 'ready'}
          onStartSandbox={() => void handleStartSandbox(true)}
          onSelectProject={() => void handleSelectProject()}
          onSelectTask={setSelectedTaskId}
        />
      }
      center={
        <CenterCanvas phase={phase} statusMessage={statusMessage} headline={runSummary.statusHeadline}>
          <article className="section-card sandbox-card">
            <div className="section-header">
              <div>
                <p className="label">Sandbox first</p>
                <h3>Local sandbox: {sandboxStatus}</h3>
              </div>
              <button type="button" className="button button-secondary" onClick={() => void handleStartSandbox(true)} disabled={isBusy || sandboxStatus === 'ready'}>
                {sandboxStatus === 'ready' ? 'Sandbox ready' : 'Start sandbox'}
              </button>
            </div>
            <p>{sandboxMessage}</p>
          </article>

          <div className="canvas-grid">
            <ProjectSummaryCard summary={projectSummary} />
            <ScannerFindingsList summary={projectSummary} />
          </div>

          <ConstraintBar
            approvalMode={approvalMode}
            scope="Selected local project"
            allowedTools={['scanner', 'planner', 'task-store']}
            roles={['planner', 'reviewer', 'runtime guard']}
          />

          <MissionInputCard
            prompt={prompt}
            isBusy={isBusy}
            lastSavedPath={lastSavedPath}
            onPromptChange={setPrompt}
            onGeneratePlan={() => void handleGeneratePlan()}
          />

          <div className="canvas-grid">
            <MissionSummaryCard plan={plan} />
            <PlanStepList plan={plan} />
          </div>

          <ReviewPackageCard task={selectedTask} bundlePreview={bundlePreview} gitReview={gitReview} />
        </CenterCanvas>
      }
      rightRail={
        <RightEvidenceRail
          approvalState={approvalState}
          projectSummary={projectSummary}
          selectedTask={selectedTask}
          checks={checks}
          gitReview={gitReview}
          isBusy={isBusy}
          onRefreshGitReview={() => void refreshGitReview()}
          onApproveReadOnly={() => void handleApprovalDecision('approved-read-only')}
          onRequestRework={() => void handleApprovalDecision('rework-requested')}
        />
      }
      runtimeDock={
        <RuntimeDock
          nodeVersion={window.agentos?.versions.node}
          electronVersion={window.agentos?.versions.electron}
          chromeVersion={window.agentos?.versions.chrome}
          dataDir={window.agentos?.dataDir ?? undefined}
          currentTaskState={selectedTask?.status ?? 'planning'}
          nextAction={runSummary.nextAction}
          canRunVerification={Boolean(selectedTask)}
          isBusy={isBusy}
          onRunVerification={() => void handleRunVerification()}
        />
      }
    />
  );
}
