'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Target, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ShowroomHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-8 p-4">
      {/* Titre principal */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Mode Salon</h1>
        <p className="text-xl text-muted-foreground">
          Bienvenue ! Sélectionnez une action pour commencer
        </p>
      </div>

      {/* Grille des 3 grandes actions */}
      <div className="grid gap-6 md:grid-cols-3 w-full max-w-6xl">
        {/* Nouvelle Configuration */}
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary">
          <Link href="/configurateur">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                <Car className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">Nouvelle Configuration</CardTitle>
              <CardDescription className="text-base">
                Configurez un véhicule pour votre client
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <Button size="lg" className="w-full gap-2 text-lg h-12">
                Configurer
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* Nouveau Lead */}
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary">
          <Link href="/leads">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                <Target className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">Nouveau Lead</CardTitle>
              <CardDescription className="text-base">
                Enregistrez un nouveau prospect
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <Button size="lg" className="w-full gap-2 text-lg h-12">
                Créer un lead
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        {/* Prise de Rendez-vous */}
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary">
          <Link href="/rendez-vous">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                <Calendar className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">Prise de Rendez-vous</CardTitle>
              <CardDescription className="text-base">
                Planifiez un rendez-vous avec un client
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <Button size="lg" className="w-full gap-2 text-lg h-12">
                Planifier
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Information additionnelle */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Utilisez le toggle "Mode Salon" dans le header pour revenir à l'interface complète
        </p>
      </div>
    </div>
  );
}














