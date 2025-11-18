'use client';

import { useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importVehiclesAction } from './import-vehicles-action';

type Status = {
  type: 'idle' | 'success' | 'error';
  message?: string;
};

type VehicleImportFormProps = {
  initialCount: number;
};

export function VehicleImportForm({ initialCount }: VehicleImportFormProps) {
  const [status, setStatus] = useState<Status>({ type: 'idle' });
  const [pending, startTransition] = useTransition();
  const [availableCount, setAvailableCount] = useState(initialCount);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setStatus({ type: 'error', message: 'Sélectionnez un fichier avant de lancer l\'import.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await importVehiclesAction(formData);

      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setAvailableCount((prev) => result.count ?? prev);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="vehicleFile">Fichier Excel</Label>
        <Input
          ref={fileInputRef}
          id="vehicleFile"
          type="file"
          accept=".xlsx,.xls,.csv"
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          Format attendu : colonne A = modèle, colonne B = finition. Un export CSV fonctionne également.
        </p>
      </div>
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? 'Import en cours…' : 'Mettre à jour la base véhicules'}
      </Button>
      {status.message && (
        <p className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Combinaisons actuellement disponibles : {availableCount}
      </p>
    </form>
  );
}
