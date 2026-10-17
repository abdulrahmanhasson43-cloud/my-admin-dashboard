import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Architecture tests — they read the source files and fail if the Clean
 * Architecture boundaries are crossed. Written after finding that the rules
 * were only promised in comments: `types/order.ts` was importing UI icons,
 * and localStorage was used directly in nine files.
 */

const SRC = fileURLToPath(new URL('../src', import.meta.url));

interface ImportRef {
  file: string;
  specifier: string;
  typeOnly: boolean;
  /** Everything between `import` and `from`, e.g. `{ A, B }`. */
  clause: string;
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    // Tests and their helpers are not shipped code, and they legitimately seed
    // storage / stub browser APIs, so the architecture rules do not apply to them.
    const isSource = /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name);
    const isTestSupport = full.split(sep).includes('test-utils');
    return isSource && !isTestSupport ? [full] : [];
  });
}

/** Path relative to src/, always with forward slashes. */
function rel(file: string): string {
  return relative(SRC, file).split(sep).join('/');
}

function importsOf(file: string): ImportRef[] {
  const source = readFileSync(file, 'utf8');
  const pattern = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?([^;'"]*?)\s*from\s+['"]([^'"]+)['"]/g;
  const refs: ImportRef[] = [];
  for (const match of source.matchAll(pattern)) {
    refs.push({ file: rel(file), specifier: match[3], typeOnly: Boolean(match[1]), clause: match[2] });
  }
  return refs;
}

/** Turns a relative specifier into an '@/…' style path so one rule covers both. */
function normalise(ref: ImportRef): string {
  if (ref.specifier.startsWith('@/')) return ref.specifier.slice(2);
  if (!ref.specifier.startsWith('.')) return ref.specifier;
  const fromDir = ref.file.split('/').slice(0, -1);
  const parts = [...fromDir];
  for (const segment of ref.specifier.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment !== '.') parts.push(segment);
  }
  return parts.join('/');
}

const allFiles = listSourceFiles(SRC);

const UI_PACKAGES = ['react', 'react-dom', 'react-router', 'react-router-dom', 'sonner', 'framer-motion', 'lucide-react', 'recharts'];
const UI_FOLDERS = ['components', 'pages', 'context', 'hooks'];

function isUiImport(ref: ImportRef): boolean {
  const target = normalise(ref);
  const isUiPackage = UI_PACKAGES.some(pkg => target === pkg || target.startsWith(`${pkg}/`));
  const isUiFolder = UI_FOLDERS.some(folder => target === folder || target.startsWith(`${folder}/`));
  return isUiPackage || isUiFolder;
}

describe('Dependency Rule: inner layers never depend on the UI', () => {
  const innerLayers = ['types/', 'services/', 'lib/'];

  it.each(innerLayers)('%s has no runtime import of React, UI packages, components, pages, hooks or context', layer => {
    const violations = allFiles
      .filter(file => rel(file).startsWith(layer))
      .flatMap(importsOf)
      .filter(ref => !ref.typeOnly && isUiImport(ref))
      .map(ref => `${ref.file} -> ${ref.specifier}`);

    expect(violations).toEqual([]);
  });
});

describe('Composition: concrete repositories are wired in ONE file', () => {
  const COMPOSITION_ROOT = 'context/data-services-context.tsx';
  const isConcreteRepository = (name: string) => /\b(Mock|LocalStorage)[A-Za-z]*Repository\b/.test(name);

  it('only the composition root (outside services/) imports a Mock*/LocalStorage*Repository', () => {
    const violations = allFiles
      .filter(file => !rel(file).startsWith('services/') && rel(file) !== COMPOSITION_ROOT)
      .flatMap(importsOf)
      .filter(ref => isConcreteRepository(ref.clause) || isConcreteRepository(ref.specifier) || normalise(ref).startsWith('services/mock'))
      .map(ref => `${ref.file} -> ${ref.specifier}`);

    expect(violations).toEqual([]);
  });

  it('no service class (non-repository file) reaches storage or services/mock itself', () => {
    const violations = allFiles
      .filter(file => /^services\//.test(rel(file)) && !/Repository\.ts$/.test(rel(file)) && !rel(file).startsWith('services/mock/'))
      .flatMap(importsOf)
      .filter(ref => normalise(ref) === 'lib/storage' || normalise(ref).startsWith('services/mock'))
      .map(ref => `${ref.file} -> ${ref.specifier}`);

    expect(violations).toEqual([]);
  });
});

describe('Storage: browser storage is reached only through lib/storage.ts', () => {
  const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  it('no other file touches localStorage or sessionStorage', () => {
    const violations = allFiles
      .filter(file => rel(file) !== 'lib/storage.ts')
      .filter(file => /\b(localStorage|sessionStorage)\b/.test(stripComments(readFileSync(file, 'utf8'))))
      .map(rel);

    expect(violations).toEqual([]);
  });
});
