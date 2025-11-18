'use client';

import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { SelectVehicle } from '@/lib/db';
import {
  FINANCING_PLANS,
  INSURANCE_PLANS,
  VEHICLE_ACCESSORIES,
  VEHICLE_MODELS,
  VEHICLE_OPTIONS,
  type FinancingPlan,
  type VehicleAccessory,
  type VehicleOption
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

const steps = [
  { id: 1, title: 'Modèle & finition', description: 'Choisissez la base technique de l’offre.' },
  { id: 2, title: 'Options & accessoires', description: 'Sélectionnez les packs additionnels.' },
  { id: 3, title: 'Financement', description: 'Ajustez financement et assurance.' },
  { id: 4, title: 'Résumé', description: 'Validez et exportez la proposition.' }
];

export type VehicleConfiguratorClientProps = {
  vehicles: SelectVehicle[];
};

export function VehicleConfiguratorClient({ vehicles }: VehicleConfiguratorClientProps) {
  const fallbackModel = VEHICLE_MODELS[0];
  const availableModelNames = useMemo(() => {
    if (vehicles.length > 0) {
      const names = Array.from(
        new Set(
          vehicles
            .map((vehicle) => vehicle.model?.trim())
            .filter((model): model is string => Boolean(model))
        )
      );

      if (names.length > 0) {
        return names;
      }
    }

    return VEHICLE_MODELS.map((model) => model.name);
  }, [vehicles]);

  const [selectedModelName, setSelectedModelName] = useState(
    availableModelNames[0] ?? fallbackModel.name
  );
  const [selectedFinishName, setSelectedFinishName] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(fallbackModel.colors[0].id);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [financingId, setFinancingId] = useState(FINANCING_PLANS[1].id);
  const [insuranceId, setInsuranceId] = useState(INSURANCE_PLANS[1].id);
  const [currentStep, setCurrentStep] = useState(1);

  const selectedModel = useMemo(() => {
    const staticModel = VEHICLE_MODELS.find((model) => model.name === selectedModelName);
    if (staticModel) {
      return staticModel;
    }

    return {
      ...fallbackModel,
      id: selectedModelName.toLowerCase().replace(/\s+/g, '-'),
      name: selectedModelName
    };
  }, [selectedModelName, fallbackModel]);

  useEffect(() => {
    if (!availableModelNames.includes(selectedModelName) && availableModelNames.length > 0) {
      setSelectedModelName(availableModelNames[0]);
    }
  }, [availableModelNames, selectedModelName]);

  useEffect(() => {
    const availableFinishes = getFinishOptionsForModel(vehicles, selectedModelName, selectedModel);
    if (!availableFinishes.includes(selectedFinishName)) {
      setSelectedFinishName(availableFinishes[0] ?? '');
    }
  }, [selectedModelName, selectedFinishName, selectedModel, vehicles]);

  useEffect(() => {
    if (!selectedModel.colors.some((color) => color.id === selectedColorId)) {
      setSelectedColorId(selectedModel.colors[0]?.id ?? '');
    }
  }, [selectedModel, selectedColorId]);

  const selectedFinish = useMemo(() => {
    return (
      selectedModel.finishes.find((finish) => finish.name === selectedFinishName) ??
      (selectedFinishName
        ? { id: selectedFinishName, name: selectedFinishName, price: 0, highlights: [] }
        : undefined)
    );
  }, [selectedFinishName, selectedModel]);

  const selectedColor = selectedModel.colors.find((color) => color.id === selectedColorId);
  const selectedFinancing = FINANCING_PLANS.find((plan) => plan.id === financingId)!;
  const selectedInsurance = INSURANCE_PLANS.find((plan) => plan.id === insuranceId)!;

  const selectedOptionEntities = VEHICLE_OPTIONS.filter((option) =>
    selectedOptions.includes(option.id)
  );
  const selectedAccessoryEntities = VEHICLE_ACCESSORIES.filter((accessory) =>
    selectedAccessories.includes(accessory.id)
  );

  const baseVehiclePrice =
    selectedModel.basePrice + (selectedFinish?.price ?? 0) + (selectedColor?.price ?? 0);
  const optionsPrice = selectedOptionEntities.reduce((total, option) => total + option.price, 0);
  const accessoriesPrice = selectedAccessoryEntities.reduce(
    (total, accessory) => total + accessory.price,
    0
  );

  const totalBeforeServices = baseVehiclePrice + optionsPrice + accessoriesPrice;
  const downPayment = totalBeforeServices * selectedFinancing.downPaymentRate;
  const monthlyPayment = calculateMonthlyPayment(totalBeforeServices, selectedFinancing);
  const totalMonthly = monthlyPayment + selectedInsurance.monthlyPrice;

  const optionCategories = useMemo(
    () => Array.from(new Set(VEHICLE_OPTIONS.map((option) => option.category))),
    []
  );

  const canGoForward =
    currentStep === 1 ? Boolean(selectedModelName && selectedFinishName) : currentStep < steps.length;

  const handleGeneratePdf = () => {
    const pdfLines = buildPdfLines({
      model: selectedModelName,
      finish: selectedFinish?.name ?? 'NC',
      color: selectedColor?.name ?? 'Standard',
        options: selectedOptionEntities,
        accessories: selectedAccessoryEntities,
        financing: selectedFinancing,
        insurance: selectedInsurance,
        totals: {
          vehicle: baseVehiclePrice,
        options: optionsPrice,
        accessories: accessoriesPrice,
        grandTotal: totalBeforeServices,
        monthly: totalMonthly
      }
    });

    const blob = createPdfBlob(pdfLines);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Car className="h-5 w-5" />
          <span className="text-sm uppercase tracking-wide font-semibold">
            Configurateur véhicule
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Composez votre offre étape par étape
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Sélectionnez un modèle importé depuis Neon, ajoutez vos options puis générez un PDF
            récapitulatif à partager immédiatement avec votre prospect.
          </p>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} />

      {renderStepContent({
        currentStep,
        selectedModelName,
        setSelectedModelName,
        availableModelNames,
        selectedModel,
        selectedFinishName,
        setSelectedFinishName,
        vehicles,
        selectedColorId,
        setSelectedColorId,
        selectedFinish,
        optionCategories,
        selectedOptions,
        setSelectedOptions,
        selectedAccessories,
        setSelectedAccessories,
        financingId,
        setFinancingId,
        selectedFinancing,
        insuranceId,
        setInsuranceId,
        selectedInsurance,
        downPayment,
        totalBeforeServices,
        optionsPrice,
        accessoriesPrice,
        monthlyPayment,
        totalMonthly,
        selectedOptionEntities,
        selectedAccessoryEntities,
        handleGeneratePdf
      })}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
        >
          Étape précédente
        </Button>
        {currentStep < steps.length && (
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length))}
            disabled={!canGoForward}
          >
            Continuer vers l’étape {currentStep + 1}
          </Button>
        )}
      </div>
    </div>
  );
}

function renderStepContent(props: {
  currentStep: number;
  selectedModelName: string;
  setSelectedModelName: Dispatch<SetStateAction<string>>;
  availableModelNames: string[];
  selectedModel: (typeof VEHICLE_MODELS)[number];
  selectedFinishName: string;
  setSelectedFinishName: Dispatch<SetStateAction<string>>;
  vehicles: SelectVehicle[];
  selectedColorId: string;
  setSelectedColorId: Dispatch<SetStateAction<string>>;
  selectedFinish?: (typeof VEHICLE_MODELS)[number]['finishes'][number];
  optionCategories: Array<(typeof VEHICLE_OPTIONS)[number]['category']>;
  selectedOptions: string[];
  setSelectedOptions: Dispatch<SetStateAction<string[]>>;
  selectedAccessories: string[];
  setSelectedAccessories: Dispatch<SetStateAction<string[]>>;
  financingId: string;
  setFinancingId: Dispatch<SetStateAction<string>>;
  selectedFinancing: FinancingPlan;
  insuranceId: string;
  setInsuranceId: Dispatch<SetStateAction<string>>;
  selectedInsurance: (typeof INSURANCE_PLANS)[number];
  downPayment: number;
  totalBeforeServices: number;
  optionsPrice: number;
  accessoriesPrice: number;
  monthlyPayment: number;
  totalMonthly: number;
  selectedOptionEntities: VehicleOption[];
  selectedAccessoryEntities: VehicleAccessory[];
  handleGeneratePdf: () => void;
}) {
  switch (props.currentStep) {
    case 1:
      return (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Étape 1 · Modèle & finition</CardTitle>
            <CardDescription>
              Sélectionnez une combinaison importée depuis vos fichiers Excel (colonne A/B).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Select value={props.selectedModelName} onValueChange={props.setSelectedModelName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {props.availableModelNames.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Finition</Label>
                <Select value={props.selectedFinishName} onValueChange={props.setSelectedFinishName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une finition" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFinishOptionsForModel(
                      props.vehicles,
                      props.selectedModelName,
                      props.selectedModel
                    ).map((finish) => (
                      <SelectItem key={finish} value={finish}>
                        {finish}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Couleur carrosserie</Label>
                <Select value={props.selectedColorId} onValueChange={props.setSelectedColorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {props.selectedModel.colors.map((color) => (
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
                  {props.selectedModel.highlights.map((item) => (
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
                title={props.selectedModel.range}
                description="Autonomie mixte"
              />
              <InfoTile
                icon={<Sparkles className="h-5 w-5" />}
                title={props.selectedModel.power}
                description="Puissance cumulée"
              />
              <InfoTile
                icon={<Leaf className="h-5 w-5" />}
                title={props.selectedModel.charging}
                description="Temps de charge"
              />
            </div>

            {props.selectedFinish && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Finition {props.selectedFinish.name}</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground grid gap-1">
                  {props.selectedFinish.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      );
    case 2:
      return (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Étape 2 · Options & accessoires</CardTitle>
            <CardDescription>
              Composez une dotation adaptée aux usages du client (productivité, confort, sécurité).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {props.optionCategories.map((category) => (
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
                    {
                      props.selectedOptions.filter((id) =>
                        VEHICLE_OPTIONS.some(
                          (option) => option.id === id && option.category === category
                        )
                      ).length
                    }
                    {' / '}
                    {VEHICLE_OPTIONS.filter((option) => option.category === category).length}
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {VEHICLE_OPTIONS.filter((option) => option.category === category).map(
                    (option) => (
                      <OptionCheckbox
                        key={option.id}
                        option={option}
                        checked={props.selectedOptions.includes(option.id)}
                        onChange={(checked) => {
                          props.setSelectedOptions((previous) =>
                            checked
                              ? [...previous, option.id]
                              : previous.filter((id) => id !== option.id)
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
                    checked={props.selectedAccessories.includes(accessory.id)}
                    onChange={(checked) => {
                      props.setSelectedAccessories((previous) =>
                        checked
                          ? [...previous, accessory.id]
                          : previous.filter((id) => id !== accessory.id)
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    case 3:
      return (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Étape 3 · Financement & assurance</CardTitle>
            <CardDescription>
              Alignez le plan de financement et la couverture pour sécuriser la signature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Plan de financement</Label>
                <Select value={props.financingId} onValueChange={props.setFinancingId}>
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
                <p className="text-sm text-muted-foreground">{props.selectedFinancing.description}</p>
              </div>
              <div className="space-y-2">
                <Label>Assurance</Label>
                <Select value={props.insuranceId} onValueChange={props.setInsuranceId}>
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
                <p className="text-sm text-muted-foreground">{props.selectedInsurance.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoTile
                icon={<CreditCard className="h-5 w-5" />}
                title={currency.format(props.downPayment)}
                description="Apport estimé"
              />
              <InfoTile
                icon={<ShieldCheck className="h-5 w-5" />}
                title={`${currency.format(props.selectedInsurance.monthlyPrice)} / mois`}
                description="Prime assurance"
              />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-semibold">Services inclus</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {props.selectedFinancing.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
              <div className="border-t pt-3">
                <p className="text-xs uppercase text-muted-foreground mb-1">Couverture</p>
                <div className="flex flex-wrap gap-2">
                  {props.selectedInsurance.coverage.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    case 4:
    default:
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Étape 4 · Résumé budgétaire</CardTitle>
                  <CardDescription>
                    Vue instantanée de la configuration sélectionnée avec export PDF.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={props.handleGeneratePdf}>
                  Générer le PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <SummaryRow
                  label={`Modèle ${props.selectedModelName}`}
                  value={currency.format(props.selectedModel.basePrice)}
                />
                {props.selectedFinish && (
                  <SummaryRow
                    label={`Finition ${props.selectedFinish.name}`}
                    value={currency.format(props.selectedFinish.price)}
                  />
                )}
                {props.selectedModel.colors.length > 0 && (
                  <SummaryRow
                    label={`Couleur ${props.selectedModel.colors.find((color) => color.id === props.selectedColorId)?.name ?? 'Standard'}`}
                    value={currency.format(
                      props.selectedModel.colors.find((color) => color.id === props.selectedColorId)?.price ?? 0
                    )}
                  />
                )}
                <SummaryRow label="Options" value={currency.format(props.optionsPrice)} />
                <SummaryRow label="Accessoires" value={currency.format(props.accessoriesPrice)} />
                <SummaryRow
                  label="Total véhicule"
                  value={currency.format(props.totalBeforeServices)}
                  emphasis
                />
              </div>
              <div className="rounded-lg bg-muted/60 p-3 text-sm">
                <p className="font-semibold mb-1">Financement</p>
                <p>
                  {props.selectedFinancing.name} – {currency.format(props.monthlyPayment)} / mois
                </p>
                <p className="text-muted-foreground">
                  Assurance {props.selectedInsurance.name} ({currency.format(props.selectedInsurance.monthlyPrice)} / mois)
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Options & accessoires</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {props.selectedOptionEntities.length === 0 && props.selectedAccessoryEntities.length === 0 && (
                    <li>Aucune option ajoutée</li>
                  )}
                  {props.selectedOptionEntities.map((option) => (
                    <li key={option.id}>
                      {option.name} ({currency.format(option.price)})
                    </li>
                  ))}
                  {props.selectedAccessoryEntities.map((accessory) => (
                    <li key={accessory.id}>
                      {accessory.name} ({currency.format(accessory.price)})
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full" variant="secondary">
                Enregistrer cette configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Argumentaire express</CardTitle>
              <CardDescription>Points clés pour votre rendez-vous ou votre devis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ArgumentLine
                title="Budget maîtrisé"
                value={`${currency.format(props.totalBeforeServices)} TTC`}
                description="Comprend véhicule, finition et équipements sélectionnés."
              />
              <ArgumentLine
                title="Mensualité packagée"
                value={`${currency.format(Math.round(props.totalMonthly))} / mois`}
                description="Financement + assurance + services inclus."
              />
              <ArgumentLine
                title="Mise à disposition"
                value="8 à 10 semaines"
                description="Peut être accélérée selon disponibilités stock."
              />
              <ArgumentLine
                title="Empreinte carbone"
                value="0 g CO₂/km WLTP"
                description="Eligible bonus écologique et suramortissement flotte."
              />
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                Cliquez sur « Générer le PDF » pour produire une fiche partagée avec votre prospect.
              </div>
            </CardContent>
          </Card>
        </div>
      );
  }
}

function getFinishOptionsForModel(
  vehicles: SelectVehicle[],
  modelName: string,
  selectedModel: (typeof VEHICLE_MODELS)[number]
) {
  const importedFinishes = vehicles
    .filter((vehicle) => vehicle.model === modelName)
    .map((vehicle) => vehicle.finish)
    .filter((finish): finish is string => Boolean(finish));

  if (importedFinishes.length > 0) {
    return Array.from(new Set(importedFinishes));
  }

  const staticModel = VEHICLE_MODELS.find((model) => model.name === modelName) ?? selectedModel;
  return staticModel.finishes.map((finish) => finish.name);
}

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
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -plan.months));
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
          <span className="text-sm text-muted-foreground">{currency.format(option.price)}</span>
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

type StepIndicatorProps = {
  currentStep: number;
};

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <ol className="grid gap-4 sm:grid-cols-4">
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        return (
          <li
            key={step.id}
            className={`rounded-xl border p-4 transition ${
              isCurrent
                ? 'border-primary bg-primary/5'
                : isCompleted
                  ? 'border-primary/40 bg-primary/5'
                  : 'bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                  isCompleted || isCurrent
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.id}
              </div>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type PdfData = {
  model: string;
  finish: string;
  color: string;
  options: VehicleOption[];
  accessories: VehicleAccessory[];
  financing: FinancingPlan;
  insurance: (typeof INSURANCE_PLANS)[number];
  totals: {
    vehicle: number;
    options: number;
    accessories: number;
    grandTotal: number;
    monthly: number;
  };
};

function buildPdfLines(data: PdfData) {
  return [
    'Configuration véhicule',
    `Modèle : ${data.model}`,
    `Finition : ${data.finish}`,
    `Couleur : ${data.color}`,
    '',
    'Options & accessoires',
    ...(data.options.length === 0 && data.accessories.length === 0
      ? ['Aucune option sélectionnée']
      : [
          ...data.options.map(
            (option) => `${option.name} – ${currency.format(option.price)}`
          ),
          ...data.accessories.map(
            (accessory) => `${accessory.name} – ${currency.format(accessory.price)}`
          )
        ]),
    '',
    'Financement & services',
    `${data.financing.name} – ${currency.format(calculateMonthlyPayment(data.totals.grandTotal, data.financing))} / mois`,
    `Assurance ${data.insurance.name} – ${currency.format(data.insurance.monthlyPrice)} / mois`,
    '',
    'Synthèse budgétaire',
    `Véhicule + finition : ${currency.format(data.totals.vehicle)}`,
    `Options : ${currency.format(data.totals.options)}`,
    `Accessoires : ${currency.format(data.totals.accessories)}`,
    `Total TTC : ${currency.format(data.totals.grandTotal)}`,
    `Mensualité packagée : ${currency.format(Math.round(data.totals.monthly))} / mois`
  ];
}

function createPdfBlob(lines: string[]) {
  const safeLines = lines.map((line) =>
    line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  );
  const textBlocks = safeLines
    .map((line, index) => `${index === 0 ? '' : 'T* ' }(${line || ' '}) Tj`)
    .join('\n');

  const streamContent = `BT\n/F1 12 Tf\n14 TL\n72 760 Td\n${textBlocks}\nET`;
  const encoder = new TextEncoder();
  const header = '%PDF-1.4\n';
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
  const streamBytes = encoder.encode(streamContent);
  const obj4 = `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const objects = [obj1, obj2, obj3, obj4, obj5];

  const headerBytes = encoder.encode(header);
  const objectBytes = objects.map((object) => encoder.encode(object));
  let offset = headerBytes.length;
  const offsets: number[] = [];

  for (const bytes of objectBytes) {
    offsets.push(offset);
    offset += bytes.length;
  }

  const xrefOffset = offset;
  const xrefEntries = offsets
    .map((value) => `${value.toString().padStart(10, '0')} 00000 n \n`)
    .join('');
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${xrefEntries}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const xrefBytes = encoder.encode(xref);
  const trailerBytes = encoder.encode(trailer);
  const totalLength =
    headerBytes.length +
    objectBytes.reduce((sum, bytes) => sum + bytes.length, 0) +
    xrefBytes.length +
    trailerBytes.length;

  const pdfBytes = new Uint8Array(totalLength);
  let pointer = 0;

  pdfBytes.set(headerBytes, pointer);
  pointer += headerBytes.length;

  for (const bytes of objectBytes) {
    pdfBytes.set(bytes, pointer);
    pointer += bytes.length;
  }

  pdfBytes.set(xrefBytes, pointer);
  pointer += xrefBytes.length;
  pdfBytes.set(trailerBytes, pointer);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}
