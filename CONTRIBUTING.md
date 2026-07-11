# Contributing

Thanks for your interest in contributing! This document explains how to get set up and what we expect from contributions.

## Development workflow

This project is a monorepo managed with [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains:

- The library package in the root directory
- An example app in the `example/` directory that consumes the library

To get started, install the dependencies from the root of the repo:

```sh
yarn
```

> This project uses Yarn 3 via [Corepack](https://nodejs.org/api/corepack.html). If commands fail, make sure Corepack is enabled (`corepack enable`) and don't use `npm` for installs.

### Running the example app

The example app is the fastest way to test your changes — it imports the library directly from `src/`, so edits to TypeScript code are picked up immediately by Metro.

```sh
# Start Metro
yarn example start

# Run on iOS (installs pods automatically on first run)
yarn example ios

# Run on Android
yarn example android
```

If you change native code (Swift/Kotlin) or the TurboModule spec in `src/`, rebuild the native app:

- iOS: re-run `yarn example ios` (run `pod install` in `example/ios` if the spec changed)
- Android: re-run `yarn example android`

### Checks

Make sure your changes pass TypeScript, linting, and tests before opening a PR:

```sh
yarn typecheck
yarn lint
yarn test
```

Fix formatting/lint issues automatically with:

```sh
yarn lint:fix
```

### Commit messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, enforced by commitlint via a git hook:

- `fix:` — a bug fix
- `feat:` — a new feature
- `docs:` — documentation-only changes
- `test:` — adding or fixing tests
- `chore:` — tooling, CI, or maintenance changes
- Append `!` (e.g. `feat!:`) for breaking changes

Release notes and versioning are generated from commit messages, so please keep them accurate.

## Opening a pull request

1. Fork the repo and create a branch from `main`.
2. Make your changes, including tests for new behavior when applicable.
3. Verify `yarn typecheck`, `yarn lint`, and `yarn test` pass.
4. If your change affects native behavior, test it in the example app on the affected platform(s).
5. Open the PR — the template will ask for a summary and test plan.

For large changes or new features, please [open a discussion](https://github.com/hamzamekk/react-native-turbo-preferences/discussions/new?category=ideas) first so we can align on the approach before you invest time in it.

## Reporting issues

Use the [bug report template](https://github.com/hamzamekk/react-native-turbo-preferences/issues/new/choose) and include a minimal reproduction. Questions and feature requests belong in [Discussions](https://github.com/hamzamekk/react-native-turbo-preferences/discussions).

## Releases

Releases are handled by the maintainer with [release-it](https://github.com/release-it/release-it) (`yarn release`), which bumps the version, generates the changelog from conventional commits, publishes to npm, and creates the GitHub release.

## Code of conduct

By participating in this project you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
