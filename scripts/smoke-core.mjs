import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createMission, nextAllowedStates, transitionMissionState } from '../packages/mission-kernel/dist/index.js';
import { getDefaultApprovalMode, classifyTaskRisk, requiresExplicitReview } from '../packages/policy-engine/dist/index.js';
import { scanProject } from '../packages/project-scanner/dist/index.js';
import { renderTaskRunBundle } from '../packages/status-bundle/dist/index.js';
import { buildPhaseOnePlan, summarizeTaskRun } from '../packages/task-engine/dist/index.js';
import { saveTaskRecord, listTaskRecords, updateTaskRecord } from '../packages/task-store/dist/index.js';

const repoRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(tmpdir(), 'agentos-smoke-'));

try {
  const now = new Date().toISOString();
  const approvalMode = getDefaultApprovalMode();
  assert.equal(approvalMode, 'edit-with-approval');
  assert.equal(requiresExplicitReview(approvalMode), true);
  assert.equal(classifyTaskRisk('delete production credentials'), 'high');

  const mission = createMission({
    id: 'smoke-mission',
    projectId: 'smoke-project',
    goal: 'Create a reviewable phase-one task plan',
    approvalMode: 'REVIEW_BEFORE_WRITE',
    riskLevel: 'LOW',
    now
  });
  assert.equal(mission.phase, 'UNDERSTAND');
  assert.equal(mission.state, 'NOT_STARTED');
  assert.deepEqual(nextAllowedStates('NOT_STARTED'), ['RUNNING', 'BLOCKED', 'FAILED']);

  const runningMission = transitionMissionState(mission, {
    from: 'NOT_STARTED',
    to: 'RUNNING',
    phase: 'PLAN',
    reason: 'Smoke mission enters planning.'
  });
  assert.equal(runningMission.ok, true);
  assert.equal(runningMission.value.phase, 'PLAN');

  const projectSummary = await scanProject(repoRoot);
  assert.equal(projectSummary.rootPath, repoRoot);
  assert.ok(projectSummary.estimatedFileCount > 0);
  assert.ok(projectSummary.manifests.some((manifest) => manifest.endsWith('package.json')));

  const plan = buildPhaseOnePlan('Create a reviewable phase-one task plan', approvalMode, projectSummary);
  assert.equal(plan.steps.length, 5);
  assert.ok(plan.nextAction.length > 0);

  const runSummary = summarizeTaskRun(plan, projectSummary);
  const statusBundle = renderTaskRunBundle('AgentOS', 'Phase-1 desktop shell vertical slice', runSummary);
  assert.match(statusBundle, /PROJECT: AgentOS/);
  assert.match(statusBundle, /NEXT_ACTIONS:/);

  await saveTaskRecord(
    {
      id: 'smoke-task',
      prompt: plan.objective,
      status: 'planned',
      approvalMode,
      risk: plan.risk,
      projectRoot: repoRoot,
      createdAt: now,
      updatedAt: now,
      summary: runSummary.statusHeadline,
      approvalDecision: 'pending',
      lifecycle: [
        {
          id: 'event-smoke-created',
          kind: 'created',
          at: now,
          message: 'Smoke task created.'
        }
      ],
      verificationChecks: [
        {
          id: 'project-scan',
          label: 'Project scan',
          status: 'pass',
          detail: 'Smoke project scan passed.'
        }
      ],
      plan,
      projectSummary,
      runSummary,
      reviewPackage: {
        statusBundle,
        touchedFiles: [],
        commandLog: [],
        notes: ['Smoke test task record']
      }
    },
    tempRoot
  );

  const records = await listTaskRecords(tempRoot);
  assert.equal(records.length, 1);
  assert.equal(records[0].id, 'smoke-task');
  assert.equal(records[0].approvalDecision, 'pending');

  await updateTaskRecord(
    {
      ...records[0],
      status: 'needs-review',
      approvalDecision: 'approved-read-only',
      lifecycle: [
        ...(records[0].lifecycle ?? []),
        {
          id: 'event-smoke-approved',
          kind: 'approved',
          at: new Date().toISOString(),
          message: 'Smoke task approved read-only.'
        }
      ]
    },
    tempRoot
  );

  const updatedRecords = await listTaskRecords(tempRoot);
  assert.equal(updatedRecords[0].status, 'needs-review');
  assert.equal(updatedRecords[0].approvalDecision, 'approved-read-only');
  assert.equal(updatedRecords[0].lifecycle.length, 2);

  console.log('Core smoke test passed.');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
