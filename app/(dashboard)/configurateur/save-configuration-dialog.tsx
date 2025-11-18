'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { saveConfiguration, getAccountsList, type SaveConfigurationData } from './actions';
import type { SelectAccount } from '@/lib/db';
import { Loader2, CheckCircle2 } from 'lucide-react';

type SaveConfigurationDialogProps = {
  configurationData: Omit<SaveConfigurationData, 'accountId' | 'newAccount'>;
  preselectedAccountId?: number;
  children?: React.ReactNode;
};

export function SaveConfigurationDialog({ configurationData, preselectedAccountId, children }: SaveConfigurationDialogProps) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<SelectAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'existing' | 'new'>(preselectedAccountId ? 'existing' : 'existing');
  
  // Pour lier à un compte existant
  const [selectedAccountId, setSelectedAccountId] = useState<string>(preselectedAccountId?.toString() ?? '');
  
  // Pour créer un nouveau compte
  const [newAccountData, setNewAccountData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: ''
  });

  const router = useRouter();

  useEffect(() => {
    if (open) {
      getAccountsList().then(setAccounts);
    }
  }, [open]);

  // Pré-remplir le compte si fourni
  useEffect(() => {
    if (preselectedAccountId) {
      setSelectedAccountId(preselectedAccountId.toString());
      setMode('existing');
    }
  }, [preselectedAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: SaveConfigurationData = {
        ...configurationData,
        accountId: mode === 'existing' && selectedAccountId ? parseInt(selectedAccountId) : undefined,
        newAccount: mode === 'new' ? newAccountData : undefined
      };

      const result = await saveConfiguration(data);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          if (result.accountId) {
            router.push(`/customers/${result.accountId}`);
          }
        }, 1500);
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (mode === 'existing') {
      return selectedAccountId !== '';
    } else {
      return (
        newAccountData.companyName.trim() !== '' &&
        newAccountData.contactName.trim() !== '' &&
        newAccountData.email.trim() !== ''
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full" variant="secondary">
            Enregistrer cette configuration
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enregistrer la configuration</DialogTitle>
          <DialogDescription>
            Liez cette configuration à un compte client existant ou créez un nouveau compte.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Configuration enregistrée !</p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirection vers le compte client...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'existing' | 'new')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">
                  Compte existant
                  {preselectedAccountId && ' (pré-sélectionné)'}
                </TabsTrigger>
                <TabsTrigger value="new">Nouveau compte</TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Sélectionner un compte</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Choisir un compte client" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.companyName} - {account.contactName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {preselectedAccountId && selectedAccountId === preselectedAccountId.toString() && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Configuration sera liée à ce compte automatiquement
                    </p>
                  )}
                  {accounts.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Aucun compte disponible. Créez-en un dans l'onglet "Nouveau compte".
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: SARL Martin"
                    value={newAccountData.companyName}
                    onChange={(e) =>
                      setNewAccountData({ ...newAccountData, companyName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nom du contact *</Label>
                  <Input
                    id="contactName"
                    placeholder="Ex: Jean Martin"
                    value={newAccountData.contactName}
                    onChange={(e) =>
                      setNewAccountData({ ...newAccountData, contactName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: j.martin@exemple.fr"
                    value={newAccountData.email}
                    onChange={(e) =>
                      setNewAccountData({ ...newAccountData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: 06 12 34 56 78"
                    value={newAccountData.phone}
                    onChange={(e) =>
                      setNewAccountData({ ...newAccountData, phone: e.target.value })
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !isFormValid()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

