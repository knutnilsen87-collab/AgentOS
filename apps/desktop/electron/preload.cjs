const { contextBridge, ipcRenderer } = require('electron');

const agentosApi = {
  platform: process.platform,
  bridge: 'electron-preload',
  repoRoot: null,
  dataDir: null,
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome
  },
  initializeSandbox: async () => {
    const sandbox = await ipcRenderer.invoke('agentos:initialize-sandbox');
    agentosApi.repoRoot = sandbox.repoRoot;
    agentosApi.dataDir = sandbox.dataDir;
    return sandbox;
  },
  openProjectFolder: () => ipcRenderer.invoke('agentos:open-project-folder'),
  scanProject: (rootPath) => ipcRenderer.invoke('agentos:scan-project', rootPath),
  saveTaskRecord: (record) => ipcRenderer.invoke('agentos:save-task-record', record),
  updateTaskRecord: (record) => ipcRenderer.invoke('agentos:update-task-record', record),
  listTaskRecords: () => ipcRenderer.invoke('agentos:list-task-records'),
  getGitReviewSummary: () => ipcRenderer.invoke('agentos:get-git-review-summary'),
  runMvpVerification: () => ipcRenderer.invoke('agentos:run-mvp-verification')
};

contextBridge.exposeInMainWorld('agentos', agentosApi);
