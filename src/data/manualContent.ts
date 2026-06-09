import type { Language } from '../types';

type LocalizedText = { [L in Language]: string };
type LocalizedLines = { [L in Language]: string[] };

export type ManualSection = {
  key: string;
  title: LocalizedText;
  body: LocalizedLines;
};

export const manualSections: ManualSection[] = [
  {
    key: 'intro',
    title: {
      fr: 'Présentation',
      en: 'About the Device',
      es: 'Presentación',
    },
    body: {
      fr: [
        'Dynamis RM03 est un appareil de laboratoire permettant de reproduire des remèdes homéopathiques dans différentes puissances.',
        'Puissances disponibles : X, C, M, MM, M3, M4, M5, LM — jusqu\'à 999 999 MM.',
        'Fonction de copie : reproduction d\'un remède ou d\'une substance existante.',
      ],
      en: [
        'Dynamis RM03 is a workshop device for reproducing homeopathic remedies in various potencies.',
        'Available potencies: X, C, M, MM, M3, M4, M5, LM — up to 999,999 MM.',
        'Copy function: reproduces an existing remedy or substance.',
      ],
      es: [
        'Dynamis RM03 es un aparato de laboratorio para reproducir remedios homeopáticos en diversas potencias.',
        'Potencias disponibles: X, C, M, MM, M3, M4, M5, LM — hasta 999 999 MM.',
        'Función de copia: reproduce un remedio o sustancia existente.',
      ],
    },
  },
  {
    key: 'specs',
    title: {
      fr: 'Caractéristiques techniques',
      en: 'Specifications',
      es: 'Características técnicas',
    },
    body: {
      fr: [
        'Modèle : Dynamis RM03',
        'Type : Analogique',
        'Dimensions : 16 × 9 × 25 cm',
        'Boîtier : Bois naturel (hêtre étuvé)',
        'Alimentation : Pile 9V',
        'Poids : 1,2 kg',
      ],
      en: [
        'Model: Dynamis RM03',
        'Type: Analogue',
        'Dimensions: 16 × 9 × 25 cm',
        'Casing: Natural wood (steamed beech)',
        'Power supply: 9V battery',
        'Weight: 1.2 kg',
      ],
      es: [
        'Modelo: Dynamis RM03',
        'Tipo: Analógico',
        'Dimensiones: 16 × 9 × 25 cm',
        'Carcasa: Madera natural (haya vaporizada)',
        'Alimentación: Pila de 9V',
        'Peso: 1,2 kg',
      ],
    },
  },
  {
    key: 'buttons',
    title: {
      fr: 'Réglage des 9 boutons',
      en: 'Setting the 9 Buttons',
      es: 'Ajuste de los 9 botones',
    },
    body: {
      fr: [
        '9 boutons numérotés de 0 à 10, disposés de gauche à droite et de haut en bas.',
        'Rangée 1 : 4 boutons — Rangée 2 : 4 boutons — Rangée 3 : 1 bouton.',
        'Saisir le code en commençant par le bouton supérieur gauche.',
        'Si le code contient moins de 9 chiffres, laisser les boutons restants à 0.',
      ],
      en: [
        '9 buttons labeled 0–10, arranged left to right, top to bottom.',
        'Row 1: 4 buttons — Row 2: 4 buttons — Row 3: 1 button.',
        'Enter the code starting from the upper-left button.',
        'If the code has fewer than 9 digits, leave the remaining buttons at 0.',
      ],
      es: [
        '9 botones numerados del 0 al 10, dispuestos de izquierda a derecha y de arriba a abajo.',
        'Fila 1: 4 botones — Fila 2: 4 botones — Fila 3: 1 botón.',
        'Introducir el código comenzando por el botón superior izquierdo.',
        'Si el código tiene menos de 9 dígitos, dejar los botones restantes en 0.',
      ],
    },
  },
  {
    key: 'potency',
    title: {
      fr: 'Réglage de la puissance',
      en: 'Setting Potency',
      es: 'Ajuste de la potencia',
    },
    body: {
      fr: [
        'Type de puissance : X, C, M, MM, M3, M4, M5, LM.',
        'Hauteur de puissance : 1, 2, 4, 6, 15, 30, 50, 100, 200, 999.',
      ],
      en: [
        'Potency type: X, C, M, MM, M3, M4, M5, LM.',
        'Potency height: 1, 2, 4, 6, 15, 30, 50, 100, 200, 999.',
      ],
      es: [
        'Tipo de potencia: X, C, M, MM, M3, M4, M5, LM.',
        'Altura de potencia: 1, 2, 4, 6, 15, 30, 50, 100, 200, 999.',
      ],
    },
  },
  {
    key: 'prepare',
    title: {
      fr: 'Préparer un remède',
      en: 'Making a Remedy',
      es: 'Preparar un remedio',
    },
    body: {
      fr: [
        'Placer la substance dans le récipient inférieur (flacon plastique ou verre).',
        'Régler les 9 boutons selon le code du codebook.',
        'Régler le type et la hauteur de puissance.',
        'Appuyer et maintenir le bouton 0/1 pendant environ 7 secondes.',
      ],
      en: [
        'Place the substance in the lower dish (plastic or glass vial).',
        'Set the 9 buttons according to the codebook.',
        'Set the potency type and height.',
        'Press and hold the 0/1 button for approximately 7 seconds.',
      ],
      es: [
        'Colocar la sustancia en el recipiente inferior (frasco de plástico o vidrio).',
        'Ajustar los 9 botones según el código del codebook.',
        'Ajustar el tipo y la altura de potencia.',
        'Pulsar y mantener el botón 0/1 durante aproximadamente 7 segundos.',
      ],
    },
  },
  {
    key: 'copy',
    title: {
      fr: 'Copier un échantillon',
      en: 'Copying a Sample',
      es: 'Copiar una muestra',
    },
    body: {
      fr: [
        'Placer l\'échantillon à copier dans le récipient supérieur.',
        'Laisser les 9 boutons de code à 0.',
        'Régler le type et la hauteur de puissance.',
        'Appuyer et maintenir le bouton 0/1 pendant environ 7 secondes.',
      ],
      en: [
        'Place the sample to copy in the upper dish.',
        'Leave the 9 code buttons at 0.',
        'Set the potency type and height.',
        'Press and hold the 0/1 button for approximately 7 seconds.',
      ],
      es: [
        'Colocar la muestra a copiar en el recipiente superior.',
        'Dejar los 9 botones de código en 0.',
        'Ajustar el tipo y la altura de potencia.',
        'Pulsar y mantener el botón 0/1 durante aproximadamente 7 segundos.',
      ],
    },
  },
  {
    key: 'depotentiate',
    title: {
      fr: 'Dépotentialiser',
      en: 'Depotentiation',
      es: 'Despotencializar',
    },
    body: {
      fr: [
        'Placer la substance dans le récipient inférieur.',
        'Laisser les 9 boutons de code à 0.',
        'Régler la puissance sur LM et la hauteur sur 999.',
        'Appuyer et maintenir le bouton 0/1 pendant environ 15 secondes.',
      ],
      en: [
        'Place the substance in the lower dish.',
        'Leave the 9 code buttons at 0.',
        'Set potency type to LM and height to 999.',
        'Press and hold the 0/1 button for approximately 15 seconds.',
      ],
      es: [
        'Colocar la sustancia en el recipiente inferior.',
        'Dejar los 9 botones de código en 0.',
        'Ajustar la potencia a LM y la altura a 999.',
        'Pulsar y mantener el botón 0/1 durante aproximadamente 15 segundos.',
      ],
    },
  },
  {
    key: 'containers',
    title: {
      fr: 'Récipients',
      en: 'Containers',
      es: 'Recipientes',
    },
    body: {
      fr: [
        'Récipient inférieur [5] : préparation de remèdes — flacons plastique ou verre.',
        'Récipient supérieur [6] : copie d\'un échantillon — placer la source ici.',
      ],
      en: [
        'Lower dish [5]: for making remedies — plastic or glass vials.',
        'Upper dish [6]: for copying — place the source sample here.',
      ],
      es: [
        'Recipiente inferior [5]: para preparar remedios — frascos de plástico o vidrio.',
        'Recipiente superior [6]: para copiar — colocar aquí la muestra fuente.',
      ],
    },
  },
];
