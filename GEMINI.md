# Testing Tools Browser Extension - Gemini Instructions

This document provides essential context and instructions for AI agents working on the Testing Tools browser extension project.

## Project Overview

**Testing Tools** is a lightweight, feature-rich browser extension built with the [WXT (Web Extension Toolkit)](https://wxt.dev/) framework. It provides a suite of utilities for developers and testers, including timestamp conversion, storage management, URL shortcuts, and QR code tools.

### Tech Stack

- **Framework:** WXT (Web Extension Toolkit)
- **Frontend:** React 19 + TypeScript
- **UI Library:** Material UI (MUI) @7.x
- **Date Handling:** dayjs (with UTC and timezone plugins)
- **Messaging:** @webext-core/messaging
- **Storage:** Type-safe Chrome Storage API wrapper
- **Testing:** Vitest + Testing Library (jsdom)

### Architecture & Directory Structure

- `entrypoints/`: Extension entry points (popup, options, sidepanel, background, content).
  - `popup/`: Main UI shown when clicking the extension icon.
  - `options/`: Extension settings page.
  - `sidepanel/`: Browser side panel integration.
  - `background.ts`: Background script for lifecycle management and background tasks.
  - `content.ts`: Content script injected into web pages.
- `components/`: Reusable React components.
- `config/`: Application configuration, including routes and themes.
- `providers/`: React Context providers (e.g., `RouterProvider`).
- `utils/`: Utility functions and service abstractions.
  - `chromeStorage.ts`: Type-safe storage utility.
- `types/`: Global TypeScript type definitions.
- `public/`: Static assets (icons, etc.).

## Building and Running

### Development

- `npm run dev`: Start Chrome development mode with HMR.
- `npm run dev:firefox`: Start Firefox development mode.
- `npm run compile`: Run TypeScript type checking (`tsc --noEmit`).

### Production

- `npm run build`: Build production version for Chrome.
- `npm run build:firefox`: Build production version for Firefox.
- `npm run zip`: Package the extension for Chrome Web Store.
- `npm run zip:firefox`: Package the extension for Firefox Add-ons.

### Testing & Linting

- `npm run test`: Run all tests once.
- `npm run test:watch`: Run tests in watch mode.
- `npm run test:coverage`: Run tests and generate coverage report.
- `npm run lint`: Run ESLint checks.

## Development Conventions

### Coding Style

- **TypeScript:** Use strict typing. Prefer interfaces for object structures and types for unions/aliases.
- **Components:** Functional components with Hooks. Use MUI components for consistent UI.
- **Storage:** Always use `storageUtil` from `@/utils/chromeStorage.ts` for accessing `chrome.storage.local`. Ensure keys are defined in `StorageSchema` in `@/types/storage.d.ts`.
- **Messaging:** Use `@webext-core/messaging` for communication between entry points. Define message types in `@/utils/messages.ts`.

### Testing Practices

- **Framework:** Vitest with `jsdom` environment.
- **Location:** Place tests in `__tests__` directories adjacent to the files being tested.
- **Naming:** Follow `*.test.ts` or `*.test.tsx` naming convention.
- **Patterns:** Use `@testing-library/react` for component testing. Prefer `user-event` (v14+) for simulating interactions.

### CI/CD

- **GitHub Actions:** CI runs on push/PR to `main` and `develop` branches (lint, compile, test, build).
- **Releases:** Automatic release to GitHub on pushing a `v*` tag.

## Key Considerations for AI Agents

- **Manifest Permissions:** When adding features that require new browser APIs, update `wxt.config.ts`.
- **Browser Compatibility:** Ensure features work in both Chrome and Firefox.
- **React 19:** Be aware of React 19 specific features and deprecations.
- **WXT Modules:** The project uses `@wxt-dev/module-react`.
