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
    './src/components/ui/badge.tsx',
    './src/components/ui/checkbox.tsx',
    './src/components/ui/dialog.tsx',
    './src/components/ui/label.tsx',
    './src/components/ui/select.tsx',
    './src/components/ui/switch.tsx',
    './src/styles/pages.css',
  ],
  theme: sharedTheme,
  plugins: [],
};
