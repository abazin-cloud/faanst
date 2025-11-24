'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useShowroomMode } from '@/lib/showroom-mode-context';
import { Store } from 'lucide-react';

export function ShowroomModeToggle() {
  const { isShowroomMode, toggleShowroomMode } = useShowroomMode();

  return (
    <div className="flex items-center gap-2 border-r pr-4 mr-4">
      <Store className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Label htmlFor="showroom-mode" className="text-sm cursor-pointer whitespace-nowrap">
          Mode Salon
        </Label>
        <Switch
          id="showroom-mode"
          checked={isShowroomMode}
          onCheckedChange={toggleShowroomMode}
        />
      </div>
    </div>
  );
}














