import { getVehicles } from '@/lib/db';
import { VehicleConfiguratorClient } from './configurator-client';

export const revalidate = 0;

export default async function VehicleConfiguratorPage() {
  const vehicles = await getVehicles();
  return <VehicleConfiguratorClient vehicles={vehicles} />;
}
