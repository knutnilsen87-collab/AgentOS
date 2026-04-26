import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import type { ProjectProfile } from "../types/project.js";
import type { UUID } from "../types/core.js";

export type ScanProjectOptions = {
  projectId: UUID;
  rootPath: string;
  maxDepth?: number;
  ignore?: string[];
};

const DEFAULT_IGNORE = [".git", "node_modules", "dist", "build", ".next", ".turbo", "coverage"];

export async function scanProjectReadOnly(options: ScanProjectOptions): Promise<ProjectProfile> {
  const ignore = new Set([...(options.ignore ?? []), ...DEFAULT_IGNORE]);
  const maxDepth = options.maxDepth ?? 5;
  const files: string[] = [];

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignore.has(entry.name)) continue;

      const fullPath = join(dir, entry.name);
      const rel = relative(options.rootPath, fullPath);

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        files.push(rel);
      }
    }
  }

  await walk(options.rootPath, 0);

  const manifests = files.filter((file) =>
    ["package.json", "pyproject.toml", "requirements.txt", "Cargo.toml", "go.mod"].includes(file)
  );

  const languages = detectLanguages(files);
  const packageManagers = detectPackageManagers(files);
  const sourceRoots = detectSourceRoots(files);
  const entryPoints = detectEntryPoints(files);
  const packageJson = files.includes("package.json")
    ? await readPackageJson(join(options.rootPath, "package.json"))
    : undefined;

  const buildCommands = packageJson?.scripts
    ? Object.keys(packageJson.scripts)
        .filter((name) => name.includes("build"))
        .map((name) => `npm run ${name}`)
    : [];

  const testCommands = packageJson?.scripts
    ? Object.keys(packageJson.scripts)
        .filter((name) => name.includes("test"))
        .map((name) => `npm run ${name}`)
    : [];

  return {
    projectId: options.projectId,
    generatedAt: new Date().toISOString(),
    languages,
    frameworks: detectFrameworks(files, packageJson),
    packageManagers,
    manifests,
    entryPoints,
    sourceRoots,
    testCommands,
    buildCommands,
    facts: [
      {
        id: "files_seen",
        source: "SCANNER",
        statement: `Scanner observed ${files.length} files within maxDepth=${maxDepth}.`,
      },
      ...manifests.map((manifest) => ({
        id: `manifest_${manifest}`,
        source: "SCANNER" as const,
        statement: `Manifest detected: ${manifest}`,
        evidence: [manifest],
      })),
    ],
    assumptions: [
      ...(packageJson
        ? [
            {
              id: "node_project_assumption",
              statement: "Project is likely a Node.js/JavaScript/TypeScript project because package.json exists.",
              confidence: "HIGH" as const,
              basedOn: ["package.json"],
            },
          ]
        : []),
    ],
    riskFlags: [
      ...(testCommands.length === 0
        ? [
            {
              id: "no_test_command_detected",
              level: "MEDIUM" as const,
              title: "No test command detected",
              description: "Scanner did not detect a package script containing 'test'.",
              evidence: manifests,
            },
          ]
        : []),
    ],
    filesSeen: files.length,
  };
}

function detectLanguages(files: string[]): string[] {
  const langs = new Set<string>();
  for (const file of files) {
    if (file.endsWith(".ts") || file.endsWith(".tsx")) langs.add("TypeScript");
    if (file.endsWith(".js") || file.endsWith(".jsx")) langs.add("JavaScript");
    if (file.endsWith(".py")) langs.add("Python");
    if (file.endsWith(".rs")) langs.add("Rust");
    if (file.endsWith(".go")) langs.add("Go");
  }
  return [...langs];
}

function detectPackageManagers(files: string[]): string[] {
  const managers: string[] = [];
  if (files.includes("package-lock.json")) managers.push("npm");
  if (files.includes("pnpm-lock.yaml")) managers.push("pnpm");
  if (files.includes("yarn.lock")) managers.push("yarn");
  if (files.includes("requirements.txt") || files.includes("pyproject.toml")) managers.push("pip/poetry");
  return managers;
}

function detectSourceRoots(files: string[]): string[] {
  const roots = new Set<string>();
  for (const file of files) {
    const first = file.split(/[\\/]/)[0];
    if (["src", "app", "lib", "packages"].includes(first)) roots.add(first);
  }
  return [...roots];
}

function detectEntryPoints(files: string[]): string[] {
  return files.filter((file) =>
    [
      "src/index.ts",
      "src/index.tsx",
      "src/main.ts",
      "src/main.tsx",
      "src/App.tsx",
      "main.ts",
      "index.ts",
      "index.js",
    ].includes(file)
  );
}

function detectFrameworks(files: string[], packageJson: any): string[] {
  const frameworks = new Set<string>();
  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  if (deps.react) frameworks.add("React");
  if (deps.vite) frameworks.add("Vite");
  if (deps.electron) frameworks.add("Electron");
  if (files.includes("next.config.js") || files.includes("next.config.ts")) frameworks.add("Next.js");
  return [...frameworks];
}

async function readPackageJson(path: string): Promise<any | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return undefined;
  }
}
