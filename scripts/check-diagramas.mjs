import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const cwd = process.cwd();
const manifestPath = path.join(cwd, "docs", "diagramas.manifest.json");

function normalizeFileName(fileName) {
  return fileName.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+/g, "/");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr).trim() : "";
    const message = stderr || error.message || "Falha ao executar git.";
    throw new Error(message);
  }
}

function collectFilesFromGit() {
  const base = process.env.DIAGRAM_GUARD_BASE?.trim();
  const head = process.env.DIAGRAM_GUARD_HEAD?.trim();

  if (base && head) {
    return runGit(["diff", "--name-only", base, head]);
  }

  const staged = runGit(["diff", "--name-only", "--cached"]);
  const unstaged = runGit(["diff", "--name-only", "HEAD"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);

  return [staged, unstaged, untracked].filter(Boolean).join("\n");
}

function toSet(lines) {
  return new Set(
    lines
      .split(/\r?\n/)
      .map((line) => normalizeFileName(line.trim()))
      .filter(Boolean),
  );
}

function matchesPath(fileName, rulePath) {
  const normalized = normalizeFileName(fileName);
  const exactMatches = rulePath.exact ?? [];
  const prefixMatches = rulePath.prefixes ?? [];

  if (exactMatches.some((candidate) => normalizeFileName(candidate) === normalized)) {
    return true;
  }

  return prefixMatches.some((candidate) => {
    const prefix = normalizeFileName(candidate);
    return normalized === prefix || normalized.startsWith(prefix);
  });
}

function isIgnored(fileName, ignorePrefixes) {
  const normalized = normalizeFileName(fileName);
  return ignorePrefixes.some((prefix) => normalized.startsWith(normalizeFileName(prefix)));
}

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Manifesto nao encontrado em ${manifestPath}`);
}

const manifest = readJson(manifestPath);
const rules = Array.isArray(manifest.rules) ? manifest.rules : [];
const ignorePrefixes = Array.isArray(manifest.ignorePrefixes) ? manifest.ignorePrefixes : [];

const changedFiles = toSet(collectFilesFromGit());
const relevantFiles = [...changedFiles].filter(
  (fileName) => !isIgnored(fileName, ignorePrefixes),
);

const changedDiagramFiles = new Set(
  [...changedFiles].filter((fileName) => normalizeFileName(fileName).startsWith("docs/diagramas/")),
);

const impacted = new Map();

for (const fileName of relevantFiles) {
  for (const rule of rules) {
    if (!rule?.diagram || !rule?.paths) {
      continue;
    }

    if (matchesPath(fileName, rule.paths)) {
      if (!impacted.has(rule.diagram)) {
        impacted.set(rule.diagram, new Set());
      }

      impacted.get(rule.diagram).add(fileName);
    }
  }
}

const missing = [...impacted.keys()].filter(
  (diagram) => !changedDiagramFiles.has(normalizeFileName(diagram)),
);

if (missing.length) {
  const lines = [
    "Guard de diagramas reprovado.",
    "",
    "Arquivos que exigem atualizacao de diagrama:",
  ];

  for (const [diagram, files] of impacted.entries()) {
    if (missing.includes(diagram)) {
      lines.push(`- ${diagram}`);
      for (const fileName of files) {
        lines.push(`  - ${fileName}`);
      }
    }
  }

  lines.push("");
  lines.push("Atualize os diagramas acima e rode `npm run diagramas:check` de novo.");

  throw new Error(lines.join("\n"));
}

process.stdout.write(
  relevantFiles.length
    ? `Guard de diagramas OK. ${relevantFiles.length} arquivo(s) relevante(s) sem divergencia.`
    : "Guard de diagramas OK. Nenhum arquivo relevante alterado.",
);
