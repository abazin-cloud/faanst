'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { updateLeadQualificationStatus, convertLeadToAccountAndOpportunity } from './actions';
import { SelectLead } from '@/lib/db';
import { useRouter } from 'next/navigation';

interface LeadActionsProps {
  lead: SelectLead;
}

export function LeadActions({ lead }: LeadActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (status: 'nouveau' | 'qualifie' | 'transforme') => {
    setIsLoading(true);
    try {
      const result = await updateLeadQualificationStatus(lead.id, status);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (lead.qualificationStatus === 'transforme') {
      alert('Ce lead a déjà été transformé');
      return;
    }

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir convertir "${lead.companyName}" en compte et opportunité ?`
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await convertLeadToAccountAndOpportunity(lead.id);
      if (result.success) {
        alert('Lead converti avec succès !');
        router.refresh();
      } else {
        alert(result.error || 'Failed to convert lead');
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Voir les détails
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs">Changer le statut</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('nouveau')}
          disabled={lead.qualificationStatus === 'nouveau' || isLoading}
        >
          {lead.qualificationStatus === 'nouveau' && <Check className="mr-2 h-4 w-4" />}
          {lead.qualificationStatus !== 'nouveau' && <div className="mr-2 h-4 w-4" />}
          Nouveau
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('qualifie')}
          disabled={lead.qualificationStatus === 'qualifie' || lead.qualificationStatus === 'transforme' || isLoading}
        >
          {lead.qualificationStatus === 'qualifie' && <Check className="mr-2 h-4 w-4" />}
          {lead.qualificationStatus !== 'qualifie' && <div className="mr-2 h-4 w-4" />}
          Qualifié
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleConvert}
          disabled={lead.qualificationStatus === 'transforme' || isLoading}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Convertir en compte
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}






