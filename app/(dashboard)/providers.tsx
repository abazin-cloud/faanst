'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ShowroomModeProvider } from '@/lib/showroom-mode-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShowroomModeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ShowroomModeProvider>
  );
}
