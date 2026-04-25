import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { TaskRecord } from '@agentos/shared-types';

function tasksDir(baseDir = '.agentos'): string {
  return path.join(baseDir, 'tasks');
}

export async function saveTaskRecord(record: TaskRecord, baseDir = '.agentos'): Promise<string> {
  const dir = tasksDir(baseDir);
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${record.id}.json`);
  await fs.writeFile(target, JSON.stringify(record, null, 2), 'utf-8');
  return target;
}

export async function updateTaskRecord(record: TaskRecord, baseDir = '.agentos'): Promise<string> {
  return saveTaskRecord({ ...record, updatedAt: new Date().toISOString() }, baseDir);
}

export async function listTaskRecords(baseDir = '.agentos'): Promise<TaskRecord[]> {
  const dir = tasksDir(baseDir);
  await fs.mkdir(dir, { recursive: true });
  const entries = await fs.readdir(dir);
  const files = entries.filter((entry) => entry.endsWith('.json'));

  const records = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      return JSON.parse(raw) as TaskRecord;
    })
  );

  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
