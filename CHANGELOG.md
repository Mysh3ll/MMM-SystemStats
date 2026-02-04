# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial public project setup and contributor guide (`AGENTS.md`).
- Production-ready `package.json` metadata and standard scripts (`lint`, `lint:fix`, `format`, `format:check`, `test`).
- ESLint + Prettier baseline configuration (`.eslintrc.cjs`, `eslint.config.cjs`, `.prettierrc`).
- JetBrains ignores in `.gitignore` (`.idea/`, `*.iml`, `out/`).
- Runtime implementation for MagicMirror module UI (`MMM-SystemStats.js`) and backend helper (`node_helper.js`).
- New module stylesheet `MMM-SystemStats.css`.
- Translation support and locale files (`translations/en.json`, `translations/fr.json`).
- Threshold-based metric coloring (CPU, temperature, RAM, disk).
- Retry/backoff mechanism on repeated metric errors.

### Changed

- README converted to English and expanded with install/config/options documentation.
- Metric labels now use i18n keys instead of hardcoded strings.
- Uptime label in French changed to `Actif`.
- CSS loading switched to module stylesheet (`MMM-SystemStats.css`).

### Removed

- Deprecated `styles/main.css` and empty `styles/` directory.
