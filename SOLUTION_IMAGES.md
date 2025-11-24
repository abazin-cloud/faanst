# 🔧 Solution au problème des images manquantes

## ❌ Problème Identifié

Les images ne s'affichent pas car la colonne `image_url` de votre base de données contient **"boîte manuelle"** au lieu d'URLs réelles.

Cela s'est produit lors de l'import CSV car le système a mappé la mauvaise colonne vers `image_url`.

## ✅ Solution : Ré-importer avec le bon format

### Option 1 : Fichier d'exemple fourni (RECOMMANDÉ)

1. **Allez sur** : `http://localhost:3000/settings`

2. **Uploadez** : `exemple-vehicules-complet.csv`
   - Ce fichier contient 16 véhicules
   - Chaque véhicule a : modèle, finition, prix, description ET une vraie URL d'image
   - Les images proviennent d'Unsplash (gratuites)

3. **Vérifiez** : Les véhicules apparaissent avec leurs images dans `/configurateur`

### Option 2 : Créer votre propre fichier CSV correct

Votre fichier CSV doit avoir **EXACTEMENT** ces colonnes dans cet ordre :

```csv
Modèle,Finition,Prix,Description,Image
Audi A3,Premium,45000,Audi A3 Premium — motorisation essence,https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400
Volkswagen Golf,Base,22000,Citadine confortable,https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400
```

**Points importants :**
- La colonne **"Image"** (ou "URL" ou "Photo") doit être la **5ème colonne**
- Elle doit contenir une URL complète commençant par `https://`
- Les colonnes doivent être dans l'ordre : Modèle, Finition, Prix, Description, Image

### Option 3 : Nettoyer et ré-importer

Si vous voulez utiliser votre propre fichier :

1. **Ouvrez votre fichier Excel/CSV**
2. **Vérifiez que vous avez ces colonnes** :
   - A : Modèle (ex: "Audi A3")
   - B : Finition (ex: "Premium")
   - C : Prix (ex: 45000 - NOMBRE, pas texte)
   - D : Description (ex: "Audi A3 Premium — motorisation essence")
   - E : Image (ex: "https://images.unsplash.com/photo-xxx?w=400")

3. **Supprimez les colonnes inutiles** comme "boîte manuelle", "transmission", etc.

4. **Sauvegardez en CSV**

5. **Ré-importez** sur `/settings`

## 🌐 Où trouver des images gratuites ?

### Unsplash (Recommandé)
- Site : https://unsplash.com
- Recherchez "audi a3", "volkswagen golf", etc.
- Cliquez sur une image
- Copiez l'URL et ajoutez `?w=400` à la fin
- Exemple : `https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400`

### Format d'URL recommandé
```
https://images.unsplash.com/photo-[ID]?w=400&h=300&fit=crop
```

Paramètres :
- `w=400` : largeur 400px
- `h=300` : hauteur 300px (optionnel)
- `fit=crop` : recadrage automatique

## 📊 Exemple complet de fichier CSV

```csv
Modèle,Finition,Prix,Description,Image
Audi A3,Premium,45000,Audi A3 Premium — motorisation essence,https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400
Audi A3,Sport,48000,Version sportive dynamique,https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400
Volkswagen Golf,Base,22000,Citadine confortable et économique,https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400
Mercedes Classe A,Confort,35000,Élégance et technologie,https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400
```

## 🧪 Test Rapide

1. **Téléchargez le fichier d'exemple** : `exemple-vehicules-complet.csv`
2. **Allez sur** : http://localhost:3000/settings
3. **Uploadez le fichier**
4. **Vérifiez** : "16 véhicules importés avec succès"
5. **Allez sur** : http://localhost:3000/configurateur
6. **Résultat** : Vous devriez voir les véhicules avec leurs images !

## ❓ Dépannage

### Les images ne se chargent toujours pas après import
- Vérifiez que les URLs commencent par `https://` (pas `http://`)
- Testez l'URL dans votre navigateur pour vérifier qu'elle fonctionne
- Assurez-vous qu'il n'y a pas d'espaces avant/après l'URL

### "Erreur lors de l'import"
- Vérifiez que votre fichier a bien les 5 colonnes
- Assurez-vous que la première ligne est bien l'en-tête
- Le prix doit être un nombre (sans €, sans espace)

### Les véhicules apparaissent mais sans images
- Rechargez la page (F5 ou Cmd+R)
- Vérifiez la console du navigateur (F12) pour voir les erreurs
- Certaines URLs peuvent être bloquées par CORS

## 🚀 Prochaines étapes

Une fois que vous avez importé correctement :
1. ✅ Les images apparaissent dans le sélecteur de véhicules
2. ✅ Les images sont dans le résumé (étape 4)
3. ✅ Les images sont dans le PDF généré

---

**Besoin d'aide ?** Utilisez d'abord le fichier `exemple-vehicules-complet.csv` pour vérifier que tout fonctionne !




















