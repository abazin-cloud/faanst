import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, ArrowRight, ExternalLink } from 'lucide-react';
import { getAllLeads } from '@/lib/db';
import { AddLeadDialog } from '../add-lead-dialog';
import { LeadActions } from './lead-actions';
import Link from 'next/link';

export default async function LeadsPage() {
  const allLeads = await getAllLeads();

  // Filter leads by qualification status
  const nouveauLeads = allLeads.filter(lead => lead.qualificationStatus === 'nouveau');
  const qualifieLeads = allLeads.filter(lead => lead.qualificationStatus === 'qualifie');
  const transformeLeads = allLeads.filter(lead => lead.qualificationStatus === 'transforme');

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'hot': return 'destructive';
      case 'warm': return 'default';
      default: return 'secondary';
    }
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

  const renderLeadsTable = (leads: typeof allLeads) => {
    if (leads.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Aucun lead dans cette catégorie.</p>
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
            <TableHead>Valeur estimée</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Qualification</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">
                <Link 
                  href={`/leads/${lead.id}`}
                  className="hover:underline flex items-center gap-2"
                >
                  {lead.companyName}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </Link>
              </TableCell>
              <TableCell>{lead.contactName}</TableCell>
              <TableCell className="text-muted-foreground">{lead.email}</TableCell>
              <TableCell className="text-muted-foreground">{lead.phone || '-'}</TableCell>
              <TableCell className="font-medium">
                ${Number(lead.estimatedValue).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(lead.status)}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getQualificationBadgeVariant(lead.qualificationStatus)}>
                  {getQualificationLabel(lead.qualificationStatus)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <LeadActions lead={lead} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Leads</h1>
          <p className="text-muted-foreground">
            Suivez et qualifiez vos opportunités commerciales
          </p>
        </div>
        <AddLeadDialog />
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
            Gérez vos leads par statut de qualification
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






