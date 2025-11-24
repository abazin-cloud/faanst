# 📊 Guide d'Import CSV Complet - Véhicules

## 🎉 Nouvelles Fonctionnalités

Le système d'import CSV a été considérablement amélioré pour accepter **toutes les colonnes** de votre fichier, pas seulement modèle et finition !

## 📋 Format CSV Accepté

### Colonnes Supportées

Votre fichier CSV peut maintenant contenir jusqu'à **5 colonnes** :

| Colonne | Noms Acceptés | Obligatoire | Description |
|---------|---------------|-------------|-------------|
| **Modèle** | `Modèle`, `Modele`, `Model` | ✅ Oui | Nom du modèle de véhicule |
| **Finition** | `Finition`, `Finish` | ✅ Oui | Niveau de finition |
| **Prix** | `Prix`, `Price` | ❌ Non | Prix de base en € (nombre) |
| **Description** | `Description` | ❌ Non | Description du véhicule |
| **Image** | `Image`, `Photo`, `URL` | ❌ Non | URL de l'image du véhicule |

### Exemple de Fichier CSV Complet

```csv
Modèle,Finition,Prix,Description,Image
Peugeot 208,Active,18990,Citadine économique et moderne,https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400
Peugeot 208,Allure,21490,Confort et technologie embarquée,https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400
Peugeot 3008,GT,39990,SUV haut de gamme sport,https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400
```

### Exemple Minimal (Modèle + Finition seulement)

```csv
Modèle,Finition
Peugeot 208,Active
Peugeot 208,Allure
Renault Clio,Life
```

## 🔍 Détection Automatique

### Détection des En-têtes

Le système détecte automatiquement :
- ✅ **Le séparateur** : virgule (`,`), point-virgule (`;`) ou tabulation
- ✅ **Les noms de colonnes** : français ou anglais, avec ou sans accents
- ✅ **Le format des prix** : avec ou sans symbole €, avec espaces ou non

### Mappinge Intelligent

Si votre fichier n'a pas d'en-têtes ou des noms différents :
- **Colonne 1** → Modèle
- **Colonne 2** → Finition
- **Colonne 3** → Prix (si présente)
- **Colonne 4** → Description (si présente)
- **Colonne 5** → Image URL (si présente)

## 🎨 Affichage dans le Configurateur

### Étape 1 : Sélection du Véhicule

Les véhicules s'affichent maintenant avec :
- 📸 **Image** en haut de la carte (si fournie)
- 📝 **Description** sous le nom
- 💰 **Prix de base** bien visible
- ✅ **Badge de sélection** sur l'image

### Étape 4 : Résumé

Le résumé inclut maintenant :
- 📸 **Photo du véhicule** sélectionné
- 📝 **Description complète**
- 💰 **Prix de base** + options
- 💳 **Détails de financement**

### PDF Généré

Le PDF contient :
- 📸 **Image du véhicule** en grand format
- 📋 **Tous les détails** : modèle, finition, description
- 💰 **Prix détaillé** : base + options
- 💳 **Plan de financement** choisi
- 📄 **Mise en page professionnelle**

## 💻 Utilisation

### 1. Préparez Votre Fichier

**Option A : Fichier Excel Complet**
```
| Modèle       | Finition | Prix  | Description                    | Image                      |
|--------------|----------|-------|--------------------------------|----------------------------|
| Peugeot 208  | Active   | 18990 | Citadine économique           | https://example.com/1.jpg  |
| Peugeot 208  | Allure   | 21490 | Confort et technologie        | https://example.com/2.jpg  |
```

**Option B : CSV Simple**
```csv
Modèle,Finition,Prix
Peugeot 208,Active,18990
Peugeot 208,Allure,21490
```

### 2. Uploadez le Fichier

1. Allez sur `/settings`
2. Cliquez sur "Choisir un fichier"
3. Sélectionnez votre CSV ou Excel
4. Cliquez sur "Mettre à jour la base véhicules"

### 3. Vérification

- ✅ Le nombre de véhicules importés s'affiche
- ✅ La liste apparaît à droite avec tous les modèles
- ✅ Les véhicules sont immédiatement disponibles dans `/configurateur`

## 🌐 Sources d'Images

### Images Gratuites Recommandées

- **Unsplash** : `https://images.unsplash.com/photo-XXXXX?w=400`
- **Pexels** : `https://images.pexels.com/photos/XXXXX/pexels-photo-XXXXX.jpeg?w=400`
- **Vos propres images** : Hébergez sur votre serveur

### Format d'URL Recommandé

```
https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop
```

**Paramètres utiles :**
- `w=400` : largeur en pixels
- `h=300` : hauteur en pixels
- `fit=crop` : recadrage automatique

### Fallback

Si une image ne charge pas :
- ✅ Elle sera automatiquement masquée
- ✅ Le reste de la carte reste fonctionnel
- ✅ Aucune erreur ne bloque l'utilisateur

## 📊 Exemple Complet

Utilisez le fichier `/exemple-vehicules-complet.csv` inclus dans le projet :

```csv
Modèle,Finition,Prix,Description,Image
Peugeot 208,Active,18990,Citadine économique et moderne,https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400
Peugeot 208,Allure,21490,Confort et technologie embarquée,https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400
Peugeot 208,GT Line,24990,Version sportive avec équipements premium,https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400
Peugeot 3008,Active,29990,SUV familial spacieux,https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400
Peugeot 3008,Allure,33990,SUV avec i-Cockpit digital,https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400
Peugeot 3008,GT,39990,SUV haut de gamme sport,https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400
Renault Clio,Life,16990,Compacte polyvalente,https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400
Renault Clio,Techno,19990,Connectivité et sécurité avancées,https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400
Renault Clio,RS Line,23490,Look sportif et dynamique,https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400
Renault Captur,Zen,23990,SUV compact urbain,https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400
Renault Captur,Intens,26990,Équipements confort et multimédia,https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400
Citroën C3,Live,15990,Citadine originale et confortable,https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400
Citroën C3,Feel,17990,Design audacieux personnalisable,https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400
Citroën C3,Shine,20490,Finition haut de gamme,https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400
Citroën C4,Sense,25990,Berline compacte innovante,https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400
Citroën C4,Shine,28990,Confort suspensions Progressive Hydraulic Cushions,https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400
```

## 🛠️ Dépannage

### Les images ne s'affichent pas

**Causes possibles :**
- ❌ URL incorrecte ou image supprimée
- ❌ Problème CORS (certains sites bloquent l'affichage)
- ❌ URL HTTP au lieu de HTTPS

**Solutions :**
- ✅ Utilisez des URLs Unsplash ou Pexels
- ✅ Vérifiez que l'URL commence par `https://`
- ✅ Testez l'URL dans votre navigateur avant l'import

### Les prix ne s'affichent pas

**Causes possibles :**
- ❌ Format incorrect (texte au lieu de nombre)
- ❌ Virgule au lieu de point pour les décimales

**Solutions :**
- ✅ Utilisez `18990` ou `18990.50`
- ✅ Sans symbole € ni espace
- ✅ Le point comme séparateur décimal

### L'import échoue

**Solutions :**
- ✅ Vérifiez que les 2 premières colonnes sont bien Modèle et Finition
- ✅ Assurez-vous qu'il n'y a pas de lignes vides au milieu
- ✅ Supprimez les caractères spéciaux dans les en-têtes

## 📈 Améliorations Apportées

### Import CSV
- ✅ Détection automatique de **toutes les colonnes**
- ✅ Support des **5 champs** : modèle, finition, prix, description, image
- ✅ Nettoyage automatique des données (BOM, guillemets, espaces)
- ✅ Meilleurs messages d'erreur

### Configurateur
- ✅ Affichage des **images** sur les cartes véhicules
- ✅ **Descriptions** visibles
- ✅ **Prix** bien mis en avant
- ✅ Design amélioré avec images

### Résumé (Étape 4)
- ✅ **Image du véhicule** affichée
- ✅ **Description complète**
- ✅ Tous les détails visibles

### PDF
- ✅ **Image du véhicule** incluse
- ✅ Mise en page professionnelle
- ✅ Tous les champs exportés

## 🚀 Prochaines Étapes

1. **Testez avec le fichier d'exemple** : `exemple-vehicules-complet.csv`
2. **Créez votre propre CSV** avec vos véhicules
3. **Trouvez des images** sur Unsplash/Pexels
4. **Importez et testez** le configurateur
5. **Générez un PDF** pour voir le résultat final

---

**Bon import ! 🚗📊**




















