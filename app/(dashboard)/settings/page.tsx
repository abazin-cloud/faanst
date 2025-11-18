import { FileSpreadsheet, Settings as SettingsIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVehicles } from '@/lib/db';
import { VehicleImportForm } from './vehicle-import-form';

export default async function SettingsPage() {
  const vehicles = await getVehicles();
  const grouped = groupVehiclesByModel(vehicles);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-muted-foreground text-sm uppercase font-semibold">
          <SettingsIcon className="h-5 w-5" />
          <span>Paramètres</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Synchronisation du catalogue</h1>
          <p className="text-muted-foreground max-w-3xl">
            Importez un fichier Excel (Modèle / Finition) pour alimenter l’étape 1 du configurateur véhicule.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Importer un fichier Excel</CardTitle>
            <CardDescription>
              Les lignes de la feuille 1 seront utilisées pour mettre à jour la table « vehicles » sur Neon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VehicleImportForm initialCount={vehicles.length} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Référentiel disponible</CardTitle>
            <CardDescription>
              Chaque combinaison importée devient sélectionnable dans la première étape du configurateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {grouped.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <FileSpreadsheet className="h-10 w-10" />
                <p className="mt-2 text-sm">Aucun modèle importé pour l’instant.</p>
                <p className="text-xs">
                  Ajoutez votre premier fichier Excel pour débloquer la sélection de modèles et finitions.
                </p>
              </div>
            )}

            {grouped.map(([model, finishes]) => (
              <div key={model} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-semibold">{model}</p>
                    <p className="text-sm text-muted-foreground">
                      {finishes.length} finition{finishes.length > 1 ? 's' : ''} importée{finishes.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">{finishes.length}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {finishes.map((finish) => (
                    <Badge key={`${model}-${finish}`} variant="outline">
                      {finish}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function groupVehiclesByModel(vehicles: Awaited<ReturnType<typeof getVehicles>>) {
  const map = new Map<string, string[]>();
  for (const vehicle of vehicles) {
    const finishes = map.get(vehicle.model) ?? [];
    if (!finishes.includes(vehicle.finish)) {
      finishes.push(vehicle.finish);
    }
    map.set(vehicle.model, finishes);
  }
  return Array.from(map.entries());
}
