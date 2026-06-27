import React from 'react';
import { ThemeModeProvider } from './ThemeModeProvider';
import { Toaster } from '@/components/ui/sonner';

interface AppRootProps {
  children: React.ReactNode;
}

export default function AppRoot({ children }: AppRootProps) {
  return (
    <React.StrictMode>
      <ThemeModeProvider>
        {children}
        <Toaster />
      </ThemeModeProvider>
    </React.StrictMode>
  );
}
