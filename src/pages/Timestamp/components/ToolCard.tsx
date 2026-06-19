import React from 'react';
import { cn } from '@/lib/utils';
import { CARD_CLASS } from '../constants';

interface ToolCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function ToolCard({ children, className, ...props }: ToolCardProps) {
  return (
    <div className={cn(CARD_CLASS, className)} {...props}>
      {children}
    </div>
  );
}
