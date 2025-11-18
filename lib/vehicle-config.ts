export type VehicleFinish = {
  id: string;
  name: string;
  price: number;
  highlights: string[];
};

export type VehicleColor = {
  id: string;
  name: string;
  price: number;
  tone: string;
};

export type VehicleModel = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  range: string;
  power: string;
  battery: string;
  charging: string;
  highlights: string[];
  finishes: VehicleFinish[];
  colors: VehicleColor[];
};

export type VehicleOption = {
  id: string;
  name: string;
  category: 'Confort' | 'Technologie' | 'Sécurité';
  description: string;
  price: number;
};

export type VehicleAccessory = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type FinancingPlan = {
  id: string;
  name: string;
  description: string;
  months: number;
  rate: number; // annual percentage rate
  downPaymentRate: number;
  residualValueRate?: number;
  services: string[];
};

export type InsurancePlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  coverage: string[];
};

export const VEHICLE_MODELS: VehicleModel[] = [
  {
    id: 'aura',
    name: 'Aura E-Tech',
    description: 'Berline familiale 100% électrique, pensée pour les longs trajets et les usages professionnels exigeants.',
    basePrice: 32900,
    range: '520 km WLTP',
    power: '204 ch / 150 kW',
    battery: '77 kWh utiles',
    charging: '10-80% en 28 min (150 kW)',
    highlights: ['Toit panoramique', 'Assistant de conduite niveau 2', 'Planificateur de charge connecté'],
    finishes: [
      {
        id: 'urban',
        name: 'Urban Pulse',
        price: 0,
        highlights: ['Sellerie tissu recyclé', 'Jantes 18"', 'Assistant maintien de voie']
      },
      {
        id: 'intense',
        name: 'Intense Tech',
        price: 2400,
        highlights: ['Projecteurs Matrix LED', 'Affichage tête haute', 'Audio premium 12 HP']
      },
      {
        id: 'executive',
        name: 'Executive Lounge',
        price: 5200,
        highlights: ['Sièges ventilés', 'Planche de bord microfibre', 'Pack chauffeur']
      }
    ],
    colors: [
      { id: 'blanc-nacre', name: 'Blanc Nacré', price: 0, tone: 'clair' },
      { id: 'gris-sideral', name: 'Gris Sidéral', price: 650, tone: 'gris' },
      { id: 'bleu-abyss', name: 'Bleu Abyssal', price: 750, tone: 'bleu' },
      { id: 'noir-onyx', name: 'Noir Onyx', price: 950, tone: 'sombre' }
    ]
  },
  {
    id: 'trail',
    name: 'Trail XR',
    description: 'SUV polyvalent avec transmission intégrale électrique et aides avancées sur terrains mixtes.',
    basePrice: 38900,
    range: '460 km WLTP',
    power: '272 ch / 200 kW',
    battery: '82 kWh utiles',
    charging: '10-80% en 31 min (170 kW)',
    highlights: ['Suspensions adaptatives', 'Mode 4x4 intelligent', 'Batterie garantie 8 ans'],
    finishes: [
      {
        id: 'adventure',
        name: 'Adventure',
        price: 0,
        highlights: ['Ski de protection', 'Sellerie anti-tâche', 'Barres de toit modulaires']
      },
      {
        id: 'performance',
        name: 'Performance',
        price: 3200,
        highlights: ['Suspensions pilotées', 'Projecteurs Matrix', 'Sono immersive']
      }
    ],
    colors: [
      { id: 'vert-boreal', name: 'Vert Boréal', price: 650, tone: 'vert' },
      { id: 'cuivre-sable', name: 'Cuivre Sablé', price: 850, tone: 'cuivre' },
      { id: 'gris-mineral', name: 'Gris Minéral', price: 0, tone: 'gris' }
    ]
  },
  {
    id: 'city',
    name: 'City One',
    description: 'Compacte agile pour les flottes urbaines avec faible coût d’usage et services connectés.',
    basePrice: 25900,
    range: '410 km WLTP',
    power: '170 ch / 125 kW',
    battery: '58 kWh utiles',
    charging: '10-80% en 25 min (135 kW)',
    highlights: ['Rayon de braquage réduit', 'Planificateur multi-utilisateurs', 'Services télématiques inclus 5 ans'],
    finishes: [
      {
        id: 'pulse',
        name: 'Pulse',
        price: 0,
        highlights: ['Jantes 17"', 'Pack sécurité 360°', 'Sellerie tissu eco']
      },
      {
        id: 'skyline',
        name: 'Skyline',
        price: 1800,
        highlights: ['Toit vitré', 'Stationnement automatisé', 'Éclairage d’ambiance']
      }
    ],
    colors: [
      { id: 'jaune-solstice', name: 'Jaune Solstice', price: 450, tone: 'jaune' },
      { id: 'bleu-skyline', name: 'Bleu Skyline', price: 550, tone: 'bleu' },
      { id: 'blanc-glacier', name: 'Blanc Glacier', price: 0, tone: 'clair' }
    ]
  }
];

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'pack-hiver',
    name: 'Pack Confort Hiver',
    category: 'Confort',
    description: 'Sièges chauffants AV/AR, volant chauffant et pare-brise dégivrant.',
    price: 890
  },
  {
    id: 'pack-luxe',
    name: 'Pack Ambiance Luxe',
    category: 'Confort',
    description: 'Sellerie cuir vegan perforé, éclairage d’ambiance 64 couleurs.',
    price: 1490
  },
  {
    id: 'pack-pro',
    name: 'Pack Business Pro',
    category: 'Technologie',
    description: 'Tablette arrière, prise 230V, outils de gestion de flotte temps réel.',
    price: 1290
  },
  {
    id: 'pack-drive',
    name: 'Assistant de conduite niveau 2+',
    category: 'Technologie',
    description: 'Pilotage mains-libres sur voies rapides avec changement de voie assisté.',
    price: 2150
  },
  {
    id: 'pack-safety',
    name: 'Pack Sécurité Avancée',
    category: 'Sécurité',
    description: 'Airbags latéraux étendus, caméra infrarouge, appel d’urgence proactif.',
    price: 980
  },
  {
    id: 'pack-remorquage',
    name: 'Attelage rétractable + faisceau',
    category: 'Sécurité',
    description: 'Capacité de tractage 1 200 kg avec stabilisation de remorque.',
    price: 1050
  }
];

export const VEHICLE_ACCESSORIES: VehicleAccessory[] = [
  {
    id: 'chargeur-11kw',
    name: 'Chargeur mural 11 kW connecté',
    description: 'Pilotage depuis l’app, badge RFID et supervision énergétique.',
    price: 1190
  },
  {
    id: 'station-mobile',
    name: 'Station de recharge mobile 22 kW',
    description: 'Solution nomade pour interventions sur sites clients.',
    price: 1890
  },
  {
    id: 'tapis-protect',
    name: 'Pack protection intégrale',
    description: 'Tapis premium, seuils inox et bacs de coffre renforcés.',
    price: 420
  },
  {
    id: 'support-connecte',
    name: 'Support tablette connecté',
    description: 'Charge à induction 15W et verrouillage antivol.',
    price: 310
  }
];

export const FINANCING_PLANS: FinancingPlan[] = [
  {
    id: 'cash',
    name: 'Paiement comptant',
    description: 'Règlement en une fois, livraison prioritaire et frais de dossier offerts.',
    months: 0,
    rate: 0,
    downPaymentRate: 0,
    services: ['Accès à la conciergerie livraison', 'Priorité atelier pendant 12 mois']
  },
  {
    id: 'credit48',
    name: 'Crédit Classique 48 mois',
    description: 'Taux fixe 2,9% TAEG, apport conseillé 15%.',
    months: 48,
    rate: 0.029,
    downPaymentRate: 0.15,
    services: ['Entretien constructeur 2 ans', 'Extension de garantie 5 ans']
  },
  {
    id: 'lld36',
    name: 'LLD Business 36 mois',
    description: 'Location longue durée avec engagement faible et services flottes.',
    months: 36,
    rate: 0.024,
    downPaymentRate: 0.1,
    residualValueRate: 0.3,
    services: ['Assistance 24/7', 'Gestion télématique intégrée']
  }
];

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'essentiel',
    name: 'Protection Essentielle',
    description: 'Responsabilité civile + bris de glace et assistance 0 km.',
    monthlyPrice: 49,
    coverage: ['Franchise fixe 350 €', 'Assistance européenne', 'Conducteur jusqu’à 2 personnes']
  },
  {
    id: 'complete',
    name: 'Protection Complète',
    description: 'Tous risques + véhicule de remplacement premium.',
    monthlyPrice: 79,
    coverage: ['Franchise 150 €', 'Valeur à neuf 36 mois', 'Protection des objets pro']
  },
  {
    id: 'executive',
    name: 'Executive Mobility',
    description: 'Couverture internationale avec télé-expertise express.',
    monthlyPrice: 109,
    coverage: ['Véhicule relais 24h', 'Garantie contenu professionnel', 'Indemnisation valeur catalogue 48 mois']
  }
];
