import { sharedTheme } from './tailwind.shared.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/CopyButton.tsx',
    './src/components/TextInputArea.tsx',
    './src/components/SwitchButtonGroup.tsx',
    './src/components/EmptyPlaceholder.tsx',
    './src/components/ui/*.tsx',
    './src/styles/pages.css',
  ],
  theme: sharedTheme,
  plugins: [],
};
