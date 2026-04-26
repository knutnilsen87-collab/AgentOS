import { useEffect, useState } from 'react';
import {
  createMission,
  nextAllowedStates,
  transitionMissionState,
  type ApprovalMode as KernelApprovalMode,
  type Mission as KernelMission,
  type MissionPhase,
  type MissionState,
  type RiskLevel as KernelRiskLevel
} from '@agentos/mission-kernel';
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
  TaskRiskLevel,
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
import { VerificationChecklist } from './components/review/VerificationChecklist';
import { ActiveWorkPanel } from './components/shell/ActiveWorkPanel';
import { AppShell } from './components/shell/AppShell';
import { BottomConversationDock, type ConversationMessage } from './components/shell/BottomConversationDock';
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
      saveConversation: (payload: { id: string; messages: ConversationMessage[] }) => Promise<string>;
      loadConversation: (id: string) => Promise<{ id: string; messages: ConversationMessage[]; updatedAt: string | null }>;
      saveMissionState: (mission: KernelMission) => Promise<string>;
      getGitReviewSummary: () => Promise<GitReviewSummary>;
      runMvpVerification: () => Promise<CommandResult>;
      sendAgentCommand: (command: {
        message: string;
        context: {
          phase: UiPhase;
          profile: UiDisplayProfile;
          projectLabel: string;
          taskLabel: string;
          statusMessage: string;
        };
      }) => Promise<{
        provider: string;
        model: string;
        text: string;
        startedAt: string;
        finishedAt: string;
        responseId?: string;
        error?: string;
      }>;
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

function deriveTaskPhase(task: TaskRecord): UiPhase {
  if (task.status === 'done' || task.status === 'failed') return 'verification';
  if (task.status === 'needs-review') return 'review';
  return 'plan';
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

function toKernelApprovalMode(approvalMode: ApprovalMode): KernelApprovalMode {
  if (approvalMode === 'read-only' || approvalMode === 'propose-only') return 'READ_ONLY';
  if (approvalMode === 'trusted-auto' || approvalMode === 'routine') return 'SANDBOX_EXECUTE';
  return 'REVIEW_BEFORE_WRITE';
}

function toKernelRiskLevel(risk: TaskRiskLevel): KernelRiskLevel {
  if (risk === 'high') return 'HIGH';
  if (risk === 'medium') return 'MEDIUM';
  return 'LOW';
}

function createKernelMission(params: {
  id: string;
  goal: string;
  projectRoot: string;
  approvalMode: ApprovalMode;
  risk: TaskRiskLevel;
}): KernelMission {
  return createMission({
    id: `mission-${params.id}`,
    projectId: params.projectRoot || 'local-project',
    goal: params.goal,
    approvalMode: toKernelApprovalMode(params.approvalMode),
    riskLevel: toKernelRiskLevel(params.risk),
    scope: {
      allowedPaths: [params.projectRoot || '.'],
      deniedPaths: ['.git', 'node_modules', 'dist', 'build', '.env', '.agentos/cache'],
      allowedTools: ['scanProjectReadOnly', 'createPlan'],
      deniedTools: ['applyPatch', 'runCommand'],
      notes: 'Phase-1 mission kernel scope: local, review-first, read-only planning path.'
    }
  });
}

function moveKernelMission(
  mission: KernelMission,
  to: MissionState,
  phase: MissionPhase,
  reason: string
): KernelMission {
  const result = transitionMissionState(mission, {
    from: mission.state,
    to,
    phase,
    reason
  });

  return result.ok ? result.value : mission;
}

function createKernelMissionFromTask(task: TaskRecord): KernelMission {
  const base = createKernelMission({
    id: task.id,
    goal: task.prompt,
    projectRoot: task.projectRoot,
    approvalMode: task.approvalMode,
    risk: task.risk
  });

  if (task.status === 'done') {
    return { ...base, state: 'DONE', phase: 'VERIFY', updatedAt: task.updatedAt };
  }

  if (task.status === 'failed') {
    return { ...base, state: 'FAILED', phase: 'VERIFY', updatedAt: task.updatedAt };
  }

  if (task.status === 'needs-review') {
    return { ...base, state: 'RUNNING', phase: 'REVIEW', updatedAt: task.updatedAt };
  }

  return { ...base, state: 'AWAITING_APPROVAL', phase: 'PLAN', updatedAt: task.updatedAt };
}

function getPhaseHeadline(phase: UiPhase, runSummary: TaskRunSummary) {
  const headlines: Record<UiPhase, string> = {
    onboarding: 'Start with one local project',
    projectSummary: 'Project scan is ready',
    missionCompose: 'Define the mission',
    plan: 'Review the proposed plan',
    execution: 'Execution is staged',
    review: 'Review saved task evidence',
    verification: 'Verify completion evidence'
  };

  return phase === 'review' || phase === 'verification' ? runSummary.statusHeadline : headlines[phase];
}

function getChatPlaceholder(phase: UiPhase) {
  const placeholders: Record<UiPhase, string> = {
    onboarding: 'Spør AgentOS hva du bør koble til først, eller skriv en kort jobb du vil starte...',
    projectSummary: 'Spør hva scannen fant, eller be om et trygt første oppdrag...',
    missionCompose: 'Raffiner oppdraget, legg til begrensninger, eller be om en read-only første pass...',
    plan: 'Be om å revidere planen, snevre inn scope, eller forklare et steg før godkjenning...',
    execution: 'Legg til operatørkontekst eller spør hva som skjer nå...',
    review: 'Spør etter evidence, berørte filer, eller hvorfor review trengs...',
    verification: 'Spør hva som gjenstår, eller om evidensen er nok...'
  };

  return placeholders[phase];
}

function createLocalCommandResponse(message: string, phase: UiPhase) {
  const lower = message.toLowerCase();

  if (lower.includes('norsk') || lower.includes('norwegian')) {
    return 'Jeg bruker norsk i denne lokale command-docken. Merk: dette er foreløpig ikke koblet til en full språkmodell, så svarene er enkle og task-aware.';
  }

  if (lower.includes('hvorfor') || lower.includes('why')) {
    return 'Kort forklaring: denne chatflaten er foreløpig lokal UI-state, ikke en ekte agent-backend. Den lagrer operatørkontekst og kan styre fase/handlinger, men fritekstsvarene er fortsatt enkle.';
  }

  if (lower.includes('hjelp') || lower.includes('help')) {
    return 'Jeg kan foreløpig hjelpe med lokale kommandohandlinger: forklare flyten, revidere plan, snevre inn scope, vise evidence og kjøre verification når en task finnes.';
  }

  return `Notert som operatørkontekst for ${phase}. Bruk hovedflaten over for plan, approval, review og verification mens agent-runtime kobles videre.`;
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
  const [workflowPhase, setWorkflowPhase] = useState<UiPhase>('onboarding');
  const [kernelMission, setKernelMission] = useState<KernelMission | null>(null);
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null);
  const [gitReview, setGitReview] = useState<GitReviewSummary | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to scan a project and stage the first task plan.');
  const [isBusy, setIsBusy] = useState(false);
  const [commandDraft, setCommandDraft] = useState('');
  const [conversationHydrated, setConversationHydrated] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([
    {
      id: 'seed-agentos-1',
      author: 'agentos',
      text: 'Bruk dette feltet til task-aware kommandoer og avklaringer. Aktiv chat og jobbing vises i hovedflaten over.'
    }
  ]);

  const selectedTask = recentTasks.find((task) => task.id === selectedTaskId) ?? null;
  const phase = workflowPhase;
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
  const phaseHeadline = getPhaseHeadline(phase, runSummary);
  const kernelNextStates = kernelMission ? nextAllowedStates(kernelMission.state) : [];

  useEffect(() => {
    void hydrateInitialState();
  }, []);

  useEffect(() => {
    if (!conversationHydrated || !window.agentos?.saveConversation) return;
    void window.agentos.saveConversation({
      id: selectedTaskId ?? 'active',
      messages: conversationMessages
    });
  }, [conversationHydrated, conversationMessages, selectedTaskId]);

  useEffect(() => {
    if (!kernelMission || !window.agentos?.saveMissionState) return;
    void window.agentos.saveMissionState(kernelMission);
  }, [kernelMission]);

  async function hydrateInitialState() {
    await handleStartSandbox(false);

    if (!window.agentos?.listTaskRecords) return;

    try {
      const tasks = await window.agentos.listTaskRecords();
      setRecentTasks(tasks);
    } catch {
      setStatusMessage('Could not load saved task history yet.');
    }

    try {
      const conversation = await window.agentos.loadConversation('active');
      if (conversation.messages.length) {
        setConversationMessages(conversation.messages);
      }
    } catch {
      setStatusMessage('Could not load saved conversation yet.');
    } finally {
      setConversationHydrated(true);
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
      setWorkflowPhase('projectSummary');
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
    const mission = createKernelMission({
      id: record.id,
      goal: prompt,
      projectRoot: record.projectRoot,
      approvalMode,
      risk: nextPlan.risk
    });
    const runningMission = moveKernelMission(mission, 'RUNNING', 'PLAN', 'Plan generated from mission input.');
    const reviewMission = moveKernelMission(runningMission, 'AWAITING_APPROVAL', 'REVIEW', 'Plan is waiting for explicit operator review.');
    const recordWithKernelEvidence: TaskRecord = {
      ...record,
      reviewPackage: {
        ...record.reviewPackage,
        notes: [
          ...record.reviewPackage.notes,
          `Mission kernel created ${reviewMission.id} in ${reviewMission.phase}/${reviewMission.state}.`
        ]
      }
    };

    setPlan(nextPlan);
    setRunSummary(nextRunSummary);
    setKernelMission(reviewMission);
    setStatusMessage('Plan refreshed. Saving task record locally...');
    setIsBusy(true);

    try {
      const savedPath = await window.agentos?.saveTaskRecord(recordWithKernelEvidence);
      const tasks = (await window.agentos?.listTaskRecords()) ?? [];
      setRecentTasks(tasks);
      setSelectedTaskId(recordWithKernelEvidence.id);
      setLastSavedPath(savedPath ?? null);
      setWorkflowPhase('plan');
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
    const nextKernelMission = kernelMission
      ? moveKernelMission(
          kernelMission,
          isApproved ? 'RUNNING' : 'BLOCKED',
          isApproved ? 'REVIEW' : 'PLAN',
          isApproved ? 'Operator approved read-only continuation.' : 'Operator requested plan rework.'
        )
      : createKernelMissionFromTask(selectedTask);
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
    setKernelMission(nextKernelMission);
    setStatusMessage(isApproved ? 'Persisting read-only approval decision...' : 'Persisting rework request...');

    try {
      await window.agentos.updateTaskRecord(nextRecord);
      const tasks = await window.agentos.listTaskRecords();
      setRecentTasks(tasks);
      setSelectedTaskId(nextRecord.id);
      setWorkflowPhase(isApproved ? 'review' : 'missionCompose');
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
      const nextKernelMission = kernelMission
        ? moveKernelMission(
            kernelMission,
            passed ? 'DONE' : 'FAILED',
            'VERIFY',
            passed ? 'Constrained MVP smoke verification passed.' : 'Constrained MVP smoke verification failed.'
          )
        : createKernelMissionFromTask(selectedTask);
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

      setKernelMission(nextKernelMission);
      await window.agentos.updateTaskRecord(nextRecord);
      const tasks = await window.agentos.listTaskRecords();
      setRecentTasks(tasks);
      setSelectedTaskId(nextRecord.id);
      setWorkflowPhase('verification');
      await refreshGitReview();
      setStatusMessage(passed ? 'MVP verification passed and was saved to task history.' : 'MVP verification failed and was saved to task history.');
    } catch {
      setStatusMessage('Could not run MVP verification.');
    } finally {
      setIsBusy(false);
    }
  }

  function handleSelectTask(taskId: string) {
    setSelectedTaskId(taskId);
    const task = recentTasks.find((candidate) => candidate.id === taskId);
    if (task) {
      setWorkflowPhase(deriveTaskPhase(task));
      setKernelMission(createKernelMissionFromTask(task));
    }
  }

  async function handleSubmitCommand() {
    const trimmed = commandDraft.trim();
    if (!trimmed) return;

    const operatorMessage: ConversationMessage = { id: `operator-${Date.now()}`, author: 'operator', text: trimmed };
    setConversationMessages((current) => [...current, operatorMessage]);
    setCommandDraft('');

    const routed = await routeCommand(trimmed);
    if (routed) return;

    setIsBusy(true);
    setStatusMessage('AgentOS svarer på kommandoen...');

    try {
      const response = window.agentos?.sendAgentCommand
        ? await window.agentos.sendAgentCommand({
            message: trimmed,
            context: {
              phase,
              profile,
              projectLabel: projectSummary ? 'AgentOS workspace' : 'No project',
              taskLabel: selectedTask?.id ?? 'Draft mission',
              statusMessage
            }
          })
        : {
            provider: 'renderer-local-fallback',
            model: 'agentos-local-command-router',
            text: createLocalCommandResponse(trimmed, phase),
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString()
          };

      setConversationMessages((current) => [
        ...current,
        {
          id: `agentos-${Date.now()}`,
          author: 'agentos',
          text: response.provider === 'openai' ? response.text : `${response.text}\n\nKilde: ${response.provider}.`
        }
      ]);
      setStatusMessage(response.provider === 'openai' ? 'AgentOS svarte via LLM-runtime.' : 'AgentOS svarte med lokal fallback.');
    } catch {
      setConversationMessages((current) => [
        ...current,
        {
          id: `agentos-${Date.now()}`,
          author: 'agentos',
          text: createLocalCommandResponse(trimmed, phase)
        }
      ]);
      setStatusMessage('AgentOS brukte lokal fallback fordi runtime-kallet feilet.');
    } finally {
      setIsBusy(false);
    }
  }

  async function routeCommand(command: string): Promise<boolean> {
    const normalized = command.trim().toLowerCase();

    if (normalized === '/scan' || normalized.includes('connect local project') || normalized.includes('koble til prosjekt')) {
      setConversationMessages((current) => [
        ...current,
        {
          id: `agentos-route-${Date.now()}`,
          author: 'agentos',
          text: 'Starter prosjektkobling. Velg lokal mappe i dialogen.'
        }
      ]);
      await handleSelectProject();
      return true;
    }

    if (normalized === '/plan' || normalized.includes('lag plan') || normalized.includes('generate plan')) {
      setConversationMessages((current) => [
        ...current,
        {
          id: `agentos-route-${Date.now()}`,
          author: 'agentos',
          text: 'Lager en review-first plan fra gjeldende mission input.'
        }
      ]);
      await handleGeneratePlan();
      return true;
    }

    if (normalized === '/verify' || normalized.includes('kjør verification') || normalized.includes('run verification')) {
      if (!selectedTask) {
        setConversationMessages((current) => [
          ...current,
          {
            id: `agentos-route-${Date.now()}`,
            author: 'agentos',
            text: 'Jeg kan ikke kjøre verification før en task er valgt eller generert.'
          }
        ]);
        return true;
      }

      await handleRunVerification();
      return true;
    }

    if (normalized === '/review' || normalized.includes('vis evidence') || normalized.includes('show evidence')) {
      setWorkflowPhase(selectedTask ? 'review' : projectSummary ? 'projectSummary' : 'onboarding');
      await refreshGitReview();
      setConversationMessages((current) => [
        ...current,
        {
          id: `agentos-route-${Date.now()}`,
          author: 'agentos',
          text: 'Viser review/evidence-flaten for gjeldende kontekst.'
        }
      ]);
      return true;
    }

    if (normalized === '/status') {
      setConversationMessages((current) => [
        ...current,
        {
          id: `agentos-route-${Date.now()}`,
          author: 'agentos',
          text: `Status: fase ${phase}, profil ${profile}, task ${selectedTask?.id ?? 'draft'}, kernel ${kernelMission ? `${kernelMission.phase}/${kernelMission.state}` : 'ikke opprettet'}.`
        }
      ]);
      return true;
    }

    return false;
  }

  function handleQuickAction(action: string) {
    if (action === 'Revise plan' || action === 'Narrow scope') {
      setWorkflowPhase('missionCompose');
      setCommandDraft(action === 'Narrow scope' ? 'Narrow this to the smallest safe read-only first step.' : 'Revise the plan to be clearer and lower risk.');
      return;
    }

    if (action === 'Show evidence') {
      setWorkflowPhase(selectedTask ? 'review' : projectSummary ? 'projectSummary' : 'onboarding');
      void refreshGitReview();
      return;
    }

    setConversationMessages((current) => [
      ...current,
      {
        id: `agentos-${Date.now()}-${action}`,
        author: 'agentos',
        text: action === 'Explain'
          ? 'AgentOS holder mission, plan, approval, review og verification som egne flater. Chat/kommando er sekundær og brukes til avklaringer.'
          : `${action} er lagt inn som lokal operatørkontekst for denne fasen.`
      }
    ]);
  }

  function renderKernelCard() {
    return (
      <article className="section-card kernel-card">
        <div className="section-header">
          <div>
            <p className="label">Mission kernel</p>
            <h3>{kernelMission ? `${kernelMission.phase} / ${kernelMission.state}` : 'Ready for first mission'}</h3>
          </div>
          <span className="status-badge">v0.1</span>
        </div>
        <p>
          {kernelMission
            ? `Mission ${kernelMission.id} is governed by ${kernelMission.approvalMode}, ${kernelMission.riskLevel} risk, and scoped local tools.`
            : 'Kernel state will be created when the first mission plan is generated.'}
        </p>
        <div className="kernel-state-row">
          <span>Allowed next: {kernelNextStates.join(', ') || 'none'}</span>
          <span>Tools: {kernelMission?.scope.allowedTools.join(', ') ?? 'scanProjectReadOnly, createPlan'}</span>
        </div>
      </article>
    );
  }

  function renderActiveWorkPanel() {
    return (
      <ActiveWorkPanel
        phase={phase}
        isBusy={isBusy}
        statusMessage={statusMessage}
        selectedTask={selectedTask}
        kernelMission={kernelMission}
        messages={conversationMessages}
        checks={checks}
      />
    );
  }

  function renderCenterContent() {
    if (phase === 'onboarding') {
      return (
        <section className="phase-stack phase-active-only">
          {renderActiveWorkPanel()}
        </section>
      );
    }

    if (phase === 'projectSummary') {
      return (
        <section className="phase-stack">
          {renderActiveWorkPanel()}
          <ProjectSummaryCard summary={projectSummary} compact={profile === 'guided'} />
          {profile === 'advanced' ? <ScannerFindingsList summary={projectSummary} /> : null}
          {profile === 'advanced' ? renderKernelCard() : null}
          <article className="section-card next-action-card">
            <p className="label">Recommended next action</p>
            <h3>Define a small mission for this project</h3>
            <p>Keep the first pass read-only, generate a plan, and review the evidence before any permanent edit path exists.</p>
            <button type="button" className="button" onClick={() => setWorkflowPhase('missionCompose')}>
              Compose mission
            </button>
          </article>
        </section>
      );
    }

    if (phase === 'missionCompose') {
      return (
        <section className="phase-stack mission-compose-stack">
          {renderActiveWorkPanel()}
          <MissionInputCard
            prompt={prompt}
            isBusy={isBusy}
            lastSavedPath={lastSavedPath}
            dominant
            helperText="Describe the outcome. AgentOS will turn it into a reviewable local plan before any edit path."
            onPromptChange={setPrompt}
            onGeneratePlan={() => void handleGeneratePlan()}
          />
          <div className="support-grid">
            <ProjectSummaryCard summary={projectSummary} compact />
            <ConstraintBar
              approvalMode={approvalMode}
              scope="Selected local project"
              allowedTools={profile === 'advanced' ? ['scanner', 'planner', 'task-store'] : ['scanner', 'planner']}
              roles={profile === 'advanced' ? ['planner', 'reviewer', 'runtime guard'] : ['planner', 'reviewer']}
            />
          </div>
          {profile === 'advanced' ? renderKernelCard() : null}
        </section>
      );
    }

    if (phase === 'plan') {
      return (
        <section className="phase-stack">
          {renderActiveWorkPanel()}
          <div className="canvas-grid">
            <MissionSummaryCard plan={plan} />
            <PlanStepList plan={plan} />
          </div>
          <article className="section-card risk-card">
            <p className="label">Assumptions and risk</p>
            <h3>{plan.risk} risk / {approvalMode}</h3>
            <p>Plan review remains explicit. Use the right rail to approve read-only continuation or request rework.</p>
          </article>
          {renderKernelCard()}
        </section>
      );
    }

    if (phase === 'review') {
      return (
        <section className="phase-stack">
          {renderActiveWorkPanel()}
          <ReviewPackageCard task={selectedTask} bundlePreview={bundlePreview} gitReview={gitReview} compact={profile === 'guided'} />
          {renderKernelCard()}
        </section>
      );
    }

    if (phase === 'verification') {
      return (
        <section className="phase-stack">
          {renderActiveWorkPanel()}
          <article className="section-card verification-center">
            <p className="label">Verification</p>
            <h3>Evidence before done</h3>
            <p>Completion stays pending until checks and command evidence are visible.</p>
            <VerificationChecklist checks={checks} />
          </article>
          <article className="section-card next-action-card">
            <p className="label">Next action</p>
            <h3>{runSummary.nextAction}</h3>
            <button type="button" className="button" onClick={() => void handleRunVerification()} disabled={!selectedTask || isBusy}>
              Run verification
            </button>
          </article>
          {renderKernelCard()}
        </section>
      );
    }

    return (
      <section className="phase-stack">
        {renderActiveWorkPanel()}
        <article className="section-card">
          <p className="label">Execution</p>
          <h3>Execution is staged for a later phase</h3>
          <p>Phase 1 keeps execution constrained to explicit verification commands and saved review evidence.</p>
        </article>
      </section>
    );
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
          onSelectTask={handleSelectTask}
        />
      }
      center={
        <CenterCanvas phase={phase} statusMessage={statusMessage} headline={phaseHeadline}>
          {renderCenterContent()}
        </CenterCanvas>
      }
      rightRail={
        <RightEvidenceRail
          approvalState={approvalState}
          phase={phase}
          profile={profile}
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
      conversationDock={
        <BottomConversationDock
          projectLabel={projectSummary ? 'AgentOS workspace' : 'No project'}
          taskLabel={selectedTask?.id ?? 'Draft mission'}
          phase={phase}
          profile={profile}
          value={commandDraft}
          placeholder={getChatPlaceholder(phase)}
          messages={conversationMessages}
          canRunVerification={Boolean(selectedTask)}
          isBusy={isBusy}
          onValueChange={setCommandDraft}
          onSubmit={() => void handleSubmitCommand()}
          onQuickAction={handleQuickAction}
          onRunVerification={() => void handleRunVerification()}
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
