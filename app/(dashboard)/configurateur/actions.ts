'use server';

import { revalidatePath } from 'next/cache';
import {
  createAccount,
  createVehicleConfiguration,
  getAccounts,
  type SelectAccount
} from '@/lib/db';

export type SaveConfigurationData = {
  vehicleId: number;
  accountId?: number;
  modelName: string;
  finishName: string;
  colorName: string;
  selectedOptions: string[]; // IDs des options sélectionnées
  selectedAccessories: string[]; // IDs des accessoires sélectionnés
  financingType: string;
  financingDuration: number;
  financingDownPayment: number;
  insurancePlan: {
    id: string;
    name: string;
    monthlyPrice: number;
  };
  monthlyPayment: number;
  totalPrice: number;
  // Pour créer un nouveau compte si nécessaire
  newAccount?: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
  };
};

export async function saveConfiguration(data: SaveConfigurationData) {
  try {
    let accountId = data.accountId;

    // Si un nouveau compte doit être créé
    if (data.newAccount && !accountId) {
      const newAccount = await createAccount({
        companyName: data.newAccount.companyName,
        contactName: data.newAccount.contactName,
        email: data.newAccount.email,
        phone: data.newAccount.phone || null,
        address: null,
        website: null,
        industry: null
      });
      accountId = newAccount.id;
    }

    // Créer la configuration
    const configuration = await createVehicleConfiguration({
      vehicleId: data.vehicleId,
      accountId: accountId || null,
      customerName: data.newAccount?.contactName || null,
      customerEmail: data.newAccount?.email || null,
      modelName: data.modelName,
      finishName: data.finishName,
      colorName: data.colorName,
      selectedOptions: JSON.stringify(data.selectedOptions),
      selectedAccessories: JSON.stringify(data.selectedAccessories),
      financingType: data.financingType,
      financingDuration: data.financingDuration,
      financingDownPayment: data.financingDownPayment.toString(),
      insurancePlan: JSON.stringify(data.insurancePlan),
      monthlyPayment: data.monthlyPayment.toString(),
      totalPrice: data.totalPrice.toString(),
      status: 'brouillon'
    });

    // Revalider les pages concernées
    revalidatePath('/configurateur');
    if (accountId) {
      revalidatePath(`/customers/${accountId}`);
      revalidatePath('/customers');
    }

    return {
      success: true,
      configurationId: configuration.id,
      accountId: accountId
    };
  } catch (error) {
    console.error('Error saving configuration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function getAccountsList(): Promise<SelectAccount[]> {
  return await getAccounts();
}


