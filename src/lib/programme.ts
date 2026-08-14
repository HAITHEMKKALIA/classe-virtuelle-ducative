export const MATIERES = [
  { value: "grammaire", label: "Grammaire" },
  { value: "conjugaison", label: "Conjugaison" },
  { value: "orthographe", label: "Orthographe" },
  { value: "vocabulaire", label: "Vocabulaire" },
  { value: "lecture", label: "Lecture / Compréhension" },
  { value: "expression_ecrite", label: "Expression écrite" },
  { value: "expression_orale", label: "Expression orale" },
  { value: "poesie", label: "Poésie & récitation" },
] as const;

export const NIVEAUX = [
  { value: 5, label: "5ème année primaire" },
  { value: 6, label: "6ème année primaire" },
] as const;

export const TRIMESTRES = [
  { value: 1, label: "1er trimestre" },
  { value: 2, label: "2ème trimestre" },
  { value: 3, label: "3ème trimestre" },
] as const;

export const matiereLabel = (v: string) =>
  MATIERES.find((m) => m.value === v)?.label ?? v;

type Plan = Record<number, Record<number, { module: string; contenus: string[] }[]>>;

/** Programme officiel tunisien de français — repères par trimestre. */
export const PROGRAMME: Plan = {
  5: {
    1: [
      {
        module: "Module 1 — La vie scolaire",
        contenus: [
          "Grammaire : la phrase simple, types et formes de phrases",
          "Conjugaison : présent de l'indicatif (1er, 2ème groupe)",
          "Orthographe : le pluriel des noms, accord sujet/verbe",
          "Vocabulaire : la classe, l'école, les fournitures",
          "Expression écrite : écrire un court texte narratif (3 à 5 phrases)",
        ],
      },
      {
        module: "Module 2 — La famille et le quartier",
        contenus: [
          "Grammaire : le groupe nominal, déterminants et adjectifs",
          "Conjugaison : présent des verbes être, avoir, aller, faire",
          "Orthographe : les homophones a/à, et/est",
          "Vocabulaire : la famille, la maison, le voisinage",
          "Expression écrite : décrire une personne, un lieu",
        ],
      },
    ],
    2: [
      {
        module: "Module 3 — La santé et l'hygiène",
        contenus: [
          "Grammaire : le complément d'objet direct et indirect",
          "Conjugaison : le passé composé avec avoir et être",
          "Orthographe : accord du participe passé avec être",
          "Vocabulaire : le corps, la santé, l'alimentation",
          "Expression écrite : rédiger un texte injonctif (conseils, recette)",
        ],
      },
      {
        module: "Module 4 — Les métiers",
        contenus: [
          "Grammaire : les compléments circonstanciels (temps, lieu, manière)",
          "Conjugaison : l'imparfait de l'indicatif",
          "Orthographe : ce/se, on/ont, son/sont",
          "Vocabulaire : les métiers et les outils",
          "Expression écrite : raconter une journée de travail",
        ],
      },
    ],
    3: [
      {
        module: "Module 5 — L'environnement",
        contenus: [
          "Grammaire : les adjectifs qualificatifs, le degré (comparatif)",
          "Conjugaison : le futur simple",
          "Orthographe : les accents et la ponctuation",
          "Vocabulaire : la nature, la pollution, la protection",
          "Expression écrite : écrire un texte argumentatif simple",
        ],
      },
      {
        module: "Module 6 — Les loisirs et les voyages",
        contenus: [
          "Grammaire : la phrase complexe, les connecteurs logiques",
          "Conjugaison : révision des temps étudiés",
          "Orthographe : dictée préparée",
          "Vocabulaire : le voyage, les sports, les fêtes",
          "Expression écrite : le récit de voyage illustré",
        ],
      },
    ],
  },
  6: {
    1: [
      {
        module: "Module 1 — Vivre ensemble",
        contenus: [
          "Grammaire : les fonctions dans la phrase (sujet, attribut, compléments)",
          "Conjugaison : présent, révision des trois groupes",
          "Orthographe : accord de l'adjectif, pluriels particuliers",
          "Vocabulaire : la citoyenneté, la solidarité",
          "Expression écrite : le récit à la première personne",
        ],
      },
      {
        module: "Module 2 — Le patrimoine tunisien",
        contenus: [
          "Grammaire : les propositions (indépendante, principale, subordonnée)",
          "Conjugaison : passé composé et imparfait dans le récit",
          "Orthographe : les homophones grammaticaux (leur/leurs, quel/qu'elle)",
          "Vocabulaire : le patrimoine, les monuments, l'artisanat",
          "Expression écrite : décrire un monument, un site",
        ],
      },
    ],
    2: [
      {
        module: "Module 3 — Sciences et découvertes",
        contenus: [
          "Grammaire : la voix active et la voix passive",
          "Conjugaison : le plus-que-parfait, le passé simple (lecture)",
          "Orthographe : accord du participe passé avec avoir",
          "Vocabulaire : les sciences, les inventions",
          "Expression écrite : le texte explicatif (documentaire illustré)",
        ],
      },
      {
        module: "Module 4 — Le monde du travail et l'avenir",
        contenus: [
          "Grammaire : les pronoms (personnels, relatifs, démonstratifs)",
          "Conjugaison : le conditionnel présent",
          "Orthographe : les mots invariables, la dictée",
          "Vocabulaire : les projets, les études, les métiers d'avenir",
          "Expression écrite : la lettre et le courriel",
        ],
      },
    ],
    3: [
      {
        module: "Module 5 — Protéger la planète",
        contenus: [
          "Grammaire : l'expression de la cause, de la conséquence et du but",
          "Conjugaison : le subjonctif présent (initiation)",
          "Orthographe : révision générale, dictée bilan",
          "Vocabulaire : l'écologie, les énergies",
          "Expression écrite : l'argumentation, le texte persuasif illustré",
        ],
      },
      {
        module: "Module 6 — Préparation au concours de 6ème",
        contenus: [
          "Lecture : compréhension de textes longs et questions d'analyse",
          "Grammaire / conjugaison : révisions ciblées et exercices types",
          "Expression écrite : production de textes évalués selon les critères officiels",
          "Entraînement : épreuves blanches chronométrées",
        ],
      },
    ],
  },
};
