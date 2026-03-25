# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

A browser extension built with the WXT framework, providing timestamp conversion and storage cleaning tools.

### Essential Commands

| Command                 | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| `npm install`           | Install dependencies (runs `wxt prepare` post-install) |
| `npm run dev`           | Start development mode for Chrome                      |
| `npm run dev:firefox`   | Start development mode for Firefox                     |
| `npm run build`         | Build production version for Chrome                    |
| `npm run build:firefox` | Build production version for Firefox                   |
| `npm run zip`           | Package Chrome extension                               |
| `npm run zip:firefox`   | Package Firefox extension                              |
| `npm run compile`       | TypeScript type checking (no file generation)          |
| `npm run lint`          | Run ESLint with zero warnings allowed                  |

### Setup

- Dependencies install automatically runs `wxt prepare` via postinstall hook
- Husky Git hooks are initialized via `prepare` script

## Architecture Overview

### Tech Stack

- **Framework**: WXT (Web Extension Toolkit)
- **Frontend**: React 19 + TypeScript
- **UI Library**: Material UI (MUI)
- **Date Handling**: dayjs (with UTC and timezone plugins)
- **Communication**: @webext-core/messaging
- **Storage**: Chrome Storage API with type-safe wrapper

### Directory Structure

```
entrypoints/          # Browser extension entry points
├── background.ts     # Background script (injects content scripts)
├── content.ts        # Content script (injected into pages)
├── popup/            # Extension popup interface
│   ├── App.tsx       # Popup main application (handles routing)
│   ├── main.tsx      # Popup entry point
│   ├── index.html    # Popup HTML
│   └── pages/        # Popup pages
│       ├── TimestampPage.tsx      # Timestamp conversion
│       └── StorageCleanerPage.tsx # Storage cleaning
└── options/          # Options page (static HTML)
utils/                # Utility functions
types/                # TypeScript type definitions
public/               # Static assets
```

### Extension Entry Points

- **Background Script**: Listens for install/update events, injects content scripts into valid tabs
- **Content Script**: Matches all URLs (`<all_urls>`), runs at document start (currently placeholder)
- **Popup**: Main interface with tab-based navigation between timestamp conversion and storage cleaning
- **Options Page**: Static HTML page, can be extended as settings interface

## Core Features

### Timestamp Conversion Tool (`entrypoints/popup/pages/TimestampPage.tsx`)

- Real-time current timestamp display (milliseconds/seconds toggle)
- Timestamp ↔ date/time conversion
- Support for multiple timezones (Asia/Shanghai, America/New_York, Europe/London)
- One-click copy functionality
- Input validation and error handling

### Storage Cleaning Tool (`entrypoints/popup/pages/StorageCleanerPage.tsx`)

- Automatically reads current domain
- Cleans multiple storage types: localStorage, sessionStorage, IndexedDB, Cookies, Cache Storage, Service Workers
- User-selectable storage types (all selected by default)
- Confirmation dialog to prevent accidental cleaning
- Cleaning result statistics display
- Auto-refresh page after cleaning option
- User preferences persistence

### Data Storage

Uses Chrome Storage API with type-safe wrapper (`utils/chromeStorage.ts`):

- **Storage Schema** (`types/storage.d.ts`): Interface-based type definitions
- **Current storage keys**:
  - `app/currentRoute`: Current active page route (default: 'timestamp')
  - `app/visiblePages`: List of visible pages (default: ['timestamp', 'storageCleaner'])
  - `app/lastRoute`: Last accessed route (legacy)
  - `app/theme`: Theme settings
  - `storageCleaner/preferences`: Storage cleaner preferences (autoRefresh, selectedTypes)

## Development Workflow

### Browser Compatibility

- Supports Chrome and Firefox browsers
- Uses WXT framework to abstract browser differences

### Code Quality

- **ESLint**: Zero warnings enforced (`npm run lint`)
- **Husky**: Git hook management
- **lint-staged**: Ensures staged files comply (ESLint + TypeScript + Prettier)
- **Prettier**: Code formatting (100 char line width, 2 space indent, single quotes, trailing comma)

### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- `noImplicitAny` set to `false` (allows implicit any)
- Unused variables/parameters cause errors (`noUnusedLocals`, `noUnusedParameters`)
- Module resolution mode: Bundler
- Path alias: `@/*` maps to project root
- Excludes test files from type checking

### Path Aliases

- Use `@/` prefix for project-relative imports (e.g., `@/utils/chromeStorage`)
- Configured in `tsconfig.json` paths

## Configuration & Implementation

### `wxt.config.ts`

- Enables React module (`@wxt-dev/module-react`)
- Configures manifest permissions and host_permissions
- Uses Terser compression (forces ASCII encoding)
- Configures icons and options page

### Manifest Permissions

```typescript
permissions: [
  'storage',           // Chrome Storage
  'unlimitedStorage',  // Unlimited storage
  'clipboardWrite',    // Clipboard write (copy functionality)
  'activeTab',         // Current tab access
  'scripting',         // Script injection
  'tabs',              // Tab management
  'debugger',          // Debugger permissions
  'cookies',           // Cookies access (added for storage cleaning)
],
host_permissions: ['<all_urls>']  // Access all websites
```

### Storage Cleaning Implementation Details

- **Cookies**: Uses `chrome.cookies` API directly in extension context
- **Other storage types**: Uses `chrome.scripting.executeScript` to inject cleaning scripts into page context
- **Restricted page filtering**: chrome://, about://, edge://, view-source://, file://, data://
- **IndexedDB**: Uses `indexedDB.databases()` to get database list, handles `onblocked` events
- **Service Workers**: Unregisters to prevent re-caching
- **Cache Storage**: Uses `caches` API to clear all caches

### Messaging System

- Uses `@webext-core/messaging` library for type-safe extension communication
- Defined in `utils/messages.tsx`
- Current ProtocolMap is empty (reserved for future use)

## CI/CD & Project Context

### GitHub Actions Workflow (`.github/workflows/node.js.yml`)

- Triggers on push to main branch or pull requests
- Uses Node.js 20.x and 22.x for multi-version testing
- Runs ESLint, TypeScript compilation, and build steps
- Test commands are currently commented (project has no tests)

### Project History

Recent refactoring streamlined the project:

- Removed recording and playback functionality
- Removed test pages
- Streamlined to single-page timestamp tool
- Renamed storage utility class to storageUtil
- Added storage cleaning functionality with persistent preferences
- Added route persistence for popup navigation
