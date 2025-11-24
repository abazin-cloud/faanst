'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { AddLeadDialog } from '../add-lead-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CrmLead } from '@/lib/crm';

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Récupérer l'utilisateur connecté
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success && data.user) {
        // Utiliser salesforceEmail s'il est défini, sinon utiliser l'email normal
        const emailToUse = data.user.salesforceEmail || data.user.email;
        if (emailToUse) {
          setUserEmail(emailToUse);
        } else {
          throw new Error('Aucun email trouvé pour l\'utilisateur');
        }
      } else {
        throw new Error('Impossible de récupérer l\'utilisateur connecté');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current user');
      console.error('Error fetching current user:', err);
    }
  };

  // Charger les leads via la surcouche CRM
  const fetchLeads = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/salesforce/leads?ownerEmail=${encodeURIComponent(userEmail)}&limit=500`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch leads from CRM');
      }

      setAllLeads(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'utilisateur au chargement
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Charger les leads quand l'email est disponible
  useEffect(() => {
    if (userEmail) {
      fetchLeads();
    }
  }, [userEmail]);

  // Mapper la qualification CRM vers notre système
  const mapQualificationStatus = (sfStatus?: string): 'nouveau' | 'qualifie' | 'transforme' => {
    if (!sfStatus) return 'nouveau';
    const lower = sfStatus.toLowerCase();
    if (lower.includes('qualified')) return 'transforme';
    if (lower.includes('working') || lower.includes('contacted')) return 'qualifie';
    return 'nouveau';
  };

  // Filtrer les leads par statut de qualification
  const nouveauLeads = allLeads.filter(
    lead => mapQualificationStatus(lead.status) === 'nouveau'
  );
  const qualifieLeads = allLeads.filter(
    lead => mapQualificationStatus(lead.status) === 'qualifie'
  );
  const transformeLeads = allLeads.filter(
    lead => mapQualificationStatus(lead.status) === 'transforme'
  );

  const getStatusBadgeVariant = (rating?: string) => {
    if (!rating) return 'secondary';
    const lower = rating.toLowerCase();
    if (lower.includes('hot')) return 'destructive';
    if (lower.includes('warm')) return 'default';
    return 'secondary';
  };

  const getQualificationBadgeVariant = (status: string) => {
    switch (status) {
      case 'nouveau': return 'outline';
      case 'qualifie': return 'default';
      case 'transforme': return 'secondary';
      default: return 'outline';
    }
  };

  const getQualificationLabel = (status: string) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'qualifie': return 'Qualifié';
      case 'transforme': return 'Transformé';
      default: return status;
    }
  };

  const renderLeadsTable = (leads: CrmLead[]) => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Chargement des leads depuis le CRM...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              <strong>Erreur:</strong> {error}
            </p>
          </div>
          <Button onClick={fetchLeads} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      );
    }

    if (leads.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Aucun lead dans cette catégorie.</p>
          <p className="text-xs mt-2">Les leads sont chargés depuis le CRM</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entreprise</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Statut SF</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
            const qualification = mapQualificationStatus(lead.status);

            return (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {lead.company}
                    {lead.externalUrl && (
                      <a
                        href={lead.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{fullName}</TableCell>
                <TableCell className="text-muted-foreground">{lead.email || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{lead.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {lead.status || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(lead.rating)}>
                    {lead.rating || 'Cold'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getQualificationBadgeVariant(qualification)}>
                    {getQualificationLabel(qualification)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    {lead.externalUrl ? (
                      <a
                        href={lead.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Voir dans SF
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Lien indisponible</span>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Leads CRM</h1>
          <p className="text-muted-foreground">
            {userEmail ? `Leads de ${userEmail}` : 'Chargement...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchLeads} variant="outline" size="sm" disabled={loading || !userEmail}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <AddLeadDialog onLeadAdded={fetchLeads} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nouveauLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              Leads à qualifier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualifiés</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualifieLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              Leads qualifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transformés</CardTitle>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transformeLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              Leads convertis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Leads</CardTitle>
          <CardDescription>
            Chargés via la surcouche CRM • {allLeads.length} lead(s) total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tous" className="w-full">
            <TabsList>
              <TabsTrigger value="tous">
                Tous ({allLeads.length})
              </TabsTrigger>
              <TabsTrigger value="nouveau">
                Nouveau ({nouveauLeads.length})
              </TabsTrigger>
              <TabsTrigger value="qualifie">
                Qualifié ({qualifieLeads.length})
              </TabsTrigger>
              <TabsTrigger value="transforme">
                Transformé ({transformeLeads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tous" className="mt-4">
              {renderLeadsTable(allLeads)}
            </TabsContent>

            <TabsContent value="nouveau" className="mt-4">
              {renderLeadsTable(nouveauLeads)}
            </TabsContent>

            <TabsContent value="qualifie" className="mt-4">
              {renderLeadsTable(qualifieLeads)}
            </TabsContent>

            <TabsContent value="transforme" className="mt-4">
              {renderLeadsTable(transformeLeads)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
