# Mode Salon - Documentation

## Vue d'ensemble

Le **Mode Salon** est une fonctionnalité qui simplifie l'interface du CRM pour les commerciaux lors d'événements physiques (salons, foires, portes ouvertes, etc.). Il masque les fonctionnalités avancées pour ne laisser que l'essentiel.

## Activation du Mode Salon

### Toggle dans le Header

Un toggle (switch) est disponible dans le header de l'application :
- **Position** : Dans la barre d'en-tête, à droite de la barre de recherche
- **Icône** : Un magasin (Store) accompagne le toggle
- **État** : Le mode salon est persisté dans le localStorage du navigateur

### Comment l'activer

1. Connectez-vous à l'application CRM
2. Localisez le toggle "Mode Salon" dans le header
3. Activez-le en cliquant dessus
4. L'interface se transforme automatiquement

## Interface en Mode Salon

### Page d'accueil

Lorsque le mode salon est activé, la page d'accueil affiche **3 grandes cartes d'action** :

1. **Nouvelle Configuration** 🚗
   - Configure un véhicule pour le client
   - Redirige vers `/configurateur`
   - Icône : Voiture (bleu)

2. **Nouveau Lead** 🎯
   - Enregistre un nouveau prospect
   - Redirige vers `/leads`
   - Icône : Cible (vert)

3. **Prise de Rendez-vous** 📅
   - Planifie un rendez-vous avec un client
   - Redirige vers `/rendez-vous`
   - Icône : Calendrier (violet)

### Navigation Simplifiée

En mode salon, la navigation latérale ne montre que :
- **Dashboard** (accueil)
- **Configurateur**
- **Leads**

Les éléments suivants sont **masqués** :
- Customers
- Orders
- Products
- Analytics
- Settings (paramètres)

## Fonctionnalités Disponibles

### 1. Configuration de Véhicule

Permet de créer une configuration de véhicule personnalisée pour un client potentiel lors d'un salon.

**Accès** : Bouton "Nouvelle Configuration" ou menu latéral

### 2. Création de Lead

Formulaire simplifié pour capturer rapidement les informations d'un prospect rencontré sur le salon :
- Nom de la société
- Nom du contact
- Email
- Téléphone
- Valeur estimée
- Statut (Hot/Warm/Cold)
- Notes

**Accès** : Bouton "Nouveau Lead" ou menu latéral

### 3. Prise de Rendez-vous

Nouvelle fonctionnalité permettant de planifier un rendez-vous avec un client :
- **Informations client** : Nom, email, téléphone
- **Date et heure** : Sélection de la date et de l'heure du RDV
- **Lieu** : Adresse du rendez-vous
- **Notes** : Informations complémentaires

**Accès** : Bouton "Prise de Rendez-vous"

## Retour au Mode Normal

Pour désactiver le mode salon et revenir à l'interface complète :

1. Cliquez sur le toggle "Mode Salon" dans le header
2. L'application revient instantanément au mode normal
3. Toutes les fonctionnalités et la navigation complète sont restaurées

## Architecture Technique

### Fichiers Créés

1. **Context**
   - `lib/showroom-mode-context.tsx` : Gestion de l'état du mode salon avec React Context

2. **Composants UI**
   - `components/ui/switch.tsx` : Composant Switch (Radix UI)
   - `app/(dashboard)/showroom-mode-toggle.tsx` : Toggle du mode salon
   - `app/(dashboard)/showroom-home.tsx` : Page d'accueil mode salon
   - `app/(dashboard)/desktop-nav.tsx` : Navigation desktop adaptative
   - `app/(dashboard)/mobile-nav.tsx` : Navigation mobile adaptative

3. **Pages**
   - `app/(dashboard)/rendez-vous/page.tsx` : Page de prise de rendez-vous

4. **API**
   - `app/api/leads/route.ts` : Endpoint API pour récupérer les leads

### Dépendances Ajoutées

```json
"@radix-ui/react-switch": "^1.2.6"
```

### État Persisté

L'état du mode salon est sauvegardé dans le `localStorage` sous la clé `showroom-mode`, permettant de conserver le mode actif même après un rafraîchissement de la page.

## Cas d'Usage

### Scénario Typique - Salon Automobile

1. **Préparation** (avant le salon)
   - Le commercial active le mode salon sur sa tablette/ordinateur
   - L'interface se simplifie automatiquement

2. **Au salon** (pendant l'événement)
   - Un visiteur s'approche du stand
   - Le commercial peut :
     - Créer une configuration de véhicule en direct
     - Enregistrer le visiteur comme lead
     - Planifier un rendez-vous de suivi

3. **Après le salon**
   - Le commercial désactive le mode salon
   - Il retrouve toutes les fonctionnalités pour le suivi complet

## Conseils d'Utilisation

- **Tablettes** : Le mode salon est idéal sur tablette pour une utilisation en mobilité
- **Kiosk Mode** : Les grandes cartes sont conçues pour être facilement touchables
- **Rapidité** : L'interface simplifiée permet une saisie rapide entre deux clients
- **Focus** : Moins de distractions = plus d'efficacité sur le terrain

## Support

Pour toute question ou problème concernant le mode salon, contactez l'équipe de développement.














