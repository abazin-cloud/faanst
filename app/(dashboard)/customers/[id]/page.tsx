import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Car,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';
import {
  getAccountById,
  getVehicleConfigurationsByAccountId,
  getOpportunitiesByAccountId
} from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  const accountId = parseInt(id);

  if (isNaN(accountId)) {
    notFound();
  }

  const account = await getAccountById(accountId);

  if (!account) {
    notFound();
  }

  const configurations = await getVehicleConfigurationsByAccountId(accountId);
  const opportunities = await getOpportunitiesByAccountId(accountId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customers">← Retour aux comptes</Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{account.companyName}</h1>
              <p className="text-muted-foreground">{account.contactName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href={`/configurateur?accountId=${accountId}`}>
              <Car className="h-4 w-4 mr-2" />
              Nouvelle configuration
            </Link>
          </Button>
          <Badge variant="outline" className="text-sm">
            ID: {account.id}
          </Badge>
        </div>
      </div>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>Détails et coordonnées du client</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a
                  href={`mailto:${account.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {account.email}
                </a>
              </div>
            </div>
            {account.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <a
                    href={`tel:${account.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {account.phone}
                  </a>
                </div>
              </div>
            )}
            {account.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Site web</p>
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {account.website}
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {account.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">{account.address}</p>
                </div>
              </div>
            )}
            {account.industry && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Secteur</p>
                  <Badge variant="secondary">{account.industry}</Badge>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Créé le</p>
                <p className="text-sm text-muted-foreground">
                  {account.createdAt
                    ? new Date(account.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Configurations and Opportunities */}
      <Tabs defaultValue="configurations" className="w-full">
        <TabsList>
          <TabsTrigger value="configurations">
            <Car className="h-4 w-4 mr-2" />
            Configurations ({configurations.length})
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            <FileText className="h-4 w-4 mr-2" />
            Opportunités ({opportunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4 mt-4">
          {configurations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground text-center">
                  Aucune configuration de véhicule pour ce compte.
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href={`/configurateur?accountId=${accountId}`}>Créer une configuration</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {configurations.map((config) => (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          {config.modelName || 'Configuration'}
                        </CardTitle>
                        <CardDescription>
                          {config.finishName && `${config.finishName} · `}
                          {config.colorName || 'Standard'}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          config.status === 'accepte'
                            ? 'default'
                            : config.status === 'envoye'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {config.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Prix total</p>
                        <p className="font-semibold">
                          {config.totalPrice ? currency.format(Number(config.totalPrice)) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mensualité</p>
                        <p className="font-semibold">
                          {config.monthlyPayment
                            ? `${currency.format(Number(config.monthlyPayment))} / mois`
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {config.financingType && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Financement</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium capitalize">{config.financingType}</span>
                          {config.financingDuration && (
                            <span className="text-muted-foreground">
                              · {config.financingDuration} mois
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {(config.selectedOptions || config.selectedAccessories) && (
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Options & Accessoires</p>
                        <div className="flex flex-wrap gap-1">
                          {config.selectedOptions &&
                            JSON.parse(config.selectedOptions).length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {JSON.parse(config.selectedOptions).length} option(s)
                              </Badge>
                            )}
                          {config.selectedAccessories &&
                            JSON.parse(config.selectedAccessories).length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {JSON.parse(config.selectedAccessories).length} accessoire(s)
                              </Badge>
                            )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Créée le{' '}
                        {config.createdAt
                          ? new Date(config.createdAt).toLocaleDateString('fr-FR')
                          : '—'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4 mt-4">
          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground text-center">
                  Aucune opportunité pour ce compte.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        {opportunity.description && (
                          <CardDescription>{opportunity.description}</CardDescription>
                        )}
                      </div>
                      <Badge>{opportunity.stage}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Montant</p>
                      <p className="text-lg font-semibold">
                        {currency.format(Number(opportunity.amount))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Probabilité</p>
                      <p className="text-lg font-semibold">{opportunity.probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clôture prévue</p>
                      <p className="text-lg font-semibold">
                        {opportunity.expectedCloseDate
                          ? new Date(opportunity.expectedCloseDate).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

