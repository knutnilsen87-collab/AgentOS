import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');
const dataDir = path.join(repoRoot, '.agentos');
const sandboxDirs = ['tasks', 'artifacts', 'cache', 'memory'];
const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'coverage', '.agentos']);
const manifestFiles = new Set(['package.json', 'tsconfig.json', 'README.md', 'README_MASTER.md']);
const execFileAsync = promisify(execFile);
const gitCandidates = ['git.exe', 'git', 'C:\\Program Files\\Git\\cmd\\git.exe'];
const npmCandidates = ['npm.cmd', 'C:\\Program Files\\nodejs\\npm.cmd'];

function createLocalAgentResponse(command) {
  const text = String(command?.message ?? '').toLowerCase();
  const phase = command?.context?.phase ?? 'onboarding';

  if (text.includes('hvorfor') || text.includes('why')) {
    return 'Grunnen er at AgentOS skiller mellom mission-control flyten og chat/kommando. Jeg kan nå svare task-aware her, men endrer fortsatt ikke filer uten eksplisitt plan, approval og review.';
  }

  if (text.includes('norsk') || text.includes('norwegian')) {
    return 'Klart. Jeg svarer på norsk i AgentOS-docken. Si hva du vil gjøre, så kobler jeg svaret til gjeldende fase og task.';
  }

  if (text.includes('hva') || text.includes('status')) {
    return `Status: du står i fasen ${phase}. Neste trygge steg er å bruke mission-control flaten til å skanne prosjekt, lage plan, godkjenne read-only, eller kjøre verification.`;
  }

  return `Jeg har mottatt dette som en task-aware kommando i fasen ${phase}. Når LLM-miljøvariabler er satt, vil dette svaret komme fra modellen; inntil da bruker AgentOS lokal fallback.`;
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === 'string') {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join('\n').trim();
}

async function sendAgentCommand(command) {
  const startedAt = new Date().toISOString();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';

  if (!apiKey) {
    await appendAuditEvent({
      type: 'agent.command',
      provider: 'local-fallback',
      phase: command?.context?.phase,
      messageLength: String(command?.message ?? '').length
    });
    return {
      provider: 'local-fallback',
      model: 'agentos-local-command-router',
      text: createLocalAgentResponse(command),
      startedAt,
      finishedAt: new Date().toISOString()
    };
  }

  const context = command?.context ?? {};
  const instructions = [
    'Du er AgentOS sin lokale mission-control agent.',
    'Svar på norsk som standard.',
    'Vær kort, konkret og knytt svaret til gjeldende prosjektfase.',
    'Ikke påstå at du har endret filer, kjørt kommandoer eller pushet kode hvis det ikke eksplisitt er gitt som evidence i konteksten.',
    'AgentOS er desktop-first, local-first og review-first. Bevar mission-control flyten og ikke gjør chat til hovedproduktet.'
  ].join('\n');

  const input = [
    `Fase: ${context.phase ?? 'unknown'}`,
    `Profil: ${context.profile ?? 'unknown'}`,
    `Prosjekt: ${context.projectLabel ?? 'unknown'}`,
    `Task: ${context.taskLabel ?? 'unknown'}`,
    `Status: ${context.statusMessage ?? 'unknown'}`,
    '',
    `Bruker: ${command?.message ?? ''}`
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        instructions,
        input
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const text = extractResponseText(payload);

    await appendAuditEvent({
      type: 'agent.command',
      provider: 'openai',
      model,
      responseId: payload.id,
      phase: command?.context?.phase,
      messageLength: String(command?.message ?? '').length
    });

    return {
      provider: 'openai',
      model,
      responseId: payload.id,
      text: text || 'Jeg fikk et tomt svar fra modellen.',
      startedAt,
      finishedAt: new Date().toISOString()
    };
  } catch (error) {
    await appendAuditEvent({
      type: 'agent.command.failed',
      provider: 'openai',
      phase: command?.context?.phase,
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      provider: 'local-fallback',
      model: 'agentos-local-command-router',
      text: `${createLocalAgentResponse(command)}\n\nLLM-kall feilet: ${error instanceof Error ? error.message : String(error)}`,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function walk(dir, state) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, state);
      continue;
    }

    state.count += 1;

    const ext = path.extname(entry.name).replace('.', '');
    if (ext) state.extensions.add(ext);
    if (manifestFiles.has(entry.name)) state.manifests.push(fullPath);
  }
}

async function scanProject(rootPath) {
  const state = {
    count: 0,
    manifests: [],
    extensions: new Set()
  };

  await walk(rootPath, state);

  const topLevelEntries = (await fs.readdir(rootPath, { withFileTypes: true }))
    .filter((entry) => !ignoredDirs.has(entry.name))
    .map((entry) => entry.name)
    .sort()
    .slice(0, 12);

  return {
    rootPath,
    manifests: state.manifests,
    languages: Array.from(state.extensions).sort(),
    estimatedFileCount: state.count,
    topLevelEntries
  };
}

async function initializeSandbox() {
  await fs.mkdir(dataDir, { recursive: true });

  await Promise.all(
    sandboxDirs.map(async (dirName) => {
      const target = path.join(dataDir, dirName);
      await fs.mkdir(target, { recursive: true });
      await fs.writeFile(path.join(target, '.gitkeep'), '', { flag: 'a' });
    })
  );

  return {
    status: 'ready',
    repoRoot,
    dataDir,
    directories: sandboxDirs.map((dirName) => path.join(dataDir, dirName)),
    startedAt: new Date().toISOString()
  };
}

function taskDir() {
  return path.join(dataDir, 'tasks');
}

function conversationDir() {
  return path.join(dataDir, 'conversations');
}

function missionDir() {
  return path.join(dataDir, 'missions');
}

function auditLogPath() {
  return path.join(dataDir, 'audit', 'events.jsonl');
}

function safeRecordId(value) {
  return String(value || 'active')
    .replace(/[^a-zA-Z0-9_.-]/g, '-')
    .slice(0, 120);
}

async function appendAuditEvent(event) {
  const target = auditLogPath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.appendFile(
    target,
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      source: 'agentos-desktop',
      ...event
    })}\n`,
    'utf-8'
  );
}

async function saveTaskRecord(record) {
  const dir = taskDir();
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${record.id}.json`);
  await fs.writeFile(target, JSON.stringify(record, null, 2), 'utf-8');
  await appendAuditEvent({
    type: 'task.saved',
    taskId: record.id,
    status: record.status,
    approvalDecision: record.approvalDecision ?? 'pending'
  });
  return target;
}

async function updateTaskRecord(record) {
  return saveTaskRecord({
    ...record,
    updatedAt: new Date().toISOString()
  });
}

async function listTaskRecords() {
  const dir = taskDir();
  await fs.mkdir(dir, { recursive: true });
  const entries = await fs.readdir(dir);
  const files = entries.filter((entry) => entry.endsWith('.json'));

  const records = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      return JSON.parse(raw);
    })
  );

  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function saveConversation(payload) {
  const id = safeRecordId(payload?.id);
  const dir = conversationDir();
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${id}.json`);
  await fs.writeFile(
    target,
    JSON.stringify(
      {
        id,
        messages: Array.isArray(payload?.messages) ? payload.messages : [],
        updatedAt: new Date().toISOString()
      },
      null,
      2
    ),
    'utf-8'
  );
  return target;
}

async function loadConversation(id = 'active') {
  const target = path.join(conversationDir(), `${safeRecordId(id)}.json`);
  try {
    const raw = await fs.readFile(target, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { id: safeRecordId(id), messages: [], updatedAt: null };
    }
    throw error;
  }
}

async function saveMissionState(mission) {
  const id = safeRecordId(mission?.id);
  const dir = missionDir();
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${id}.json`);
  await fs.writeFile(target, JSON.stringify(mission, null, 2), 'utf-8');
  await appendAuditEvent({
    type: 'mission.saved',
    missionId: mission?.id,
    phase: mission?.phase,
    state: mission?.state
  });
  return target;
}

async function runGit(args, cwd = repoRoot) {
  let lastError;

  for (const candidate of gitCandidates) {
    try {
      const result = await execFileAsync(candidate, args, {
        cwd,
        windowsHide: true,
        maxBuffer: 1024 * 1024
      });
      return result.stdout.trim();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function parseGitStatusLine(line) {
  const rawStatus = line.slice(0, 2).trim() || '??';
  const rawPath = line.slice(3).trim();
  const pathParts = rawPath.split(' -> ');
  const filePath = pathParts[pathParts.length - 1] || rawPath;
  const code = rawStatus[0];

  let status = 'unknown';
  if (rawStatus === '??') status = 'untracked';
  else if (code === 'A') status = 'added';
  else if (code === 'M') status = 'modified';
  else if (code === 'D') status = 'deleted';
  else if (code === 'R') status = 'renamed';
  else if (code === 'C') status = 'copied';

  return {
    path: filePath,
    status,
    rawStatus
  };
}

async function getGitReviewSummary() {
  try {
    const isRepositoryOutput = await runGit(['rev-parse', '--is-inside-work-tree']);
    const isRepository = isRepositoryOutput === 'true';

    if (!isRepository) {
      return {
        isRepository: false,
        branch: null,
        changedFiles: [],
        hasUncommittedChanges: false,
        diffStat: []
      };
    }

    const branch = await runGit(['branch', '--show-current']).catch(() => null);
    const statusOutput = await runGit(['status', '--short']).catch(() => '');
    const diffStatOutput = await runGit(['diff', '--stat']).catch(() => '');
    const changedFiles = statusOutput
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map(parseGitStatusLine);

    return {
      isRepository: true,
      branch: branch || null,
      changedFiles,
      hasUncommittedChanges: changedFiles.length > 0,
      diffStat: diffStatOutput.split(/\r?\n/).filter(Boolean)
    };
  } catch (error) {
    return {
      isRepository: false,
      branch: null,
      changedFiles: [],
      hasUncommittedChanges: false,
      diffStat: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runMvpVerification() {
  const startedAt = new Date().toISOString();
  let lastError;

  for (const candidate of npmCandidates) {
    try {
      const result = await execFileAsync(candidate, ['run', 'smoke'], {
        cwd: repoRoot,
        windowsHide: true,
        maxBuffer: 1024 * 1024
      });

      return {
        command: 'npm run smoke',
        exitCode: 0,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        startedAt,
        finishedAt: new Date().toISOString()
      };
    } catch (error) {
      lastError = error;

      if (error && typeof error === 'object' && 'stdout' in error && 'stderr' in error) {
        return {
          command: 'npm run smoke',
          exitCode: typeof error.code === 'number' ? error.code : 1,
          stdout: String(error.stdout ?? '').trim(),
          stderr: String(error.stderr ?? error.message ?? '').trim(),
          startedAt,
          finishedAt: new Date().toISOString()
        };
      }
    }
  }

  return {
    command: 'npm run smoke',
    exitCode: 1,
    stdout: '',
    stderr: lastError instanceof Error ? lastError.message : String(lastError),
    startedAt,
    finishedAt: new Date().toISOString()
  };
}

function registerIpc() {
  ipcMain.handle('agentos:initialize-sandbox', async () => initializeSandbox());

  ipcMain.handle('agentos:open-project-folder', async () => {
    const result = await dialog.showOpenDialog({
      defaultPath: repoRoot,
      properties: ['openDirectory']
    });

    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('agentos:scan-project', async (_event, rootPath) => scanProject(rootPath));
  ipcMain.handle('agentos:save-task-record', async (_event, record) => saveTaskRecord(record));
  ipcMain.handle('agentos:update-task-record', async (_event, record) => updateTaskRecord(record));
  ipcMain.handle('agentos:list-task-records', async () => listTaskRecords());
  ipcMain.handle('agentos:save-conversation', async (_event, payload) => saveConversation(payload));
  ipcMain.handle('agentos:load-conversation', async (_event, id) => loadConversation(id));
  ipcMain.handle('agentos:save-mission-state', async (_event, mission) => saveMissionState(mission));
  ipcMain.handle('agentos:get-git-review-summary', async () => getGitReviewSummary());
  ipcMain.handle('agentos:run-mvp-verification', async () => runMvpVerification());
  ipcMain.handle('agentos:send-agent-command', async (_event, command) => sendAgentCommand(command));
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    title: 'AgentOS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';
  const isDev = !app.isPackaged;

  if (isDev) {
    void window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: 'detach' });
  } else {
    void window.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await fs.mkdir(dataDir, { recursive: true });
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
