import { VehicleConfiguratorClient } from './configurator-client';
import { getVehicles, getAccountById } from '@/lib/db';

type PageProps = {
  searchParams: {
    accountId?: string;
  };
};

export default async function ConfigurateurPage({ searchParams }: PageProps) {
  const vehicles = await getVehicles();
  
  // Récupérer le compte si accountId est fourni
  const accountId = searchParams.accountId ? parseInt(searchParams.accountId) : undefined;
  const account = accountId && !isNaN(accountId) ? await getAccountById(accountId) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurateur Véhicule</h1>
        <p className="text-muted-foreground">
          {account 
            ? `Configuration pour ${account.companyName} - ${account.contactName}`
            : 'Configurez votre véhicule en 4 étapes simples'
          }
        </p>
      </div>

      <VehicleConfiguratorClient vehicles={vehicles} preselectedAccountId={accountId} />
    </div>
  );
}
