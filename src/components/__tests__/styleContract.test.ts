import { readFileSync, readdirSync, type Dirent } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const SOURCE_ROOTS = ['src/pages', 'src/components', 'src/layout'];

const TAG_RE = /<(button|Button|DialogPrimitive\.Close)\b/g;

const RADIUS_OVERRIDE_RE = /(?:^|[^A-Za-z0-9_-])rounded-(2xl|xl|lg)(?=$|[^A-Za-z0-9_-])/g;

const PRESS_SCALE_RE = /active:scale-(?:\[[^\]]+\]|[A-Za-z0-9.]+)/g;

const ALLOWED_PRESS_SCALE = 'active:scale-[0.98]';

type Frame =
  | { kind: 'code'; closeAt: number | null }
  | { kind: 'sq' }
  | { kind: 'dq' }
  | { kind: 'tpl' };

/** Opening tags for button-role controls, respecting strings and JSX braces. */
export function extractButtonOpeningTags(source: string): string[] {
  const tags: string[] = [];
  TAG_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAG_RE.exec(source)) !== null) {
    const start = match.index;
    let index = start + match[0].length;
    const stack: Frame[] = [{ kind: 'code', closeAt: null }];
    let brace = 0;
    let closed = false;

    while (index < source.length) {
      const char = source[index];
      const next = source[index + 1];
      const top = stack[stack.length - 1];

      if (top.kind === 'sq' || top.kind === 'dq') {
        if (char === '\\') {
          index += 2;
          continue;
        }
        if ((top.kind === 'sq' && char === "'") || (top.kind === 'dq' && char === '"')) {
          stack.pop();
        }
        index += 1;
        continue;
      }

      if (top.kind === 'tpl') {
        if (char === '\\') {
          index += 2;
          continue;
        }
        if (char === '`') {
          stack.pop();
          index += 1;
          continue;
        }
        if (char === '$' && next === '{') {
          brace += 1;
          stack.push({ kind: 'code', closeAt: brace });
          index += 2;
          continue;
        }
        index += 1;
        continue;
      }

      if (char === '/' && next === '/') {
        index += 2;
        while (index < source.length && source[index] !== '\n') index += 1;
        continue;
      }
      if (char === '/' && next === '*') {
        index += 2;
        while (index < source.length - 1 && !(source[index] === '*' && source[index + 1] === '/')) {
          index += 1;
        }
        index += 2;
        continue;
      }
      if (char === "'") {
        stack.push({ kind: 'sq' });
        index += 1;
        continue;
      }
      if (char === '"') {
        stack.push({ kind: 'dq' });
        index += 1;
        continue;
      }
      if (char === '`') {
        stack.push({ kind: 'tpl' });
        index += 1;
        continue;
      }
      if (char === '{') {
        brace += 1;
        index += 1;
        continue;
      }
      if (char === '}') {
        if (top.closeAt === brace) stack.pop();
        brace = Math.max(0, brace - 1);
        index += 1;
        continue;
      }
      if (brace === 0 && char === '>') {
        tags.push(source.slice(start, index + 1));
        closed = true;
        break;
      }
      index += 1;
    }

    if (!closed) {
      throw new Error(`Unclosed button tag at index ${start}`);
    }
    TAG_RE.lastIndex = index + 1;
  }
  return tags;
}

function radiusOverrides(tag: string): string[] {
  return [...tag.matchAll(RADIUS_OVERRIDE_RE)].map((hit) => hit[0].trim());
}

function foreignPressScales(tag: string): string[] {
  return [...tag.matchAll(PRESS_SCALE_RE)]
    .map((hit) => hit[0])
    .filter((scale) => scale !== ALLOWED_PRESS_SCALE);
}

function isRawButton(tag: string): boolean {
  return tag.startsWith('<button') || tag.startsWith('<DialogPrimitive.Close');
}

function listSourceFiles(dir: string): string[] {
  const entries: Dirent[] = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('visual style contract', () => {
  it('parser flags button radius and press-scale overrides and ignores non-buttons', () => {
    const bad = extractButtonOpeningTags(
      '<button className="rounded-xl active:scale-90">保存</button><div className="rounded-2xl"></div>',
    );
    expect(bad).toHaveLength(1);
    expect(radiusOverrides(bad[0])).toEqual(
      expect.arrayContaining([expect.stringContaining('rounded-xl')]),
    );
    expect(foreignPressScales(bad[0])).toContain('active:scale-90');

    const good = extractButtonOpeningTags(
      "<Button className={cn('w-full font-bold', active && `scale`)}>\n  <span>ok</span>\n</Button>",
    );
    expect(good).toHaveLength(1);
    expect(radiusOverrides(good[0])).toEqual([]);
    expect(foreignPressScales(good[0])).toEqual([]);

    const split = extractButtonOpeningTags(`<button
      className={'rounded-md transition-all duration-150 active:scale-[0.98]'}
    >`);
    expect(isRawButton(split[0])).toBe(true);
    expect(radiusOverrides(split[0])).toEqual([]);
    expect(foreignPressScales(split[0])).toEqual([]);
  });

  it('button-role controls do not override radius to rounded-lg, rounded-xl, or rounded-2xl', () => {
    const violations: string[] = [];
    let tagCount = 0;

    for (const root of SOURCE_ROOTS) {
      for (const file of listSourceFiles(path.join(projectRoot, root))) {
        const source = readFileSync(file, 'utf8');
        const relative = path.relative(projectRoot, file);
        for (const tag of extractButtonOpeningTags(source)) {
          tagCount += 1;
          const radii = radiusOverrides(tag);
          const scales = foreignPressScales(tag);
          const missingShared = isRawButton(tag)
            ? ['rounded-md', 'duration-150', ALLOWED_PRESS_SCALE].filter(
                (token) => !tag.includes(token),
              )
            : [];
          if (radii.length > 0 || scales.length > 0 || missingShared.length > 0) {
            violations.push(
              `${relative}: radii=[${radii.join(', ')}] scales=[${scales.join(', ')}] missing=[${missingShared.join(', ')}]`,
            );
          }
        }
      }
    }

    expect(tagCount).toBeGreaterThan(15);
    expect(violations).toEqual([]);
  });

  it('cards, panels, dialogs, and drop zones do not use rounded-2xl', () => {
    const offenders: string[] = [];
    for (const root of SOURCE_ROOTS) {
      for (const file of listSourceFiles(path.join(projectRoot, root))) {
        const source = readFileSync(file, 'utf8');
        if (source.includes('rounded-2xl')) {
          offenders.push(path.relative(projectRoot, file));
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('disables page-transition-enter when prefers-reduced-motion is reduce', () => {
    const css = readFileSync(path.join(projectRoot, 'src/styles/shell.css'), 'utf8');
    expect(css).toMatch(/\.page-transition-enter\s*\{[^}]*animation:\s*tt-page-enter/);
    const reduced = css.match(
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/,
    );
    expect(reduced).not.toBeNull();
    expect(reduced?.[1]).toMatch(/\.page-transition-enter\s*\{[^}]*animation:\s*none\s*!important/);
  });
});
