# Publishing to npm

This guide covers how to publish `@everllence/ngx-chain-functional-guards` to npm.

## Prerequisites

- Push access to the repository
- Trusted publishing configured on npmjs.com (OIDC — no npm token needed)

> Trusted publishing is configured via npmjs.com → Package Settings → Trusted Publisher → GitHub Actions.
> It uses OIDC so the workflow authenticates automatically without any stored secrets.

## Release via GitHub Release (recommended)

1. Bump the version in `libs/ngx-chain-functional-guards/package.json`
2. Commit and merge to `main`:
   ```bash
   git commit -m "chore: bump version to X.Y.Z"
   ```
3. Go to **GitHub → Releases → Draft a new release**
4. Create a new tag matching the version (e.g. `v19.2.0`)
5. Add release notes describing the changes
6. Click **Publish release**

The **Publish to NPM** workflow triggers automatically, which will:

- Install dependencies
- Run tests and linting
- Build the library via `nx build`
- Publish to npm from `dist/libs/ngx-chain-functional-guards`

## Manual publish (escape hatch)

Use this for hotfixes or re-publishes if something went wrong.

1. Go to **GitHub → Actions → Publish to NPM**
2. Click **Run workflow**
3. Optionally enter a version override (otherwise uses `package.json`)
4. The workflow builds, publishes, and creates a git tag automatically

## Versioning

We follow [semver](https://semver.org/):

- **patch** (19.1.1) — bug fixes, no API changes
- **minor** (19.2.0) — new features, backwards compatible
- **major** (20.0.0) — breaking changes

You can use `npm version` to bump locally:

```bash
npm version patch  # 19.1.0 → 19.1.1
npm version minor  # 19.1.0 → 19.2.0
npm version major  # 19.1.0 → 20.0.0
```

> **Note:** Run `npm version` from the repo root or the library directory depending on which `package.json` you want to update.

## Verifying a release

After publishing, verify the package is live:

```bash
npm view @everllence/ngx-chain-functional-guards version
```
