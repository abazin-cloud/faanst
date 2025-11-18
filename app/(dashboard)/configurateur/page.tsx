import { VehicleConfiguratorClient } from './configurator-client';
import { getVehicles, getAccountById } from '@/lib/db';

type PageProps = {
  searchParams: Promise<{
    accountId?: string;
  }>;
};

export default async function ConfigurateurPage({ searchParams }: PageProps) {
  const { accountId } = await searchParams;

  const vehicles = await getVehicles();

  // Récupérer le compte si accountId est fourni
  const parsedAccountId = accountId ? parseInt(accountId, 10) : undefined;
  const account =
    parsedAccountId && !isNaN(parsedAccountId)
      ? await getAccountById(parsedAccountId)
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurateur Véhicule</h1>
        <p className="text-muted-foreground">
          {account
            ? `Configuration pour ${account.companyName} - ${account.contactName}`
            : 'Configurez votre véhicule en 4 étapes simples'}
        </p>
      </div>

      <VehicleConfiguratorClient
        vehicles={vehicles}
        preselectedAccountId={parsedAccountId}
      />
    </div>
  );
}
