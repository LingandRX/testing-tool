import React from 'react';
import { ThemeModeProvider } from './ThemeModeProvider';
import { RouterProvider } from './RouterProvider';

interface AppRootProps {
  children: React.ReactNode;
}

export default function AppRoot({ children }: AppRootProps) {
  return (
    <React.StrictMode>
      <ThemeModeProvider>
        <RouterProvider>{children}</RouterProvider>
      </ThemeModeProvider>
    </React.StrictMode>
  );
}
