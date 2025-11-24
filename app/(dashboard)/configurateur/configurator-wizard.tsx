'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Car, 
  Package, 
  CreditCard, 
  FileText,
  Download 
} from 'lucide-react';
import type { SelectVehicle, SelectVehicleOption } from '@/lib/db';

interface ConfiguratorWizardProps {
  vehicles: SelectVehicle[];
  options: SelectVehicleOption[];
}

interface Configuration {
  vehicleId: number | null;
  selectedOptions: number[];
  financingType: 'comptant' | 'credit' | 'leasing' | null;
  financingDuration: number;
  financingDownPayment: number;
  customerName: string;
  customerEmail: string;
}

const STEPS = [
  { id: 1, name: 'Modèle & Finition', icon: Car, description: 'Choisissez votre véhicule' },
  { id: 2, name: 'Options & Accessoires', icon: Package, description: 'Personnalisez votre véhicule' },
  { id: 3, name: 'Financement', icon: CreditCard, description: 'Mode de paiement' },
  { id: 4, name: 'Résumé', icon: FileText, description: 'Vérification finale' },
];

export function ConfiguratorWizard({ vehicles, options }: ConfiguratorWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<Configuration>({
    vehicleId: null,
    selectedOptions: [],
    financingType: null,
    financingDuration: 60,
    financingDownPayment: 0,
    customerName: '',
    customerEmail: '',
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Filtres pour l'étape 1
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [finishFilter, setFinishFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const selectedVehicle = vehicles.find(v => v.id === config.vehicleId);
  const selectedOptionsData = options.filter(o => config.selectedOptions.includes(o.id));

  // Get unique models and finishes
  const uniqueModels = Array.from(new Set(vehicles.map(v => v.model))).sort();
  const uniqueFinishes = Array.from(new Set(vehicles.map(v => v.finish))).sort();

  // Filter vehicles based on filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesModel = modelFilter === 'all' || vehicle.model === modelFilter;
    const matchesFinish = finishFilter === 'all' || vehicle.finish === finishFilter;
    const matchesSearch = searchFilter === '' || 
      vehicle.model.toLowerCase().includes(searchFilter.toLowerCase()) ||
      vehicle.finish.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (vehicle.description && vehicle.description.toLowerCase().includes(searchFilter.toLowerCase()));
    
    return matchesModel && matchesFinish && matchesSearch;
  });

  // Calculate totals
  const basePrice = Number(selectedVehicle?.basePrice || 0);
  const optionsTotal = selectedOptionsData.reduce((sum, opt) => sum + Number(opt.price), 0);
  const totalPrice = basePrice + optionsTotal;

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return config.vehicleId !== null;
      case 2:
        return true; // Options are optional
      case 3:
        return config.financingType !== null;
      case 4:
        return config.customerName && config.customerEmail;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleOption = (optionId: number) => {
    setConfig(prev => ({
      ...prev,
      selectedOptions: prev.selectedOptions.includes(optionId)
        ? prev.selectedOptions.filter(id => id !== optionId)
        : [...prev.selectedOptions, optionId]
    }));
  };

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch('/api/configurateur/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle: selectedVehicle,
          options: selectedOptionsData,
          financing: {
            type: config.financingType,
            duration: config.financingDuration,
            downPayment: config.financingDownPayment,
          },
          customer: {
            name: config.customerName,
            email: config.customerEmail,
          },
          totalPrice,
        }),
      });

      if (response.ok) {
        const htmlContent = await response.text();
        
        // Create a blob with the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open the blob URL in a new window
        const printWindow = window.open(blobUrl, '_blank');
        
        if (printWindow) {
          // Wait for the window to load completely
          const checkLoaded = setInterval(() => {
            if (printWindow.document.readyState === 'complete') {
              clearInterval(checkLoaded);
              setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                // Clean up the blob URL after printing
                setTimeout(() => {
                  URL.revokeObjectURL(blobUrl);
                }, 1000);
              }, 1000);
            }
          }, 100);
          
          // Cleanup after 30 seconds if something goes wrong
          setTimeout(() => {
            clearInterval(checkLoaded);
            URL.revokeObjectURL(blobUrl);
          }, 30000);
        } else {
          URL.revokeObjectURL(blobUrl);
        }
      } else {
        alert('Erreur lors de la génération du PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background border-b pb-4 space-y-4">
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>

          <div className="text-center">
            <h2 className="text-lg font-semibold">{STEPS[currentStep - 1].name}</h2>
            <p className="text-sm text-muted-foreground">Étape {currentStep} sur 4</p>
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed(currentStep)}
              size="lg"
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGeneratePdf}
              disabled={!canProceed(4) || isGeneratingPdf}
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {isGeneratingPdf ? 'Génération...' : 'Générer PDF'}
            </Button>
          )}
        </div>

        {/* Filters for Step 1 */}
        {currentStep === 1 && filteredVehicles.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4 pt-4 border-t">
            <div>
              <Label htmlFor="search" className="text-xs">Rechercher</Label>
              <Input
                id="search"
                placeholder="Rechercher un véhicule..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="model-filter" className="text-xs">Modèle</Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tous les modèles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modèles</SelectItem>
                  {uniqueModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="finish-filter" className="text-xs">Finition</Label>
              <Select value={finishFilter} onValueChange={setFinishFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Toutes les finitions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les finitions</SelectItem>
                  {uniqueFinishes.map(finish => (
                    <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setModelFilter('all');
                  setFinishFilter('all');
                  setSearchFilter('');
                }}
                className="w-full h-9"
              >
                Réinitialiser
              </Button>
            </div>
            <div className="col-span-full text-sm text-muted-foreground">
              {filteredVehicles.length} véhicule{filteredVehicles.length > 1 ? 's' : ''} trouvé{filteredVehicles.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Steps Progress Indicator (collapsed) */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep > step.id
                    ? 'bg-green-600 border-green-600 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="mt-1 text-center">
                <p className={`text-xs font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.name}
                </p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`h-0.5 w-full mx-2 transition-colors ${
                currentStep > step.id ? 'bg-green-600' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {/* Step 1: Vehicle Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {vehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucun véhicule disponible. Veuillez importer des véhicules dans les paramètres.
                  </p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucun véhicule ne correspond à vos critères de recherche.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setModelFilter('all');
                      setFinishFilter('all');
                      setSearchFilter('');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {filteredVehicles.map((vehicle) => (
                    <Card
                      key={vehicle.id}
                      className={`cursor-pointer transition-all overflow-hidden ${
                        config.vehicleId === vehicle.id
                          ? 'ring-2 ring-blue-600 bg-blue-50'
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, vehicleId: vehicle.id }))}
                    >
                      {vehicle.imageUrl && (
                        <div className="relative h-32 w-full overflow-hidden bg-muted">
                          <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.model} ${vehicle.finish}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {config.vehicleId === vehicle.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="truncate">{vehicle.model}</span>
                          {config.vehicleId === vehicle.id && !vehicle.imageUrl && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs truncate">{vehicle.finish}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Prix</span>
                          <span className="text-sm font-bold">
                            {vehicle.basePrice ? `${Number(vehicle.basePrice).toLocaleString('fr-FR')} €` : 'Sur demande'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Options & Accessories */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Options */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Options</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {options.filter(o => o.category === 'option').map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all ${
                        config.selectedOptions.includes(option.id)
                          ? 'ring-2 ring-blue-600 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleOption(option.id)}
                    >
                      <CardHeader className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {option.name}
                              {config.selectedOptions.includes(option.id) && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </CardTitle>
                            {option.description && (
                              <CardDescription className="text-sm mt-1">
                                {option.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-2">
                            +{Number(option.price).toLocaleString('fr-FR')} €
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Accessoires</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {options.filter(o => o.category === 'accessoire').map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all ${
                        config.selectedOptions.includes(option.id)
                          ? 'ring-2 ring-blue-600 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleOption(option.id)}
                    >
                      <CardHeader className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {option.name}
                              {config.selectedOptions.includes(option.id) && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </CardTitle>
                            {option.description && (
                              <CardDescription className="text-sm mt-1">
                                {option.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-2">
                            +{Number(option.price).toLocaleString('fr-FR')} €
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {options.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucune option ou accessoire disponible pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Financing */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="grid gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    config.financingType === 'comptant'
                      ? 'ring-2 ring-blue-600 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, financingType: 'comptant' }))}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Paiement comptant</span>
                      {config.financingType === 'comptant' && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Payez le montant total en une seule fois
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalPrice.toLocaleString('fr-FR')} €
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    config.financingType === 'credit'
                      ? 'ring-2 ring-blue-600 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, financingType: 'credit' }))}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Crédit auto</span>
                      {config.financingType === 'credit' && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Financement avec paiement mensuel
                    </CardDescription>
                  </CardHeader>
                  {config.financingType === 'credit' && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="duration">Durée (mois)</Label>
                        <Select
                          value={config.financingDuration.toString()}
                          onValueChange={(value) => 
                            setConfig(prev => ({ ...prev, financingDuration: parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 mois</SelectItem>
                            <SelectItem value="24">24 mois</SelectItem>
                            <SelectItem value="36">36 mois</SelectItem>
                            <SelectItem value="48">48 mois</SelectItem>
                            <SelectItem value="60">60 mois</SelectItem>
                            <SelectItem value="72">72 mois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="downPayment">Apport initial (€)</Label>
                        <Input
                          id="downPayment"
                          type="number"
                          value={config.financingDownPayment}
                          onChange={(e) => 
                            setConfig(prev => ({ ...prev, financingDownPayment: parseFloat(e.target.value) || 0 }))
                          }
                          min="0"
                          max={totalPrice}
                        />
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Mensualité estimée</p>
                        <p className="text-2xl font-bold">
                          {Math.round((totalPrice - config.financingDownPayment) / config.financingDuration).toLocaleString('fr-FR')} €/mois
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (hors frais et intérêts)
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    config.financingType === 'leasing'
                      ? 'ring-2 ring-blue-600 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, financingType: 'leasing' }))}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Leasing / LLD</span>
                      {config.financingType === 'leasing' && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Location longue durée avec option d'achat
                    </CardDescription>
                  </CardHeader>
                  {config.financingType === 'leasing' && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="duration-leasing">Durée (mois)</Label>
                        <Select
                          value={config.financingDuration.toString()}
                          onValueChange={(value) => 
                            setConfig(prev => ({ ...prev, financingDuration: parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 mois</SelectItem>
                            <SelectItem value="36">36 mois</SelectItem>
                            <SelectItem value="48">48 mois</SelectItem>
                            <SelectItem value="60">60 mois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Loyer mensuel estimé</p>
                        <p className="text-2xl font-bold">
                          {Math.round(totalPrice / config.financingDuration * 0.85).toLocaleString('fr-FR')} €/mois
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (estimation indicative)
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Nom complet *</Label>
                    <Input
                      id="customerName"
                      value={config.customerName}
                      onChange={(e) => setConfig(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={config.customerEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="jean.dupont@example.com"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif de votre configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vehicle */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Véhicule sélectionné
                    </h3>
                    <div className="pl-6 space-y-3">
                      {selectedVehicle?.imageUrl && (
                        <div className="rounded-lg overflow-hidden h-40 bg-muted">
                          <img
                            src={selectedVehicle.imageUrl}
                            alt={`${selectedVehicle.model} ${selectedVehicle.finish}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="font-medium text-lg">{selectedVehicle?.model}</p>
                        <p className="text-sm text-muted-foreground">{selectedVehicle?.finish}</p>
                        {selectedVehicle?.description && (
                          <p className="text-sm text-muted-foreground italic">{selectedVehicle.description}</p>
                        )}
                        <p className="text-sm font-semibold pt-2">
                          Prix de base: {basePrice.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  {selectedOptionsData.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Options & Accessoires
                      </h3>
                      <div className="pl-6 space-y-2">
                        {selectedOptionsData.map((option) => (
                          <div key={option.id} className="flex justify-between text-sm">
                            <span>{option.name}</span>
                            <span className="font-medium">+{Number(option.price).toLocaleString('fr-FR')} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financing */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Financement
                    </h3>
                    <div className="pl-6">
                      <p className="text-sm">
                        {config.financingType === 'comptant' && 'Paiement comptant'}
                        {config.financingType === 'credit' && `Crédit sur ${config.financingDuration} mois`}
                        {config.financingType === 'leasing' && `Leasing sur ${config.financingDuration} mois`}
                      </p>
                      {config.financingType !== 'comptant' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.financingDownPayment > 0 && `Apport: ${config.financingDownPayment.toLocaleString('fr-FR')} € - `}
                          Mensualité: {
                            config.financingType === 'credit'
                              ? Math.round((totalPrice - config.financingDownPayment) / config.financingDuration).toLocaleString('fr-FR')
                              : Math.round(totalPrice / config.financingDuration * 0.85).toLocaleString('fr-FR')
                          } €/mois
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Prix total</span>
                      <span className="text-2xl font-bold">
                        {totalPrice.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

