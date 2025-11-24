'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SalesforceEmailFormProps {
  currentEmail: string;
  salesforceEmail?: string | null;
}

export function SalesforceEmailForm({ currentEmail, salesforceEmail }: SalesforceEmailFormProps) {
  const [email, setEmail] = useState(salesforceEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/update-salesforce-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salesforceEmail: email || null }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update Salesforce email');
      }

      setMessage({
        type: 'success',
        text: 'Email Salesforce mis à jour avec succès !'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentEmail">Email de connexion</Label>
        <Input
          id="currentEmail"
          type="email"
          value={currentEmail}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Votre email de connexion à l'application
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesforceEmail">Email Salesforce (optionnel)</Label>
        <Input
          id="salesforceEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Laisser vide pour utiliser l'email de connexion"
        />
        <p className="text-xs text-muted-foreground">
          Si votre email Salesforce est différent de votre email de connexion, indiquez-le ici.
          Sinon, laissez vide pour utiliser l'email de connexion.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  );
}














