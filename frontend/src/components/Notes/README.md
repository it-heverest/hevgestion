# Notes DSF Components

Ce dossier contient les composants React pour les différentes Notes du système DSF (Déclaration Sociale et Fiscale).

## Structure

```
Notes/
├── Note1/           # Note 1 - Dettes Garanties
│   └── index.tsx
├── Note2/           # Note 2 - [À implémenter]
├── Note3/           # Note 3 - [À implémenter]
├── Note4/           # Note 4 - [À implémenter]
├── Note5/           # Note 5 - [À implémenter]
└── index.ts         # Exports centralisés
```

## Fonctionnement

Chaque Note est un composant React complet qui permet :
- L'édition des données via un formulaire interactif
- L'export PDF avec html2canvas
- La sauvegarde des modifications

## Intégration avec AllReports

Les Notes sont automatiquement détectées dans AllReports via :
- `category: "note"` dans les métadonnées du rapport
- `id: "note-X"` pour identifier le numéro de la note

Lorsqu'un utilisateur clique sur "Voir" pour un rapport de type "note", AllReports ouvre le composant Note correspondant au lieu d'un fichier Excel.

## Ajouter une nouvelle Note

1. Créer un dossier `NoteX/` avec un fichier `index.tsx`
2. Implémenter le composant React avec les données et l'interface appropriée
3. Ajouter l'export dans `index.ts`
4. Ajouter le case dans `AllReports.tsx` pour le rendu

## Notes implémentées

- ✅ **Note 1**: Dettes Garanties par des Sûretés Réelles
- ⏳ **Note 2**: [En attente d'implémentation]
- ⏳ **Note 3**: [En attente d'implémentation]
- ⏳ **Note 4**: [En attente d'implémentation]
- ⏳ **Note 5**: [En attente d'implémentation]