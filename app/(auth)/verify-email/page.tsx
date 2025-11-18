'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Lien de vérification invalide');
      return;
    }

    // Vérifier le token
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage('Votre email a été vérifié avec succès !');
          // Redirection après 3 secondes
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'La vérification a échoué');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Vérification de l'email
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'success' && 'Email vérifié !'}
            {status === 'error' && 'Erreur de vérification'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Vérification de votre email...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Succès !</h3>
                <p className="text-sm text-muted-foreground mb-4">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez maintenant vous connecter.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Redirection vers la page de connexion...
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link href="/login">Se connecter maintenant</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Erreur</h3>
                <p className="text-sm text-muted-foreground mb-4">{message}</p>
                <p className="text-xs text-muted-foreground">
                  Le lien peut avoir expiré ou est invalide.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" asChild>
                  <Link href="/register">Réessayer</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

