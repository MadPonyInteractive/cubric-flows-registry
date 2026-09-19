<!--
  Submitting a Flow. Delete the lane that does not apply, and the parts of this
  comment you no longer need.

  Read first: https://github.com/MadPonyInteractive/Cubric-Studio/blob/master/docs/flow-packages.md
  Entry fields: flows/README.md
-->

## The Flow

- **Id:** `<id>` <!-- manifest id == entry filename == folder name -->
- **Title:**
- **What it does, in one sentence:**
- **Lane:** free / paid
- **Licence:**
- **Needs app version:** <!-- compat.minAppVersion -->
- **Models it needs:**

## Before you opened this

- [ ] I read [docs/flow-packages.md](https://github.com/MadPonyInteractive/Cubric-Studio/blob/master/docs/flow-packages.md).
- [ ] I put my ComfyUI on the app's pins — `node scripts/install-flow-devkit.mjs "<my comfyui folder>"`.
- [ ] I linted locally with a ComfyUI running, so the **node classes** were checked:
      `COMFY_PATH=<folder> node scripts/lint-flow-package.mjs <my package>` — clean.
- [ ] `node scripts/check-entry.mjs flows/<id>.json` — clean.
- [ ] No absolute paths, personal filenames or keys in the graph.
- [ ] `requiredModels` matches what the graph actually loads.
- [ ] I have the right to ship every asset in the package, and `licence` says what that is.

> CI cannot check node classes or node-pack drift — a GitHub runner has no ComfyUI.
> Those two boxes are the part only you can do, and a green tick does not replace them.

---

### Free lane

- [ ] `flows/<id>.json` — the catalogue entry.
- [ ] `flows/<id>/` — the package, exactly as it installs (`flow.json`,
      `workflow.json`, previews; flat, no subfolders).

### Paid lane

- [ ] `flows/<id>.json` only. **No package folder** — CI rejects one.
- [ ] `download` points at where a buyer gets it.
- [ ] `sha256` is the hash of the exact zip I am sending for review.
- [ ] I have emailed the zip. <!-- address in the README -->

Hash it yourself before you paste it:

```bash
sha256sum my-flow.zip            # Linux / macOS
certutil -hashfile my-flow.zip SHA256   # Windows
```

---

### Anything the reviewer should know

<!-- Quirks, a model that needs a licence accepted, a step that is slow, anything
     that would otherwise read as a bug. -->
