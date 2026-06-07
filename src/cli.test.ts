import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import packageJson from '../package.json' with { type: 'json' };

const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
);

describe('Crypto Guardian CLI', () => {
    it('reports the package version', () => {
        const output = execFileSync(
            process.execPath,
            [path.join(projectRoot, 'dist', 'index.js'), '--version'],
            { encoding: 'utf8' },
        );

        expect(output.trim()).toBe(packageJson.version);
    });
});
