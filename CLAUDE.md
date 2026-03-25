# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser extension built with the WXT framework, providing timestamp conversion and storage cleaning tools. The project has been streamlined to focus on core functionality, removing complex features like recording and playback.

## Core Commands

### Development
- `npm run dev` - Start development mode for Chrome
- `npm run dev:firefox` - Start development mode for Firefox
- `npm run build` - Build production version for Chrome
- `npm run build:firefox` - Build production version for Firefox
- `npm run zip` - Package Chrome extension
- `npm run zip:firefox` - Package Firefox extension
- `npm run compile` - TypeScript type checking (no file generation)
- `npm run lint` - Run ESLint with zero warnings allowed

### Dependencies & Setup
- `npm install` - Install dependencies (automatically runs `wxt prepare` via postinstall hook)
- The `prepare` hook initializes Husky Git hooks

### CI/CD
- GitHub Actions workflow: `.github/workflows/node.js.yml`
- Triggers on push to main branch or pull requests
- Uses Node.js 20.x and 22.x for multi-version testing
- Runs ESLint, TypeScript compilation, and build steps
- Test commands are currently commented (project has no tests)

## Project Architecture

### Tech Stack
- **Framework**: WXT (Web Extension Toolkit) - browser extension development framework
- **Frontend**: React 19 + TypeScript
- **UI Library**: Material UI (MUI)
- **Date Handling**: dayjs (with UTC and timezone plugins)
- **Communication**: @webext-core/messaging
- **Storage**: Chrome Storage API with type-safe wrapper

### Directory Structure
```
├── entrypoints/          # Browser extension entry points
│   ├── background.ts     # Background script (handles extension install/update, injects content scripts)
│   ├── content.ts        # Content script (injected into pages, currently placeholder)
│   ├── popup/            # Extension popup interface
│   │   ├── App.tsx       # Popup main application (handles page routing)
│   │   ├── main.tsx      # Popup entry point
│   │   ├── index.html    # Popup HTML
│   │   └── pages/        # Popup pages
│   │       ├── TimestampPage.tsx      # Timestamp conversion page (core feature)
│   │       └── StorageCleanerPage.tsx # Storage cleaning page (added feature)
│   └── options/          # Options page (currently static HTML)
│       └── index.html    # Options page HTML
├── utils/                # Utility functions
│   ├── chromeStorage.ts  # Chrome Storage utility (type-safe wrapper)
│   ├── dayjs.ts          # dayjs configuration (UTC + timezone plugins)
│   ├── messages.tsx      # Extension messaging protocol (@webext-core/messaging)
│   └── storageCleaner.ts # Storage cleaning utilities (new feature)
├── types/                # TypeScript type definitions
│   └── storage.d.ts      # StorageSchema type definitions
├── constants/            # Constants (currently empty)
└── public/               # Static assets
```

### Core Features

#### Timestamp Conversion Tool (`entrypoints/popup/pages/TimestampPage.tsx`)
- Real-time current timestamp display (milliseconds/seconds toggle)
- Timestamp ↔ date/time conversion
- Support for multiple timezones (Asia/Shanghai, America/New_York, Europe/London)
- One-click copy functionality
- Input validation and error handling

#### Storage Cleaning Tool (`entrypoints/popup/pages/StorageCleanerPage.tsx`)
- Automatically reads current domain
- Cleans multiple storage types: localStorage, sessionStorage, IndexedDB, Cookies, Cache Storage, Service Workers
- User-selectable storage types (all selected by default)
- Confirmation dialog to prevent accidental cleaning
- Cleaning result statistics display
- Auto-refresh page after cleaning option
- User preferences persistence

### Extension Entry Points

#### Background Script (`entrypoints/background.ts`)
- Listens for extension installation/update events
- Automatically injects content scripts into all valid tabs
- Filters restricted protocols (chrome://, about://, etc.)

#### Content Script (`entrypoints/content.ts`)
- Matches all URLs (`<all_urls>`)
- Runs at document start
- Currently a placeholder with no actual logic

#### Popup (`entrypoints/popup/`)
- Main entry displays TimestampPage by default
- Tab-based navigation between timestamp conversion and storage cleaning
- Route persistence: remembers last visited page when popup is reopened

#### Options Page (`entrypoints/options/`)
- Currently a static HTML page
- Can be extended as a settings interface

### Data Storage

Uses Chrome Storage API for persistent storage:
- Type-safe wrapper (`utils/chromeStorage.ts`)
- Interface-based Schema (`types/storage.d.ts`)
- Current storage keys:
  - `app/currentRoute`: Current active page route (default: 'timestamp')
  - `app/visiblePages`: List of visible pages (default: ['timestamp', 'storageCleaner'])
  - `app/lastRoute`: Last accessed route (legacy)
  - `app/theme`: Theme settings
  - `storageCleaner/preferences`: Storage cleaner preferences (autoRefresh, selectedTypes)

### Messaging

Uses `@webext-core/messaging` library for type-safe extension communication:
- Defined in `utils/messages.tsx`
- Current ProtocolMap is empty (reserved for future use)

### Key Configuration Files

#### `wxt.config.ts`
- Enables React module (`@wxt-dev/module-react`)
- Configures manifest permissions and host_permissions
- Uses Terser compression (forces ASCII encoding)
- Configures icons and options page

#### Manifest Permissions
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

## Development Notes

### Browser Compatibility
- Supports Chrome and Firefox browsers
- Uses WXT framework to abstract browser differences

### Code Quality
- ESLint for code checking (zero warnings enforced)
- Husky for Git hook management
- Lint-staged ensures staged files comply (ESLint + TypeScript + Prettier)
- Prettier for code formatting (100 char line width, 2 space indent, single quotes, trailing comma)

### TypeScript Configuration
- Strict mode enabled (`strict: true`)
- `noImplicitAny` set to `false` (allows implicit any)
- Unused variables/parameters cause errors (`noUnusedLocals`, `noUnusedParameters`)
- Module resolution mode: Bundler
- Excludes test files (`**/*.test.tsx`, `**/*.test.ts`) from type checking

### Storage Cleaning Implementation Details
- Cookies: Uses `chrome.cookies` API directly in extension context
- Other storage types: Uses `chrome.scripting.executeScript` to inject cleaning scripts into page context
- Restricted page filtering (chrome://, about://, edge://, view-source://, file://, data://)
- IndexedDB: Uses `indexedDB.databases()` to get database list, handles `onblocked` events
- Service Workers: Unregisters to prevent re-caching
- Cache Storage: Uses `caches` API to clear all caches

### Project History
Recent refactoring (based on git history):
- Removed recording and playback functionality
- Removed test pages
- Streamlined to single-page timestamp tool
- Renamed storage utility class to storageUtil
- Added storage cleaning functionality with persistent preferences
- Added route persistence for popup navigation