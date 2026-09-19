# The catalogue entry — `flows/<id>.json`

One file per Flow. Mostly your manifest's own header fields, copied across, so the
catalogue can list a Flow without holding it.

`scripts/check-entry.mjs` is the authority; this page describes what it enforces.
Run it yourself before opening a PR:

```bash
node scripts/check-entry.mjs flows/my-flow.json
```

## Free lane

```json
{
  "schema": "cubric/flow-registry/entry/v1",
  "id": "my-flow",
  "lane": "free",
  "title": "My Flow",
  "description": "One sentence. What it does, not how clever it is.",
  "version": "1.0.0",
  "author": "Your Name",
  "licence": "MIT",
  "homepage": "https://example.com/my-flow",
  "minAppVersion": "2.0.0",
  "mediaType": "image",
  "requiredModels": ["qwen-edit"],
  "preview": "preview.webp"
}
```

## Paid lane

```json
{
  "schema": "cubric/flow-registry/entry/v1",
  "id": "my-paid-flow",
  "lane": "paid",
  "title": "My Paid Flow",
  "description": "One sentence.",
  "version": "1.0.0",
  "author": "Your Name",
  "licence": "All rights reserved",
  "homepage": "https://example.com/my-paid-flow",
  "minAppVersion": "2.0.0",
  "mediaType": "video",
  "requiredModels": ["ltx-2-3"],
  "preview": "https://example.com/my-paid-flow/preview.webp",
  "download": "https://example.com/buy/my-paid-flow",
  "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
}
```

## Fields

| Field | Lane | What |
|---|---|---|
| `schema` | both | Exactly `cubric/flow-registry/entry/v1`. |
| `id` | both | 2–41 chars, `a-z 0-9 -`. **Must equal the filename stem**, and your manifest `id`, and (free lane) the package folder name. Installs as `user:<id>`. |
| `lane` | both | `free` or `paid`. |
| `title` | both | What the Library tile says. |
| `description` | both | One sentence. |
| `version` | both | `x.y.z`, matching the manifest. |
| `author` | both | A person or a studio. |
| `licence` | both | The Flow's own licence, copied from the manifest. Never blank — "All rights reserved" is a valid answer. |
| `minAppVersion` | both | `x.y.z`. The floor from `compat.minAppVersion`. |
| `mediaType` | both | `image`, `video` or `audio` — what it OUTPUTS. |
| `requiredModels` | both | The model ids the graph needs, as the app declares them. May be `[]`. |
| `homepage` | optional | `https://…` |
| `preview` | optional | Free lane: a filename inside your package. Paid lane: an `https://…` image. |
| `download` | **paid, required** | `https://…` — where a buyer gets it. |
| `sha256` | **paid, required** | 64 hex characters. The hash of the exact zip sent for review. |

## Two rules the checker enforces that are not about a field

- **No markup.** No `<`, `>`, `"` or `` ` `` in any string. Same rule as the app: this
  text reaches HTML. Use curly quotes — “ ” ‘ ’.
- **The lane decides whether a folder may exist.** A `free` entry requires
  `flows/<id>/flow.json` in the same PR. A `paid` entry requires that
  `flows/<id>/` does **not** exist — a paid package never enters this repo.

Unknown top-level keys are an error, so a typo is caught rather than silently
ignored.
