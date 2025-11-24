'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';

interface AddLeadDialogProps {
  onLeadAdded?: () => void;
}

interface DuplicateLead {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  status?: string;
}

export function AddLeadDialog({ onLeadAdded }: AddLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('Cold');
  const [error, setError] = useState<string | null>(null);
  const [duplicateLead, setDuplicateLead] = useState<DuplicateLead | null>(null);
  
  // États pour contrôler les valeurs du formulaire
  const [formValues, setFormValues] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormValues({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      notes: ''
    });
    setStatus('Cold');
    setError(null);
    setDuplicateLead(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Extraire les données du formulaire
      const contactName = formValues.contactName;
      const nameParts = contactName.trim().split(' ');
      const lastName = nameParts.pop() || contactName;
      const firstName = nameParts.join(' ') || undefined;

      // Préparer les données pour Salesforce
      const leadData = {
        LastName: lastName,
        FirstName: firstName,
        Company: formValues.companyName,
        Email: formValues.email,
        Phone: formValues.phone || undefined,
        Status: 'Open - Not Contacted',
        Rating: status,
        Description: formValues.notes || undefined,
      };

      console.log('Creating lead in Salesforce:', leadData);

      // Créer le lead directement dans Salesforce
      const response = await fetch('/api/salesforce/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const result = await response.json();

      if (!result.success) {
        // Check if it's a duplicate error
        if (result.duplicate) {
          setDuplicateLead(result.duplicate);
        }
        throw new Error(result.error || 'Failed to create lead in Salesforce');
      }

      console.log('Lead created successfully:', result.data);

      // Réinitialiser le formulaire et fermer le dialog
      resetForm();
      setOpen(false);

      // Rafraîchir la liste des leads
      if (onLeadAdded) {
        onLeadAdded();
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Lead
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Le lead sera créé directement dans Salesforce.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
            
            {duplicateLead && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md space-y-2">
                <p className="text-sm font-semibold text-yellow-900">
                  Lead existant trouvé :
                </p>
                <div className="space-y-1 text-xs text-yellow-800">
                  <p><strong>Nom :</strong> {duplicateLead.name}</p>
                  <p><strong>Entreprise :</strong> {duplicateLead.company}</p>
                  {duplicateLead.email && (
                    <p><strong>Email :</strong> {duplicateLead.email}</p>
                  )}
                  {duplicateLead.phone && (
                    <p><strong>Téléphone :</strong> {duplicateLead.phone}</p>
                  )}
                  {duplicateLead.status && (
                    <p><strong>Statut :</strong> {duplicateLead.status}</p>
                  )}
                </div>
                <a
                  href={`https://login.salesforce.com/${duplicateLead.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 mt-2"
                >
                  Voir dans Salesforce →
                </a>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Acme Corporation"
              value={formValues.companyName}
              onChange={(e) => setFormValues({ ...formValues, companyName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              name="contactName"
              placeholder="John Smith"
              value={formValues.contactName}
              onChange={(e) => setFormValues({ ...formValues, contactName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@acme.com"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Rating *</Label>
            <Select name="status" value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional information about this lead..."
              value={formValues.notes}
              onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création dans Salesforce...' : 'Créer le Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}