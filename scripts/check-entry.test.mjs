/**
 * node --test scripts/check-entry.test.mjs
 *
 * check-entry.mjs exits the process on import, so it is run as a child here and judged
 * on its exit code and the reason it printed.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CHECKER = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-entry.mjs');

const FREE = {
    schema: 'cubric/flow-registry/entry/v1',
    id: 'my-flow',
    lane: 'free',
    title: 'My Flow',
    description: 'One sentence.',
    version: '1.0.0',
    author: 'Someone',
    licence: 'MIT',
    minAppVersion: '2.0.0',
    mediaType: 'image',
    requiredModels: ['qwen-edit'],
    preview: 'preview.webp',
};

const PAID = {
    ...FREE,
    id: 'paid-flow',
    lane: 'paid',
    licence: 'All rights reserved',
    preview: 'https://example.com/p.webp',
    download: 'https://example.com/buy',
    sha256: 'a'.repeat(64),
};

/** Lay out a throwaway flows/ dir, write the entry, run the checker over it. */
function run(entry, { withPackage = false, name = null } = {}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-'));
    const flows = path.join(dir, 'flows');
    fs.mkdirSync(flows);
    const file = path.join(flows, `${name ?? entry.id}.json`);
    fs.writeFileSync(file, JSON.stringify(entry, null, 2));
    if (withPackage) {
        fs.mkdirSync(path.join(flows, entry.id));
        fs.writeFileSync(path.join(flows, entry.id, 'flow.json'), '{}');
    }
    const r = spawnSync(process.execPath, [CHECKER, file], { encoding: 'utf8' });
    fs.rmSync(dir, { recursive: true, force: true });
    return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

test('a free entry with its package passes', () => {
    assert.equal(run(FREE, { withPackage: true }).code, 0);
});

test('a paid entry with no package folder passes', () => {
    assert.equal(run(PAID).code, 0);
});

test('a free entry without its package folder fails', () => {
    const r = run(FREE);
    assert.equal(r.code, 1);
    assert.match(r.out, /flow\.json" not found/);
});

test('a paid entry that commits its package fails — the catalogue is not a file host', () => {
    const r = run(PAID, { withPackage: true });
    assert.equal(r.code, 1);
    assert.match(r.out, /must NOT be committed here/);
});

test('a paid entry with a short sha256 fails', () => {
    const r = run({ ...PAID, sha256: 'abc123' });
    assert.equal(r.code, 1);
    assert.match(r.out, /64 hex characters/);
});

test('the id must match the filename', () => {
    const r = run(FREE, { withPackage: true, name: 'other-name' });
    assert.equal(r.code, 1);
    assert.match(r.out, /they must match/);
});

test('an unknown key is a typo, not a silent extra', () => {
    const r = run({ ...FREE, titel: 'oops' }, { withPackage: true });
    assert.equal(r.code, 1);
    assert.match(r.out, /unknown key "titel"/);
});

test('markup anywhere in the entry fails — that text reaches HTML', () => {
    const r = run({ ...FREE, description: 'A <b>bold</b> claim.' }, { withPackage: true });
    assert.equal(r.code, 1);
    assert.match(r.out, /no markup characters/);
});

test('markup nested in a list is caught too', () => {
    const r = run({ ...FREE, requiredModels: ['ok', 'bad"quote'] }, { withPackage: true });
    assert.equal(r.code, 1);
    assert.match(r.out, /requiredModels\[1\]/);
});

test('no arguments is clean, not a usage error — CI passes an empty list often', () => {
    const r = spawnSync(process.execPath, [CHECKER], { encoding: 'utf8' });
    assert.equal(r.status, 0);
});
