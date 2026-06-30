import { sharedTheme } from './tailwind.shared.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/entrypoints/**/*.{js,ts,jsx,tsx}',
    './src/layout/**/*.{js,ts,jsx,tsx}',
    './src/providers/**/*.{js,ts,jsx,tsx}',
    './src/components/RouterContainer.tsx',
    './src/components/ErrorBoundary.tsx',
    './src/components/ErrorFallback.tsx',
    './src/components/PageErrorBoundary.tsx',
    './src/components/PageSkeleton.tsx',
    './src/components/ui/button.tsx',
    './src/components/ui/input.tsx',
    './src/components/ui/sonner.tsx',
    './src/styles/shell.css',
  ],
  theme: sharedTheme,
  plugins: [],
};
