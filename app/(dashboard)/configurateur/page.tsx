import { ConfiguratorWizard } from './configurator-wizard';
import { getVehicles, getVehicleOptions } from '@/lib/db';

export default async function ConfigurateurPage() {
  const vehicles = await getVehicles();
  const options = await getVehicleOptions();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurateur Véhicule</h1>
        <p className="text-muted-foreground">
          Configurez votre véhicule en 4 étapes simples
        </p>
      </div>

      <ConfiguratorWizard vehicles={vehicles} options={options} />
    </div>
  );
}
