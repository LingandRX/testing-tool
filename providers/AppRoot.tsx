import React from 'react';
import { ThemeModeProvider } from './ThemeModeProvider';

interface AppRootProps {
  children: React.ReactNode;
}

export default function AppRoot({ children }: AppRootProps) {
  return (
    <React.StrictMode>
      <ThemeModeProvider>{children}</ThemeModeProvider>
    </React.StrictMode>
  );
}
