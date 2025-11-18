'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FINANCING_PLANS,
  INSURANCE_PLANS,
  VEHICLE_ACCESSORIES,
  VEHICLE_MODELS,
  VEHICLE_OPTIONS,
  FinancingPlan,
  VehicleOption,
  VehicleAccessory
} from '@/lib/vehicle-config';
import {
  BatteryCharging,
  Car,
  CheckCircle2,
  CreditCard,
  Leaf,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

function calculateMonthlyPayment(total: number, plan: FinancingPlan) {
  if (plan.months === 0) {
    return 0;
  }

  const downPayment = total * plan.downPaymentRate;
  const residual = plan.residualValueRate ? total * plan.residualValueRate : 0;
  const principal = Math.max(total - downPayment - residual, 0);

  if (principal === 0) {
    return 0;
  }

  if (plan.rate === 0) {
    return principal / plan.months;
  }

  const monthlyRate = plan.rate / 12;
  return (
    (principal * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -plan.months))
  );
}

export default function VehicleConfiguratorPage() {
  const [selectedModelId, setSelectedModelId] = useState(VEHICLE_MODELS[0].id);
  const [selectedFinishId, setSelectedFinishId] = useState(
    VEHICLE_MODELS[0].finishes[0].id
  );
  const [selectedColorId, setSelectedColorId] = useState(
    VEHICLE_MODELS[0].colors[0].id
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [financingId, setFinancingId] = useState(FINANCING_PLANS[1].id);
  const [insuranceId, setInsuranceId] = useState(INSURANCE_PLANS[1].id);

  const selectedModel = useMemo(
    () => VEHICLE_MODELS.find((model) => model.id === selectedModelId) ?? VEHICLE_MODELS[0],
    [selectedModelId]
  );

  useEffect(() => {
    if (!selectedModel.finishes.some((finish) => finish.id === selectedFinishId)) {
      setSelectedFinishId(selectedModel.finishes[0].id);
    }
    if (!selectedModel.colors.some((color) => color.id === selectedColorId)) {
      setSelectedColorId(selectedModel.colors[0].id);
    }
  }, [selectedModel, selectedFinishId, selectedColorId]);

  const selectedFinish = selectedModel.finishes.find(
    (finish) => finish.id === selectedFinishId
  );
  const selectedColor = selectedModel.colors.find(
    (color) => color.id === selectedColorId
  );
  const selectedFinancing = FINANCING_PLANS.find((plan) => plan.id === financingId)!;
  const selectedInsurance = INSURANCE_PLANS.find(
    (plan) => plan.id === insuranceId
  )!;

  const selectedOptionEntities = VEHICLE_OPTIONS.filter((option) =>
    selectedOptions.includes(option.id)
  );
  const selectedAccessoryEntities = VEHICLE_ACCESSORIES.filter((accessory) =>
    selectedAccessories.includes(accessory.id)
  );

  const baseVehiclePrice =
    selectedModel.basePrice + (selectedFinish?.price ?? 0) + (selectedColor?.price ?? 0);
  const optionsPrice = selectedOptionEntities.reduce(
    (total, option) => total + option.price,
    0
  );
  const accessoriesPrice = selectedAccessoryEntities.reduce(
    (total, accessory) => total + accessory.price,
    0
  );

  const totalBeforeServices = baseVehiclePrice + optionsPrice + accessoriesPrice;
  const downPayment = totalBeforeServices * selectedFinancing.downPaymentRate;
  const monthlyPayment = calculateMonthlyPayment(
    totalBeforeServices,
    selectedFinancing
  );
  const totalMonthly = monthlyPayment + selectedInsurance.monthlyPrice;

  const optionCategories = Array.from(
    new Set(VEHICLE_OPTIONS.map((option) => option.category))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Car className="h-5 w-5" />
          <span className="text-sm uppercase tracking-wide font-semibold">
            Configurateur véhicule
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Composez votre offre commerciale
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Sélectionnez un modèle, ajustez les finitions et services pour bâtir une proposition cohérente
              avec les attentes de votre prospect (modèles, options, financement, assurance…).
            </p>
          </div>
          <Button size="lg" className="h-12 px-8">
            Générer la fiche PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Modèle & finition</CardTitle>
              <CardDescription>
                Choisissez la base technique avant de personnaliser vos équipements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Modèle</Label>
                  <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Finition</Label>
                  <Select
                    value={selectedFinishId}
                    onValueChange={setSelectedFinishId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une finition" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedModel.finishes.map((finish) => (
                        <SelectItem key={finish.id} value={finish.id}>
                          {finish.name} ({currency.format(finish.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Couleur carrosserie</Label>
                  <Select value={selectedColorId} onValueChange={setSelectedColorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedModel.colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name} ({color.price === 0 ? 'Incluse' : currency.format(color.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-semibold">Points forts</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.highlights.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoTile
                  icon={<BatteryCharging className="h-5 w-5" />}
                  title={selectedModel.range}
                  description="Autonomie mixte"
                />
                <InfoTile
                  icon={<Sparkles className="h-5 w-5" />}
                  title={selectedModel.power}
                  description="Puissance cumulée"
                />
                <InfoTile
                  icon={<Leaf className="h-5 w-5" />}
                  title={selectedModel.charging}
                  description="Temps de charge"
                />
              </div>

              {selectedFinish && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    Finition {selectedFinish.name}
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground grid gap-1">
                    {selectedFinish.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Options & accessoires</CardTitle>
              <CardDescription>
                Composez une dotation adaptée aux usages du client (productivité, confort, sécurité).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {optionCategories.map((category) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {category === 'Confort'
                          ? 'Bien-être quotidien des équipes'
                          : category === 'Technologie'
                            ? 'Pilotage numérique et connectivité'
                            : 'Protection des occupants et du matériel'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {selectedOptions.filter((id) =>
                        VEHICLE_OPTIONS.find(
                          (option) => option.id === id && option.category === category
                        )
                      ).length}{' '}
                      /{' '}
                      {VEHICLE_OPTIONS.filter(
                        (option) => option.category === category
                      ).length}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {VEHICLE_OPTIONS.filter((option) => option.category === category).map(
                      (option) => (
                        <OptionCheckbox
                          key={option.id}
                          option={option}
                          checked={selectedOptions.includes(option.id)}
                          onChange={(checked) => {
                            setSelectedOptions((prev) =>
                              checked
                                ? [...prev, option.id]
                                : prev.filter((id) => id !== option.id)
                            );
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                <p className="font-semibold">Accessoires</p>
                <div className="grid gap-3">
                  {VEHICLE_ACCESSORIES.map((accessory) => (
                    <OptionCheckbox
                      key={accessory.id}
                      option={accessory}
                      checked={selectedAccessories.includes(accessory.id)}
                      onChange={(checked) => {
                        setSelectedAccessories((prev) =>
                          checked
                            ? [...prev, accessory.id]
                            : prev.filter((id) => id !== accessory.id)
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Financement & assurance</CardTitle>
              <CardDescription>
                Alignez le plan de financement et la couverture pour sécuriser la signature.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plan de financement</Label>
                  <Select value={financingId} onValueChange={setFinancingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {FINANCING_PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {selectedFinancing.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Assurance</Label>
                  <Select value={insuranceId} onValueChange={setInsuranceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une couverture" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {selectedInsurance.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoTile
                  icon={<CreditCard className="h-5 w-5" />}
                  title={currency.format(downPayment)}
                  description="Apport estimé"
                />
                <InfoTile
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title={`${currency.format(selectedInsurance.monthlyPrice)} / mois`}
                  description="Prime assurance"
                />
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold">Services inclus</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {selectedFinancing.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
                <div className="border-t pt-3">
                  <p className="text-xs uppercase text-muted-foreground mb-1">Couverture</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInsurance.coverage.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé budgétaire</CardTitle>
              <CardDescription>Vue instantanée de la configuration sélectionnée.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <SummaryRow
                  label={`Modèle ${selectedModel.name}`}
                  value={currency.format(selectedModel.basePrice)}
                />
                {selectedFinish && (
                  <SummaryRow
                    label={`Finition ${selectedFinish.name}`}
                    value={currency.format(selectedFinish.price)}
                  />
                )}
                {selectedColor && (
                  <SummaryRow
                    label={`Couleur ${selectedColor.name}`}
                    value={currency.format(selectedColor.price)}
                  />
                )}
                <SummaryRow
                  label={`Options (${selectedOptionEntities.length})`}
                  value={currency.format(optionsPrice)}
                />
                <SummaryRow
                  label={`Accessoires (${selectedAccessoryEntities.length})`}
                  value={currency.format(accessoriesPrice)}
                />
                <div className="border-t pt-2">
                  <SummaryRow
                    label="Total hors services"
                    value={currency.format(totalBeforeServices)}
                    emphasis
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Mensualité estimée</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFinancing.name}
                      {selectedFinancing.months > 0 &&
                        ` • ${selectedFinancing.months} mois`}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {currency.format(Math.round(monthlyPayment))}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>+ Assurance</span>
                  <span>{currency.format(selectedInsurance.monthlyPrice)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total mensuel estimé</span>
                  <span>{currency.format(Math.round(totalMonthly))}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Détails envoyés au client</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[selectedModel.description, selectedFinancing.description, selectedInsurance.description]
                    .filter(Boolean)
                    .map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <Button className="w-full" size="lg">
                Enregistrer cette configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Argumentaire express</CardTitle>
              <CardDescription>
                Points clés pour votre rendez-vous ou votre devis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ArgumentLine
                title="Budget maîtrisé"
                value={`${currency.format(totalBeforeServices)} TTC`}
                description="Comprend véhicule, finition et équipements sélectionnés."
              />
              <ArgumentLine
                title="Mensualité packagée"
                value={`${currency.format(Math.round(totalMonthly))} / mois`}
                description="Financement + assurance + services inclus."
              />
              <ArgumentLine
                title="Mise à disposition"
                value="8 à 10 semaines"
                description="Peut être accélérée avec la finition Intense Tech en stock."
              />
              <ArgumentLine
                title="Empreinte carbone"
                value="0 g CO₂/km WLTP"
                description="Eligible bonus écologique et suramortissement flotte."
              />
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                Besoin d’un engagement écrit ? Utilisez le bouton « Générer la fiche PDF » ci-dessus pour exporter cette
                configuration et la partager au client.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type InfoTileProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function InfoTile({ icon, title, description }: InfoTileProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-start gap-3">
      <div className="rounded-full bg-primary/10 text-primary p-2">{icon}</div>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

type OptionCheckboxProps = {
  option: VehicleOption | VehicleAccessory;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function OptionCheckbox({ option, checked, onChange }: OptionCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{option.name}</p>
          <span className="text-sm text-muted-foreground">
            {currency.format(option.price)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{option.description}</p>
      </div>
    </label>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function SummaryRow({ label, value, emphasis }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={emphasis ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <span className={emphasis ? 'text-lg font-semibold' : 'font-medium'}>{value}</span>
    </div>
  );
}

type ArgumentLineProps = {
  title: string;
  value: string;
  description: string;
};

function ArgumentLine({ title, value, description }: ArgumentLineProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-base font-bold">{value}</p>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
