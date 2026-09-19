# Cubric Flows Registry

The public catalogue of community **Flows** for [Cubric Studio](https://github.com/MadPonyInteractive/Cubric-Studio).

Open a pull request, CI checks your Flow, and a merge lists it. That merge is also
the public record that MadPony Interactive reviewed and accepted it.

> **This is a catalogue, not a file host and not a shop.** There are no accounts, no
> checkout and no payment rail here. A free Flow is hosted here because it is small
> and it is data; a paid Flow is listed here and sold wherever its author sells it.

---

## What a Flow is

A **Flow package** is a folder holding a manifest, a ComfyUI graph and preview
images. No code. Drop it on the Flow Library in Cubric Studio and it appears next
to the built-in Flows.

The format is documented in the app repo, and that document is the authority — not
this README:

**[docs/flow-packages.md](https://github.com/MadPonyInteractive/Cubric-Studio/blob/master/docs/flow-packages.md)**

Read it first. In particular the **title law** (the app writes into nodes titled
`Input_*` and reads from nodes titled `Output_*`, and silently skips a title with
no node), and the **one security rule** — a manifest string containing `<`, `>`,
`"` or `` ` `` rejects the whole package, because that text reaches HTML.

## Match your ComfyUI to the release first

A graph built on a node pack the app does not ship works for you and fails for
everyone else. The app publishes its exact pin set, and ships an installer that
puts your own ComfyUI on it:

```bash
node scripts/install-flow-devkit.mjs "C:/ComfyUI_windows_portable"
```

```bash
node scripts/install-flow-devkit.mjs "C:/ComfyUI_windows_portable" --check
```

Then lint locally before you open anything — same validator CI runs, plus the node
classes and the pack-drift report CI cannot do:

```bash
COMFY_PATH=/path/to/ComfyUI node scripts/lint-flow-package.mjs path/to/my-flow
```

Both scripts are dependency-free: a checkout of the app repo and Node 18+, no
`npm install`.

---

## The two lanes

| | **Free** | **Paid** |
|---|---|---|
| The PR carries | `flows/<id>.json` **and** the package folder `flows/<id>/` | `flows/<id>.json` **only** |
| Where the package lives | here, in this repo | your storefront — never here |
| The zip's `sha256` | not needed | **required** in the entry |
| CI runs | the entry check **and** the package linter | the entry check |
| Who reviews the graph | CI, then a human | a human, privately, on the zip you send |
| A merge means | listed, and hosted here | listed, and reviewed |

**The paid lane's `sha256` is the point of it.** You publish the hash of the exact
zip we reviewed. A buyer can hash what they downloaded and see it matches. That is
what makes a listing here worth anything when the file itself is somewhere we do
not control.

Send the paid-lane zip to **`<TBD — email>`** *(this address is not set yet; the
registry opens with Cubric Studio 2.0 and it will be filled in before then).*

---

## Submitting

1. Read [docs/flow-packages.md](https://github.com/MadPonyInteractive/Cubric-Studio/blob/master/docs/flow-packages.md) and lint your package locally until it is clean.
2. Fork this repo.
3. Add `flows/<id>.json` — the catalogue entry. Fields: **[flows/README.md](flows/README.md)**.
4. **Free lane only:** add the package folder at `flows/<id>/`, exactly as it
   installs (`flow.json`, `workflow.json`, previews — flat, no subfolders).
   **Paid lane:** do not add a folder. CI rejects a paid entry that has one.
5. Open the PR and fill in the template.
6. **Paid lane:** email the zip. Its `sha256` must match the entry.

`<id>` is your Flow's manifest `id`, and the entry filename, and the folder name.
All three, identical. It installs into the app as `user:<id>`.

---

## What CI checks — and what it does not

CI checks out the app at a pinned release and runs **the same validator the app
itself runs** on `user_flows/`. Its result is only ever a statement about that
release.

**Checked:**

- the catalogue entry — required fields, id matches filename, semver, licence
  present, the no-markup rule, and for a paid entry a real 64-hex `sha256` and no
  package folder;
- **free lane:** the whole package through the app's own validator — manifest shape,
  the title law, every `Input_*` reachable from an `Output_*`, no absolute paths in
  widgets, and every model / dep / plugin / injector id resolving against the pinned
  release;
- `compat.minAppVersion` against that release's version.

**NOT checked, and you must not read a green tick as saying otherwise:**

- **node classes.** That needs a running ComfyUI, and a GitHub runner has none. Only
  your local lint with `COMFY_URL` can tell you every class exists.
- **pack drift.** That needs a ComfyUI folder, for the same reason. Only your local
  lint with `COMFY_PATH` can tell you whether a clean class check is worth anything.
- **whether the Flow produces a good result.** That is the human half of the review.

The pin is in one place — `STUDIO_REF` in
[.github/workflows/lint-submission.yml](.github/workflows/lint-submission.yml).
It is the app version this registry lists for, so a Flow whose `minAppVersion` is
higher than the pin fails on purpose: it does not run for the people reading this
catalogue yet.

---

## The review, and the decision

Every submission is reviewed against this list, in public, in the PR:

- [ ] CI is green.
- [ ] The manifest's `id`, entry filename and folder name are the same string.
- [ ] `licence` is a real licence, and the author has the right to ship every
      asset in the package.
- [ ] Previews show what the Flow actually produces.
- [ ] `requiredModels` matches what the graph loads — no model listed that the
      graph never uses, and none used that it never lists.
- [ ] The graph carries no absolute paths, no personal file names, no API keys.
- [ ] The Flow does something the built-in Flows do not already do.
- [ ] **Paid lane:** the emailed zip's `sha256` matches the entry, and the zip
      lints clean locally.

**Decisions are public.** Accepted is a merge. Declined is a closed PR with the
reason written in it. MadPony Interactive chooses what is listed here, and that
choice is visible: no submission disappears quietly, and a decline says why and
what would change it.

A decline is not a ban. Fix it and open another PR.

---

## Removal

Ask, in an issue, and your entry comes out. It is your Flow. A listing removed
does not reach people who already installed the package — they keep it.

MadPony Interactive removes a listing without asking only for a licence or safety
problem, and says so in the issue.

---

## Licence

This repository is **MIT** — see [LICENSE](LICENSE).

**Every Flow keeps its own.** MIT here covers the templates, the checks and the
catalogue entries. It does not touch your Flow. Listing it does not relicense it
and does not assign anything to MadPony Interactive, whatever its `licence` field
says.
