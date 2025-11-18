import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, User, Mail, Phone, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getLeadById, getNotesByEntity, getTasksByEntity, getAccountById, getOpportunitiesByAccountId } from '@/lib/db';
import { notFound } from 'next/navigation';
import { LeadActions } from '../lead-actions';
import { NotesSection } from './notes-section';
import { TasksSection } from './tasks-section';

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const leadId = parseInt(id);
  const lead = await getLeadById(leadId);

  if (!lead) {
    notFound();
  }

  const notes = await getNotesByEntity('lead', leadId);
  const tasks = await getTasksByEntity('lead', leadId);

  // If lead is converted, get the account and opportunity details
  let account = null;
  let opportunities = null;
  if (lead.convertedToAccountId) {
    account = await getAccountById(lead.convertedToAccountId);
    if (account) {
      opportunities = await getOpportunitiesByAccountId(account.id);
    }
  }

  const getQualificationLabel = (status: string) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'qualifie': return 'Qualifié';
      case 'transforme': return 'Transformé';
      default: return status;
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'hot': return 'destructive';
      case 'warm': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lead.companyName}</h1>
            <p className="text-muted-foreground">
              Lead créé le{' '}
              {lead.createdAt
                ? new Date(lead.createdAt).toLocaleDateString('fr-FR')
                : 'Date indisponible'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getQualificationBadgeVariant(lead.qualificationStatus)}>
            {getQualificationLabel(lead.qualificationStatus)}
          </Badge>
          <Badge variant={getStatusBadgeVariant(lead.status)}>
            {lead.status}
          </Badge>
          <LeadActions lead={lead} />
        </div>
      </div>

      {/* Lead Information Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations du Lead</CardTitle>
            <CardDescription>Détails du contact et de l'entreprise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Entreprise</p>
                <p className="font-medium">{lead.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{lead.contactName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{lead.phone || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Valeur estimée</p>
                <p className="font-medium text-lg">${Number(lead.estimatedValue).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes initiales</CardTitle>
            <CardDescription>Informations supplémentaires</CardDescription>
          </CardHeader>
          <CardContent>
            {lead.notes ? (
              <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune note</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Information */}
      {lead.qualificationStatus === 'transforme' && account && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Lead transformé</CardTitle>
            <CardDescription className="text-green-700">
              Ce lead a été converti en compte et opportunité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Compte créé</p>
                <p className="font-medium text-green-900">{account.companyName}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/customers`}>Voir le compte</Link>
              </Button>
            </div>
            {opportunities && opportunities.length > 0 && (
              <div className="pt-2 border-t border-green-200">
                <p className="text-sm text-green-700 mb-2">Opportunités associées</p>
                {opportunities.map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-green-900">{opp.title}</p>
                      <p className="text-xs text-green-700">
                        ${Number(opp.amount).toLocaleString()} - {opp.stage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History: Notes and Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Notes et tâches de suivi</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes" className="w-full">
            <TabsList>
              <TabsTrigger value="notes">
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                Tâches ({tasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="mt-4">
              <NotesSection leadId={leadId} notes={notes} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <TasksSection leadId={leadId} tasks={tasks} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}



