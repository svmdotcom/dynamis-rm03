# Dynamis RM03

Application mobile Expo / React Native développée pour faciliter l'utilisation technique de la machine Dynamis RM03.

L'application permet de rechercher un code, d'afficher les réglages des 9 boutons, de gérer des codes favoris, de consulter un mode d'emploi intégré et de personnaliser l'interface.

Version actuelle : 1.0.0  
Créée à Biot, 06410, France  
Licence : MIT

---

## Fonctionnalités

- Recherche de codes dans le codebook intégré
- Priorité aux correspondances exactes dans la recherche
- Affichage du code et des 9 réglages bouton par bouton
- Sélection du type de puissance : X, C, M, MM, M3, M4, M5, LM
- Sélection de la hauteur de puissance : 1, 4, 6, 15, 30, 50, 100, 200
- Gestion des codes favoris (persistance locale)
- Mode d'emploi intégré multilingue
- Interface multilingue : français, anglais, espagnol
- Paramètres de langue (auto, FR, EN, ES)
- Thèmes disponibles : sombre, clair, bois RM03
- Fond bois RM03 intégré
- Barre de navigation basse : Retour / Accueil
- Section À propos : version, origine, licence
- Section Mises à jour

---

## Statut de la version 1.0.0

Validé :
- Application lancée sur émulateur Android Pixel 8
- Expo Dev Client fonctionnel
- Metro Bundler fonctionnel
- Navigation principale fonctionnelle
- TypeScript sans erreur
- Thèmes fonctionnels (sombre / clair / bois)
- Langues FR / EN / ES fonctionnelles
- Manuel multilingue fonctionnel

À compléter dans les prochaines versions :
- Import complet du codebook Dynamis RM03
- Amélioration du mode de recherche
- Écran de saisie directe d'un code manuel
- Préparation d'un build de publication Google Play
- Lien réel vers la page Google Play pour les mises à jour

---

## Installation locale

Prérequis :
- Node.js ≥ 18
- npm
- Android Studio + Android SDK
- Java 17 configuré
- Expo Dev Client installé sur le device ou émulateur

```bash
npm install
npx expo start --dev-client
```

---

## Commandes utiles

```bash
# Démarrer Metro Bundler
npx expo start

# Démarrer avec Expo Dev Client
npx expo start --dev-client

# Vérification TypeScript
npx tsc --noEmit

# Lancer sur Android (émulateur ou device connecté)
npx expo run:android
```

---

## Structure du projet

```
dynamis-rm03/
├── assets/
│   └── backgrounds/
│       └── wood.jpeg
├── locales/
│   ├── fr.json
│   ├── en.json
│   └── es.json
├── src/
│   ├── components/
│   │   ├── ScreenBackground.tsx
│   │   ├── ScreenBottomNav.tsx
│   │   └── ScreenHeader.tsx
│   ├── data/
│   │   └── manualContent.ts
│   ├── i18n/
│   │   └── index.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── ManualScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── index.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   └── ThemeContext.tsx
│   └── types/
│       └── index.ts
├── app.json
├── package.json
└── README.md
```

---

## Thèmes

| Nom | Description |
|-----|-------------|
| `dark` | Sombre, brun profond |
| `light` | Clair, beige chaud |
| `wood` | Fond photo bois RM03, cartes miel semi-transparentes |

---

## Langues

| Code | Langue |
|------|--------|
| `fr` | Français |
| `en` | English |
| `es` | Español |

Sélection automatique selon la langue système, modifiable dans les paramètres.

---

## Codebook

Le codebook intégré contient les remèdes avec code, nom et catégorie.  
Version 1.0.0 : données de démonstration.  
Import complet du codebook Dynamis RM03 prévu dans une version ultérieure.

---

## Avertissement

> **Cette application est un outil d'aide technique à l'utilisation de la machine Dynamis RM03.**  
> Elle ne constitue pas un avis médical, un diagnostic, ni une recommandation thérapeutique.  
> Aucune promesse médicale n'est faite.  
> Consultez un professionnel de santé qualifié pour toute question médicale.

---

## Licence

MIT License  
Copyright (c) 2026 Stéphane Challet  
Créée à Biot, 06410, France
