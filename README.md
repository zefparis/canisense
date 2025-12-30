# Canisense

Canisense est une application web PWA (Progressive Web App) conçue pour aider les propriétaires de chiens à mieux comprendre le comportement de leur animal de compagnie. L'application utilise une architecture d'analyse comportementale avancée basée sur une multitude de moteurs spécialisés, offrant une observation probabiliste sans prétendre à une compréhension parfaite du chien.

## Fonctionnalités

- **Observation comportementale** : Analyse en temps réel des signaux visuels, audio, temporels et contextuels.
- **Moteurs modulaires** : 16 moteurs indépendants pour différents aspects du comportement (mouvement, posture, vocalisations, etc.).
- **Fusion probabiliste** : Combinaison intelligente des métriques pour une interprétation fiable.
- **Interface utilisateur simple** : Résultats présentés de manière claire et rassurante.
- **Historique et personnalisation** : Suivi des analyses et profils personnalisés.
- **Mode debug** : Inspection des métriques pour les développeurs.
- **PWA prête** : Fonctionne hors ligne et peut être installée comme une app native.

## Architecture

Canisense repose sur une pipeline modulaire :

1. **Capture** : Acquisition des signaux vidéo et audio (actuellement simulée).
2. **Pré-traitement** : Normalisation des données.
3. **Moteurs spécialisés** :
   - **Visuels** (5 moteurs) : Mouvement global, posture corporelle, queue, oreilles, tête/regard.
   - **Audio** (3 moteurs) : Activité sonore, signature vocale, rythme.
   - **Temporels** (4 moteurs) : Variation, accumulation, récupération, transitions.
   - **Contextuels** (4 moteurs) : Heure de la journée, durée de session, historique récent, baseline individuelle.
4. **Normalisation** : Standardisation des métriques (0-1).
5. **Fusion** : Calcul d'états latents (activation, tension, vigilance, fatigue).
6. **Interprétation utilisateur** : États synthétiques (Calme, Excité, Stressé, Mixte) avec niveau de confiance.

Chaque moteur produit des métriques quantitatives sans verdict final. La précision vient de la convergence des signaux.

## Installation et exécution

### Prérequis
- Node.js (version 18+)
- npm ou yarn

### Installation
```bash
git clone <repository-url>
cd canisense-web-new
npm install
```

### Exécution en développement
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build pour production
```bash
npm run build
npm start
```

## Utilisation

### Pages principales

- **Accueil (/)** : Présentation de Canisense et accès à l'observation.
- **Observer (/observer)** : Lancement d'une analyse comportementale. Inclut un mode debug pour inspecter les métriques.
- **Comprendre (/comprendre)** : Explication des méthodes d'analyse et niveaux de confiance.
- **Historique (/historique)** : Consultation des analyses passées.
- **Profil (/profil)** : Personnalisation du profil du chien (nom, âge, niveau d'énergie).

### Analyse comportementale

1. Accédez à la page Observer.
2. Cliquez sur "Analyser mon chien".
3. L'application traite les signaux simulés pendant 3 secondes.
4. Consultez le résultat : état détecté, explication, niveau de confiance.
5. Activez le mode debug pour voir les métriques détaillées.

### Personnalisation

- Configurez le profil de votre chien pour affiner les analyses.
- Les données sont stockées localement (localStorage).

## Développement

### Structure du projet
```
src/
├── analysis/          # Architecture d'analyse
│   ├── types.ts       # Interfaces et types
│   ├── baseEngine.ts  # Classe de base pour les moteurs
│   ├── engines/       # Moteurs spécialisés
│   ├── fusion.ts      # Normalisation et fusion
│   └── pipeline.ts    # Pipeline principal
├── app/               # Pages Next.js
│   ├── components/    # Composants (Navigation)
│   ├── layout.tsx     # Layout global
│   ├── page.tsx       # Accueil
│   ├── observer/      # Page d'observation
│   ├── comprendre/    # Page d'explication
│   ├── historique/    # Page d'historique
│   └── profil/        # Page de profil
└── globals.css        # Styles Tailwind
```

### Ajout de nouveaux moteurs

1. Étendez la classe `BaseEngine`.
2. Implémentez la méthode `process(signal: Signal)`.
3. Ajoutez le moteur à la `AnalysisPipeline`.
4. Mettez à jour la fusion si nécessaire.

### Observabilité

- Logs dans la console pour chaque moteur.
- Mode debug dans l'interface pour inspection des métriques.
- Métriques exposées via `pipeline.getAllMetrics()`.

## Technologies utilisées

- **Next.js 16** : Framework React avec App Router.
- **TypeScript** : Typage strict.
- **Tailwind CSS 4** : Styles utilitaires et responsives.
- **Web APIs** : Pour capture future (getUserMedia, Web Audio).

## Performances

- Calcul côté client, pas de backend requis.
- Simulation actuelle légère ; optimisation pour traitement réel à implémenter.
- Throttling et requestAnimationFrame pour les analyses en temps réel.

## Contribution

Ce projet est open-source. Contributions bienvenues pour améliorer l'architecture, ajouter des moteurs, ou intégrer des APIs de vision/audio réelles.

## Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

Canisense : Observer, mesurer, comprendre – sans prétendre deviner.
