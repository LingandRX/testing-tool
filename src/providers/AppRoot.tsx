import React from 'react';
import { ThemeModeProvider } from './ThemeModeProvider';
import { RouterProvider } from './RouterProvider'; // 💡 1. 全局合龙：引入满血重构的路由中枢

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
