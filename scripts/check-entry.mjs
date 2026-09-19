#!/usr/bin/env node
/**
 * check-entry.mjs — validate a catalogue entry, `flows/<id>.json`.
 *
 *   node scripts/check-entry.mjs flows/my-flow.json [more.json ...]
 *
 * Node builtins only, deliberately: this repo has no package.json, no lockfile and
 * no node_modules, so there is nothing here to install and nothing to audit.
 *
 * Exit 0 = clean (including "no entries given"), 1 = problems. Format: flows/README.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SCHEMA = 'cubric/flow-registry/entry/v1';
const ID = /^[a-z0-9-]{2,41}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const SHA256 = /^[0-9a-f]{64}$/;
const MEDIA = ['image', 'video', 'audio'];
const LANES = ['free', 'paid'];

const REQUIRED = ['schema', 'id', 'lane', 'title', 'description', 'version', 'author',
    'licence', 'minAppVersion', 'mediaType', 'requiredModels'];
const OPTIONAL = ['homepage', 'preview', 'download', 'sha256'];

/**
 * The same rule the app enforces on a manifest: this text is put into HTML by the
 * renderer. It is the one check here that is a security boundary rather than a
 * courtesy, so it walks the whole structure instead of the top level only.
 */
function markupIn(value, at, out) {
    if (typeof value === 'string') {
        const bad = [...new Set([...value].filter(c => '<>"`'.includes(c)))];
        if (bad.length) out.push(`${at}: contains ${bad.map(c => `${c}`).join(' ')} — no markup characters (use curly quotes “ ” ‘ ’)`);
    } else if (Array.isArray(value)) {
        value.forEach((v, i) => markupIn(v, `${at}[${i}]`, out));
    } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) markupIn(v, `${at}.${k}`, out);
    }
}

const httpsUrl = v => typeof v === 'string' && /^https:\/\/\S+$/.test(v);

function checkEntry(file) {
    const errors = [];
    let entry;
    try {
        entry = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        return [`not readable as JSON: ${err.message}`];
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return ['must be a JSON object'];

    for (const key of REQUIRED) if (!(key in entry)) errors.push(`missing "${key}"`);
    for (const key of Object.keys(entry)) {
        if (!REQUIRED.includes(key) && !OPTIONAL.includes(key)) errors.push(`unknown key "${key}" — a typo, or a field this registry does not carry`);
    }

    if (entry.schema !== SCHEMA) errors.push(`"schema" must be exactly "${SCHEMA}"`);

    const stem = path.basename(file, '.json');
    if (typeof entry.id !== 'string' || !ID.test(entry.id)) {
        errors.push('"id" must be 2-41 characters of a-z 0-9 -');
    } else if (entry.id !== stem) {
        errors.push(`"id" is "${entry.id}" but the file is "${stem}.json" — they must match`);
    }

    if (!LANES.includes(entry.lane)) errors.push(`"lane" must be ${LANES.join(' or ')}`);
    for (const key of ['title', 'description', 'author', 'licence']) {
        if (key in entry && (typeof entry[key] !== 'string' || !entry[key].trim())) errors.push(`"${key}" must be a non-empty string`);
    }
    for (const key of ['version', 'minAppVersion']) {
        if (key in entry && !SEMVER.test(String(entry[key]))) errors.push(`"${key}" must be x.y.z`);
    }
    if ('mediaType' in entry && !MEDIA.includes(entry.mediaType)) errors.push(`"mediaType" must be ${MEDIA.join(', ')} — what the Flow OUTPUTS`);
    if ('requiredModels' in entry && (!Array.isArray(entry.requiredModels) || entry.requiredModels.some(m => typeof m !== 'string' || !m.trim()))) {
        errors.push('"requiredModels" must be a list of model ids (may be empty)');
    }
    if ('homepage' in entry && !httpsUrl(entry.homepage)) errors.push('"homepage" must be an https:// URL');

    // The lane is what decides whether a package folder may exist beside this entry —
    // it is the "catalogue, never a file host" rule, and it is the only check here that
    // looks outside the file.
    const pkg = path.join(path.dirname(file), entry.id || stem);
    if (entry.lane === 'paid') {
        if (!SHA256.test(String(entry.sha256 ?? ''))) errors.push('"sha256" is required on the paid lane: 64 hex characters, the hash of the zip sent for review');
        if (!httpsUrl(entry.download)) errors.push('"download" is required on the paid lane: an https:// URL where a buyer gets it');
        if ('preview' in entry && !httpsUrl(entry.preview)) errors.push('"preview" must be an https:// URL on the paid lane — the package is not in this repo');
        if (fs.existsSync(pkg)) errors.push(`"${pkg}/" exists — a paid package must NOT be committed here. Send the zip privately; the sha256 is the public record.`);
    } else if (entry.lane === 'free') {
        for (const key of ['sha256', 'download']) if (key in entry) errors.push(`"${key}" is for the paid lane only`);
        if (!fs.existsSync(path.join(pkg, 'flow.json'))) errors.push(`"${pkg}/flow.json" not found — a free entry ships its package folder in the same PR`);
        if ('preview' in entry && (typeof entry.preview !== 'string' || entry.preview.includes('/'))) errors.push('"preview" must be a filename inside the package, not a path or a URL');
    }

    markupIn(entry, 'entry', errors);
    return errors;
}

const files = process.argv.slice(2).filter(Boolean);
if (!files.length) {
    console.log('No catalogue entries to check.');
    process.exit(0);
}

let bad = 0;
for (const file of files) {
    const errors = checkEntry(file);
    if (errors.length) {
        bad++;
        console.error(`\n✗ ${file} — ${errors.length} problem(s):`);
        for (const e of errors) console.error(`    • ${e}`);
    } else {
        console.log(`✓ ${file}`);
    }
}
process.exit(bad ? 1 : 0);
