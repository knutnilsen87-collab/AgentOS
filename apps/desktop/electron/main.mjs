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

async function saveTaskRecord(record) {
  const dir = taskDir();
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${record.id}.json`);
  await fs.writeFile(target, JSON.stringify(record, null, 2), 'utf-8');
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
  ipcMain.handle('agentos:get-git-review-summary', async () => getGitReviewSummary());
  ipcMain.handle('agentos:run-mvp-verification', async () => runMvpVerification());
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
