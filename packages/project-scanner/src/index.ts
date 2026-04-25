import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProjectSummary } from '@agentos/shared-types';

const IGNORED = new Set(['node_modules', '.git', 'dist', 'coverage', '.agentos']);
const MANIFEST_FILES = ['package.json', 'tsconfig.json', 'README.md', 'README_MASTER.md'];

async function walk(dir: string, state: { count: number; manifests: string[]; extensions: Set<string> }) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, state);
      continue;
    }

    state.count += 1;
    const ext = path.extname(entry.name).replace('.', '');
    if (ext) state.extensions.add(ext);
    if (MANIFEST_FILES.includes(entry.name)) state.manifests.push(fullPath);
  }
}

export async function scanProject(rootPath: string): Promise<ProjectSummary> {
  const state = {
    count: 0,
    manifests: [] as string[],
    extensions: new Set<string>()
  };

  await walk(rootPath, state);

  const topLevelEntries = (await fs.readdir(rootPath, { withFileTypes: true }))
    .filter((entry) => !IGNORED.has(entry.name))
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
