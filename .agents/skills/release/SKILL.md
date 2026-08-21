---
name: release
description: >-
  Ship a new production version of the DengueChatPlus mobile app to the App
  Store and Play Store: bump the app version, open the develop → main pull
  request, tag the release, and sync the branches back up. Use whenever the
  user wants to cut, ship, or publish a release, even when they phrase it
  without the word "release" — "ship 1.14", "cut a new version", "push this to
  production", "get this into the stores". Not for one-off or staging EAS
  builds, `eas update` OTA pushes, EAS build configuration, or bumping Expo
  SDK and dependency versions.
---

# Release

Ships a new version to production by merging `develop` into `main`.

## How this repo deploys

Branches are deployment triggers, wired up in the EAS dashboard (not in this
repo — there is no `.github/workflows`):

- **`develop`** → staging build, Android only, points at the staging server.
- **`main`** → production build, **both platforms, auto-submitted to the App
  Store and Play Store**, points at the production server.

Merging to `main` therefore pushes binaries to Apple and Google. It is the one
irreversible step in this process. Always confirm with the user before it.

## Version numbers

`package.json` is the single source of truth. `app.config.ts` imports it — do
not add a second `version` field there.

Build numbers are **not** in the repo. `eas.json` sets
`appVersionSource: "remote"` with `autoIncrement`, so EAS owns `buildNumber` and
`versionCode` server-side. Never reintroduce them into `app.config.ts`.

Tags are `vX.Y.Z` — no dot after the `v`. (Tags like `v.1.1.2` are legacy, and
`v1.12.2` / `v1.13.0` were never pushed. Do not imitate either.)

## Steps

### 1. Preflight

```bash
git checkout develop && git pull origin develop && git fetch origin main
git status --porcelain                              # must be empty
git log --oneline origin/main..origin/develop       # what is about to ship
```

Stop and tell the user if the tree is dirty, or if `origin/main..origin/develop`
is empty — there is nothing to release.

### 2. Pick the version

Read the current version from `package.json`. Propose the next one based on
what's in the range from step 1 (features → minor, fixes only → patch), then
**ask the user to confirm** before bumping. Do not guess silently.

### 3. Bump and push to develop

Edit the `version` field in `package.json` only.

```bash
git commit -am "chore: bump app version to X.Y.Z"
git push origin develop
```

This triggers a staging Android build carrying the exact version about to ship.
It is the last chance to test the real release before the stores get it.

### 4. Open the release PR

```bash
gh pr create --base main --head develop --title "Release vX.Y.Z" --body "..."
```

Body: a short changelog built from `git log --oneline origin/main..origin/develop`,
grouped by type (feat / fix / chore), with merge commits dropped.

Past releases also linked a Jira release report
(`https://denguechat.atlassian.net/projects/DNG/versions/<id>/tab/release-report-all-issues`).
The `<id>` is not derivable from the repo — ask the user for it, and omit the
link if they don't have one.

### 5. Merge — confirm first

**Stop here and get explicit confirmation.** Merging submits to both stores.

```bash
gh pr merge <number> --merge        # merge commit, matching past releases
```

### 6. Tag the release

The tag is the only durable record of which commit produced a store binary —
`main` keeps moving, so don't skip this.

```bash
git fetch origin main
git tag vX.Y.Z origin/main
git push origin vX.Y.Z
```

### 7. Sync main back to develop

The merge commit lives only on `main`. `develop` is an ancestor of it, so this
fast-forwards cleanly:

```bash
git checkout develop
git merge --ff-only origin/main
git push origin develop
```

If `--ff-only` fails, someone pushed to `develop` mid-release. Stop and tell the
user rather than forcing a merge.

### 8. Report

Give the user the version, the tag, the PR link, and a reminder that the
production build and store submissions are running in EAS.

## Notes

- Neither `develop` nor `main` is branch-protected, so direct pushes work. The
  bump in step 3 does not need its own PR.
- There is no `release/X.Y.Z` branch any more. Old releases used one as a freeze
  point; the flow is now a direct `develop` → `main` PR.
- Hotfixes still branch off `main` (or off the release tag), and PR back into
  `main`. After merging a hotfix, repeat steps 6 and 7.
