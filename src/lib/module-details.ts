// Détails des modules du programme tunisien (5e et 6e année primaire)
export type ModuleDetail = {
  grade: number;
  no: number;
  title: string;
  domains: Record<string, string[]>;
  supports: string[];
};

export const MODULE_DETAILS: ModuleDetail[] = [
  {
    "grade": 5,
    "no": 1,
    "title": "Rendons notre environnement plus agréable",
    "domains": {
      "Communication orale": [
        "Informer et s'informer",
        "Décrire un lieu ou une action",
        "Raconter un événement",
        "Ordonner et interdire",
        "Exprimer un avis simple"
      ],
      "Structures langagières": [
        "Il faut / il ne faut pas",
        "Pour + infinitif",
        "D'abord, ensuite, puis, enfin",
        "Phrases déclarative, interrogative et exclamative"
      ],
      "Lecture": [
        "Repérer personnages, lieu, temps et actions",
        "Remettre les actions d'un récit dans l'ordre",
        "Distinguer information explicite et déduction simple",
        "Justifier une réponse par un indice"
      ],
      "Grammaire": [
        "Reconnaître et produire les types de phrases",
        "Distinguer phrase simple et phrase enrichie"
      ],
      "Conjugaison": [
        "Repérer passé, présent et futur",
        "Employer le présent et le futur dans des phrases contextualisées"
      ],
      "Orthographe": [
        "Choisir entre les finales verbales et nominales fréquentes : -er, -é, -ez, -et, -es",
        "Respecter la majuscule et la ponctuation"
      ],
      "Vocabulaire": [
        "école",
        "propreté",
        "jardin",
        "arbres",
        "embellissement",
        "déchets",
        "actions collectives"
      ],
      "Production écrite": [
        "Raconter en 4 à 6 phrases une action menée pour améliorer la classe, l'école ou le quartier."
      ],
      "Évaluation": [
        "Récit cohérent",
        "Chronologie",
        "Lexique du thème",
        "Types de phrases",
        "Lisibilité et ponctuation"
      ]
    },
    "supports": [
      "La cour transformée",
      "Le petit arbre de la rue",
      "Une équipe contre les déchets",
      "Le jardin des élèves."
    ]
  },
  {
    "grade": 5,
    "no": 2,
    "title": "Apprenons à vivre ensemble",
    "domains": {
      "Communication orale": [
        "Saluer et remercier",
        "Demander et accorder une permission",
        "Exprimer accord ou désaccord",
        "S'excuser",
        "Justifier une conduite"
      ],
      "Structures langagières": [
        "Je suis d'accord / je ne suis pas d'accord",
        "Peux-tu / pouvez-vous... ?",
        "Parce que",
        "Phrases affirmative et négative"
      ],
      "Lecture": [
        "Identifier le problème et sa solution",
        "Comprendre un dialogue",
        "Associer une réplique à son locuteur",
        "Interpréter l'intention d'un personnage"
      ],
      "Grammaire": [
        "Transformer une phrase affirmative en phrase négative",
        "Identifier groupe sujet et groupe verbal"
      ],
      "Conjugaison": [
        "Conjuguer être et avoir au présent et au futur",
        "Accorder le verbe avec un sujet simple"
      ],
      "Orthographe": [
        "Employer g, gu et ge selon le son",
        "Utiliser les signes du dialogue"
      ],
      "Vocabulaire": [
        "règles",
        "politesse",
        "partage",
        "respect",
        "coopération",
        "conflit",
        "solution"
      ],
      "Production écrite": [
        "Produire un petit récit contenant au moins deux répliques pour résoudre un conflit entre enfants."
      ],
      "Évaluation": [
        "Adéquation à la situation",
        "Dialogue compréhensible",
        "Respect des règles de vie",
        "Négation correcte",
        "Ponctuation du dialogue"
      ]
    },
    "supports": [
      "Le nouveau camarade",
      "Un ballon pour tous",
      "La règle oubliée",
      "Le conseil de classe."
    ]
  },
  {
    "grade": 5,
    "no": 3,
    "title": "Aidons et respectons les autres",
    "domains": {
      "Communication orale": [
        "Proposer de l'aide",
        "Accepter ou refuser poliment",
        "Décrire une situation",
        "Porter un jugement",
        "Exprimer un sentiment"
      ],
      "Structures langagières": [
        "Aider quelqu'un à + infinitif",
        "Demander à quelqu'un de + infinitif",
        "Il a besoin de",
        "À mon avis"
      ],
      "Lecture": [
        "Dégager le message d'un récit",
        "Caractériser un personnage par ses actes",
        "Repérer les paroles rapportées",
        "Donner un avis justifié"
      ],
      "Grammaire": [
        "Reconnaître le nom propre, le nom commun et les déterminants",
        "Remplacer un groupe nominal sujet par un pronom personnel"
      ],
      "Conjugaison": [
        "Conjuguer des verbes usuels du 1er groupe au présent et au futur",
        "Employer vouloir et pouvoir dans des formules simples"
      ],
      "Orthographe": [
        "Appliquer m devant m, b et p",
        "Accorder déterminant et nom en genre et en nombre"
      ],
      "Vocabulaire": [
        "entraide",
        "handicap",
        "personne âgée",
        "solidarité",
        "respect",
        "générosité",
        "émotions"
      ],
      "Production écrite": [
        "Raconter une situation d'entraide et insérer des paroles ou des sentiments."
      ],
      "Évaluation": [
        "Valeur de solidarité",
        "Organisation du récit",
        "Personnages identifiables",
        "Emploi des pronoms",
        "Accords dans le groupe nominal"
      ]
    },
    "supports": [
      "Le cartable trop lourd",
      "La traversée de la rue",
      "Une place dans le jeu",
      "Le geste de Lina."
    ]
  },
  {
    "grade": 5,
    "no": 4,
    "title": "Découvrons les secrets d'une bonne santé",
    "domains": {
      "Communication orale": [
        "Donner un conseil",
        "Exprimer une obligation ou une interdiction",
        "Décrire un état",
        "Expliquer une habitude",
        "Comparer des comportements"
      ],
      "Structures langagières": [
        "Il faut / il ne faut pas",
        "Tu dois / vous devez",
        "Pour être en bonne santé",
        "Si... alors..."
      ],
      "Lecture": [
        "Lire un récit et un texte informatif",
        "Distinguer conseil et information",
        "Trouver un titre",
        "Relever une cause et une conséquence"
      ],
      "Grammaire": [
        "Reconnaître les compléments essentiels d'une phrase simple",
        "Enrichir une phrase par des compléments de lieu et de temps"
      ],
      "Conjugaison": [
        "Employer faire, dire et devoir au présent",
        "Utiliser l'impératif de verbes fréquents dans des conseils"
      ],
      "Orthographe": [
        "Accorder l'adjectif qualificatif avec le nom",
        "Écrire correctement les mots usuels du thème"
      ],
      "Vocabulaire": [
        "hygiène",
        "aliments",
        "sport",
        "sommeil",
        "dentiste",
        "maladie",
        "prévention"
      ],
      "Production écrite": [
        "Écrire un récit ou une affiche-conseils présentant de bonnes habitudes de santé."
      ],
      "Évaluation": [
        "Conseils pertinents",
        "Organisation claire",
        "Lexique de la santé",
        "Impératif ou obligation",
        "Accords nom-adjectif"
      ]
    },
    "supports": [
      "Le petit déjeuner de Sami",
      "Une visite chez le dentiste",
      "Le défi sans écran",
      "Le sommeil de Nour."
    ]
  },
  {
    "grade": 5,
    "no": 5,
    "title": "Organisons notre vie entre le travail et les loisirs",
    "domains": {
      "Communication orale": [
        "Identifier et décrire un métier",
        "Parler de ses loisirs",
        "Exprimer une préférence",
        "Situer une activité dans le temps",
        "Justifier un choix"
      ],
      "Structures langagières": [
        "Quand je serai grand...",
        "Je préfère... parce que...",
        "Avant / après / pendant",
        "Aller à / faire de / jouer à"
      ],
      "Lecture": [
        "Lire un portrait et un récit",
        "Associer métier, lieu et outil",
        "Comprendre une description",
        "Comparer deux emplois du temps"
      ],
      "Grammaire": [
        "Reconnaître et employer les déterminants",
        "Identifier l'adjectif qualificatif et sa fonction descriptive"
      ],
      "Conjugaison": [
        "Conjuguer aller et faire au présent et au futur",
        "Employer des verbes pronominaux usuels dans la routine"
      ],
      "Orthographe": [
        "Former le pluriel régulier des noms et adjectifs",
        "Distinguer a et à dans des phrases simples"
      ],
      "Vocabulaire": [
        "métiers",
        "outils",
        "horaires",
        "loisirs",
        "sport",
        "culture",
        "emploi du temps"
      ],
      "Production écrite": [
        "Présenter une journée équilibrée et raconter une activité de travail ou de loisir."
      ],
      "Évaluation": [
        "Chronologie",
        "Équilibre travail-loisirs",
        "Présent/futur",
        "Déterminants",
        "Cohérence des phrases"
      ]
    },
    "supports": [
      "Le métier de mon voisin",
      "Une journée bien remplie",
      "Le club du mercredi",
      "Le rêve de Maya."
    ]
  },
  {
    "grade": 5,
    "no": 6,
    "title": "Découvrons d'autres pays",
    "domains": {
      "Communication orale": [
        "Informer et s'informer sur un pays",
        "Localiser",
        "Décrire un lieu, un monument ou une coutume",
        "Comparer",
        "Exprimer l'étonnement et l'admiration"
      ],
      "Structures langagières": [
        "Où se trouve... ?",
        "Dans ce pays...",
        "Plus... que / moins... que",
        "Partir à / en / au / aux"
      ],
      "Lecture": [
        "Lire une carte postale et un documentaire",
        "Prélever des informations dans un encadré",
        "Relier texte, carte et illustration",
        "Distinguer description et action"
      ],
      "Grammaire": [
        "Employer l'adjectif qualificatif et l'accorder",
        "Utiliser les compléments de lieu"
      ],
      "Conjugaison": [
        "Conjuguer partir, venir et prendre au présent",
        "Réinvestir futur et passé composé dans un récit de voyage"
      ],
      "Orthographe": [
        "Former le féminin et le pluriel des adjectifs fréquents",
        "Employer correctement les majuscules des noms propres"
      ],
      "Vocabulaire": [
        "pays",
        "capitales",
        "monuments",
        "voyage",
        "traditions",
        "climat",
        "habitants"
      ],
      "Production écrite": [
        "Rédiger une carte postale ou raconter une découverte en décrivant un lieu."
      ],
      "Évaluation": [
        "Destinataire et formule finale",
        "Informations géographiques",
        "Description",
        "Accords",
        "Présentation du message"
      ]
    },
    "supports": [
      "Une carte de Djerba",
      "Le musée sous la pluie",
      "Chez nos amis du Sénégal",
      "Le train vers le nord."
    ]
  },
  {
    "grade": 5,
    "no": 7,
    "title": "Réalisons des projets",
    "domains": {
      "Communication orale": [
        "Proposer un projet",
        "Donner et suivre une consigne",
        "Répartir les tâches",
        "Expliquer les étapes",
        "Évaluer le résultat"
      ],
      "Structures langagières": [
        "Nous allons...",
        "Il faut d'abord...",
        "Tu t'occupes de...",
        "Si nous... nous pourrons..."
      ],
      "Lecture": [
        "Lire une fiche technique et un récit de projet",
        "Repérer l'ordre des étapes",
        "Comprendre une consigne",
        "Identifier le matériel nécessaire"
      ],
      "Grammaire": [
        "Employer les compléments de phrase",
        "Reconnaître et produire la phrase impérative"
      ],
      "Conjugaison": [
        "Conjuguer au futur pour planifier",
        "Employer l'impératif présent de verbes usuels"
      ],
      "Orthographe": [
        "Accorder le verbe avec plusieurs sujets",
        "Utiliser deux-points et virgule dans une énumération"
      ],
      "Vocabulaire": [
        "projet",
        "matériel",
        "étapes",
        "équipe",
        "responsabilité",
        "affiche",
        "exposition"
      ],
      "Production écrite": [
        "Rédiger une fiche de projet puis raconter sa réalisation."
      ],
      "Évaluation": [
        "But explicite",
        "Étapes ordonnées",
        "Consignes correctes",
        "Répartition des rôles",
        "Bilan du projet"
      ]
    },
    "supports": [
      "Notre journal mural",
      "Une collecte solidaire",
      "Le coin lecture",
      "L'exposition scientifique."
    ]
  },
  {
    "grade": 5,
    "no": 8,
    "title": "Utilisons l'ordinateur",
    "domains": {
      "Communication orale": [
        "Nommer les éléments d'un ordinateur",
        "Expliquer une manipulation",
        "Demander de l'aide",
        "Informer sur un usage",
        "Exprimer une règle de sécurité"
      ],
      "Structures langagières": [
        "Cliquer sur / ouvrir / enregistrer",
        "Pour + infinitif",
        "Il est interdit de",
        "Attention à..."
      ],
      "Lecture": [
        "Lire un mode d'emploi et un récit numérique",
        "Associer icône et action",
        "Repérer une consigne de sécurité",
        "Évaluer la fiabilité d'une information simple"
      ],
      "Grammaire": [
        "Employer les compléments de lieu, de temps et de manière",
        "Réviser les types et formes de phrases"
      ],
      "Conjugaison": [
        "Conjuguer des verbes du 1er groupe et des verbes usuels au présent, futur et impératif",
        "Choisir le temps selon la situation"
      ],
      "Orthographe": [
        "Distinguer et/est et son/sont dans des phrases accessibles",
        "Ponctuer une suite de consignes"
      ],
      "Vocabulaire": [
        "écran",
        "clavier",
        "souris",
        "fichier",
        "dossier",
        "internet",
        "mot de passe",
        "message"
      ],
      "Production écrite": [
        "Écrire un mode d'emploi numérique ou raconter une activité réalisée avec l'ordinateur."
      ],
      "Évaluation": [
        "Étapes complètes",
        "Verbes d'action",
        "Sécurité numérique",
        "Connecteurs chronologiques",
        "Orthographe grammaticale"
      ]
    },
    "supports": [
      "Le fichier disparu",
      "Le premier courriel",
      "Un mot de passe solide",
      "L'affiche numérique."
    ]
  },
  {
    "grade": 6,
    "no": 1,
    "title": "Travailler pour s'épanouir",
    "domains": {
      "Communication orale": [
        "Informer et s'informer",
        "Décrire une profession",
        "Raconter un événement",
        "Justifier un choix",
        "Exprimer un projet"
      ],
      "Structures langagières": [
        "Être + nom de métier",
        "Je voudrais devenir...",
        "Être récompensé pour",
        "Grâce à / parce que"
      ],
      "Lecture": [
        "Lire un récit et un témoignage",
        "Identifier narrateur, personnages et chronologie",
        "Dégager les qualités d'un personnage",
        "Formuler et justifier une inférence"
      ],
      "Grammaire": [
        "Reconnaître déterminants, noms et pronoms personnels",
        "Analyser groupe nominal et groupe verbal"
      ],
      "Conjugaison": [
        "Distinguer verbe conjugué et infinitif",
        "Réviser présent, futur et passé composé des verbes usuels"
      ],
      "Orthographe": [
        "Accorder sujet et verbe",
        "Orthographier les terminaisons verbales fréquentes"
      ],
      "Vocabulaire": [
        "métiers",
        "qualités professionnelles",
        "effort",
        "formation",
        "outils",
        "réussite"
      ],
      "Production écrite": [
        "Raconter un événement lié au travail et expliquer le choix ou la réussite d'un personnage."
      ],
      "Évaluation": [
        "Récit d'au moins 7 phrases au repère trimestriel",
        "Chronologie",
        "Justification",
        "Temps verbaux",
        "Vocabulaire précis"
      ]
    },
    "supports": [
      "La jeune réparatrice",
      "Le fournil avant l'aube",
      "Le stage de Karim",
      "Un métier pour demain."
    ]
  },
  {
    "grade": 6,
    "no": 2,
    "title": "Communiquer avec les autres",
    "domains": {
      "Communication orale": [
        "Adapter son discours",
        "Demander et donner une information",
        "Exprimer accord, désaccord, refus et préférence",
        "Porter un jugement",
        "Respecter les formules de politesse"
      ],
      "Structures langagières": [
        "Tutoiement et vouvoiement",
        "Pourriez-vous... ?",
        "Je suis pour / contre",
        "À mon avis..."
      ],
      "Lecture": [
        "Comprendre dialogue, lettre et article court",
        "Identifier émetteur, destinataire et intention",
        "Distinguer fait et opinion",
        "Repérer les marques du dialogue"
      ],
      "Grammaire": [
        "Étudier types et formes de phrases",
        "Construire une phrase complexe avec coordination ou subordination simple"
      ],
      "Conjugaison": [
        "Conjuguer dire, écrire, lire et répondre aux temps étudiés",
        "Employer le conditionnel de politesse dans des expressions figées"
      ],
      "Orthographe": [
        "Distinguer a/à et ou/où",
        "Ponctuer le dialogue et la phrase interrogative"
      ],
      "Vocabulaire": [
        "conversation",
        "téléphone",
        "courriel",
        "journal",
        "internet",
        "information",
        "politesse"
      ],
      "Production écrite": [
        "Produire la fin d'un récit comportant un échange adapté à la situation de communication."
      ],
      "Évaluation": [
        "Destinataire identifié",
        "Registre adapté",
        "Répliques cohérentes",
        "Opinion justifiée",
        "Ponctuation"
      ]
    },
    "supports": [
      "Le message mal compris",
      "Une interview à l'école",
      "Le téléphone retrouvé",
      "Le journal de la classe."
    ]
  },
  {
    "grade": 6,
    "no": 3,
    "title": "Accepter les autres",
    "domains": {
      "Communication orale": [
        "Décrire une scène",
        "Porter un jugement",
        "Prendre position",
        "Justifier un point de vue",
        "Proposer une inclusion"
      ],
      "Structures langagières": [
        "Participer à",
        "Demander à quelqu'un de + infinitif",
        "Intervenir pour + infinitif",
        "Même si / pourtant"
      ],
      "Lecture": [
        "Comprendre motivations et évolution d'un personnage",
        "Identifier préjugé et solution",
        "Relever un argument",
        "Dépasser le texte par une prise de position"
      ],
      "Grammaire": [
        "Employer pronoms personnels sujets et compléments",
        "Construire et reconnaître la phrase interrogative"
      ],
      "Conjugaison": [
        "Conjuguer être et avoir aux temps étudiés",
        "Employer pouvoir, vouloir et devoir pour proposer ou obliger"
      ],
      "Orthographe": [
        "Distinguer on/ont et son/sont",
        "Assurer les accords dans le groupe nominal"
      ],
      "Vocabulaire": [
        "différence",
        "tolérance",
        "handicap",
        "discrimination",
        "inclusion",
        "dignité",
        "amitié"
      ],
      "Production écrite": [
        "Raconter une situation d'exclusion puis sa résolution en insérant au moins deux répliques."
      ],
      "Évaluation": [
        "Respect de la personne",
        "Transformation de la situation",
        "Arguments",
        "Dialogue",
        "Pronoms et accords"
      ]
    },
    "supports": [
      "Le match ouvert à tous",
      "La nouvelle élève",
      "Un fauteuil dans la cour",
      "La photo de groupe."
    ]
  },
  {
    "grade": 6,
    "no": 4,
    "title": "S'entraider pour mieux réussir",
    "domains": {
      "Communication orale": [
        "Décrire",
        "Raconter",
        "Informer et s'informer",
        "Exprimer un point de vue",
        "Expliquer la contribution de chacun"
      ],
      "Structures langagières": [
        "Venir en aide à",
        "S'unir pour + infinitif",
        "Parce que / car",
        "Chacun... tandis que..."
      ],
      "Lecture": [
        "Lire un récit de coopération",
        "Repérer problème, tentatives et solution",
        "Comparer les rôles",
        "Résumer un épisode"
      ],
      "Grammaire": [
        "Construire la phrase complexe avec parce que et car",
        "Identifier compléments d'objet et compléments de phrase"
      ],
      "Conjugaison": [
        "Conjuguer venir, offrir et réussir au présent et au futur",
        "Réinvestir le passé composé dans le récit"
      ],
      "Orthographe": [
        "Accorder le participe passé employé avec être dans les cas simples",
        "Distinguer ce/se"
      ],
      "Vocabulaire": [
        "solidarité",
        "équipe",
        "coopération",
        "service",
        "répartition",
        "réussite",
        "paix"
      ],
      "Production écrite": [
        "Raconter un projet collectif et faire parler les personnages pour montrer l'entraide."
      ],
      "Évaluation": [
        "Problème et solution",
        "Rôles complémentaires",
        "Cause exprimée",
        "Dialogue",
        "Cohésion du texte"
      ]
    },
    "supports": [
      "Le défi de la maquette",
      "Le voisin malade",
      "Une équipe pour la bibliothèque",
      "La course solidaire."
    ]
  },
  {
    "grade": 6,
    "no": 5,
    "title": "Sauver la nature",
    "domains": {
      "Communication orale": [
        "Informer",
        "Alerter",
        "Exprimer un avis",
        "Proposer une solution",
        "Comparer",
        "Convaincre"
      ],
      "Structures langagières": [
        "Il est possible de",
        "Il faut / il faudrait",
        "Avoir le droit de",
        "Être pour / contre",
        "Comme / plus que"
      ],
      "Lecture": [
        "Lire récit, affiche et texte documentaire",
        "Distinguer cause et conséquence",
        "Prélever des données",
        "Évaluer une solution"
      ],
      "Grammaire": [
        "Employer la phrase impersonnelle",
        "Utiliser comparatif et expansions du nom"
      ],
      "Conjugaison": [
        "Conjuguer des verbes en -ir et des verbes usuels dans une proposition",
        "Employer futur et conditionnel de suggestion dans des formes accessibles"
      ],
      "Orthographe": [
        "Accorder adjectifs et participes employés comme adjectifs",
        "Distinguer ces/ses"
      ],
      "Vocabulaire": [
        "pollution",
        "biodiversité",
        "eau",
        "forêt",
        "énergie",
        "recyclage",
        "protection"
      ],
      "Production écrite": [
        "Raconter un événement écologique et intégrer une description ainsi qu'une proposition de solution."
      ],
      "Évaluation": [
        "Problème environnemental",
        "Causes/conséquences",
        "Description",
        "Solution argumentée",
        "Correction linguistique"
      ]
    },
    "supports": [
      "La plage après la tempête",
      "Le dernier nid",
      "La classe zéro déchet",
      "La source menacée."
    ]
  },
  {
    "grade": 6,
    "no": 6,
    "title": "Être en forme et mieux se porter",
    "domains": {
      "Communication orale": [
        "Donner un conseil",
        "Informer et s'informer",
        "Raconter",
        "Décrire une personne",
        "Exprimer une préférence"
      ],
      "Structures langagières": [
        "Pour + infinitif",
        "Il faut",
        "L'impératif",
        "Ne... jamais",
        "Je préfère... à..."
      ],
      "Lecture": [
        "Lire récit, ordonnance simplifiée et article de prévention",
        "Identifier symptômes et conseils",
        "Relier comportement et conséquence",
        "Comparer deux modes de vie"
      ],
      "Grammaire": [
        "Employer la négation complexe",
        "Enrichir le nom par un adjectif ou un complément"
      ],
      "Conjugaison": [
        "Employer l'impératif",
        "Conjuguer devoir, pouvoir, prendre et se sentir aux temps utiles"
      ],
      "Orthographe": [
        "Accorder les adjectifs de couleur et qualificatifs dans les cas scolaires",
        "Distinguer leur/leurs"
      ],
      "Vocabulaire": [
        "alimentation",
        "activité physique",
        "repos",
        "soins",
        "prévention",
        "stress",
        "bien-être"
      ],
      "Production écrite": [
        "Raconter un événement de santé en intégrant une description et des conseils dialogués."
      ],
      "Évaluation": [
        "Récit d'au moins 8 phrases au repère trimestriel",
        "Description",
        "Conseils",
        "Négation",
        "Accords"
      ]
    },
    "supports": [
      "Le tournoi interrompu",
      "Une semaine mieux organisée",
      "Chez l'infirmière",
      "Le repas de l'équipe."
    ]
  },
  {
    "grade": 6,
    "no": 7,
    "title": "Profiter de son temps libre",
    "domains": {
      "Communication orale": [
        "Décrire et raconter",
        "Exprimer sentiment, préférence ou refus",
        "Émettre une hypothèse",
        "Inviter",
        "Répondre à une invitation"
      ],
      "Structures langagières": [
        "Partir en / à / pour",
        "Ni... ni",
        "Dès que / pendant que",
        "En + participe présent",
        "Être passionné par"
      ],
      "Lecture": [
        "Lire une lettre, un récit et un programme",
        "Identifier les parties d'une lettre",
        "Inférer un sentiment",
        "Comparer des loisirs"
      ],
      "Grammaire": [
        "Employer les compléments de temps",
        "Utiliser les adjectifs possessifs",
        "Construire une phrase avec ni... ni"
      ],
      "Conjugaison": [
        "Conjuguer des verbes pronominaux et partir aux temps étudiés",
        "Employer le gérondif dans des cas simples"
      ],
      "Orthographe": [
        "Accorder l'adjectif avec le nom",
        "Distinguer mes/mais et peu/peut dans des phrases contextualisées"
      ],
      "Vocabulaire": [
        "lecture",
        "musique",
        "sport",
        "collection",
        "sortie",
        "vacances",
        "correspondance"
      ],
      "Production écrite": [
        "Écrire une lettre à un ami ou à un parent pour raconter ses loisirs et exprimer ses préférences."
      ],
      "Évaluation": [
        "Codes de la lettre",
        "Récit personnel",
        "Sentiments",
        "Compléments de temps",
        "Formules d'adresse et de clôture"
      ]
    },
    "supports": [
      "La lettre du club",
      "Un dimanche au musée",
      "La collection inattendue",
      "L'invitation au tournoi."
    ]
  },
  {
    "grade": 6,
    "no": 8,
    "title": "Découvrir d'autres modes de vie",
    "domains": {
      "Communication orale": [
        "S'informer et informer",
        "Décrire un mode de vie",
        "Exprimer avis et préférence",
        "Comparer",
        "Raconter une découverte"
      ],
      "Structures langagières": [
        "Partir à / de / en",
        "Être invité à",
        "Le comparatif et le superlatif",
        "Les substituts du groupe nominal"
      ],
      "Lecture": [
        "Lire récit de voyage, documentaire et mode d'emploi culturel",
        "Relever similitudes et différences",
        "Identifier substituts nominaux et pronominaux",
        "Synthétiser plusieurs informations"
      ],
      "Grammaire": [
        "Employer les compléments de manière",
        "Utiliser les substituts du groupe nominal : pronoms le, la, les et pronoms sujets"
      ],
      "Conjugaison": [
        "Conjuguer pouvoir et vouloir aux temps étudiés",
        "Réinvestir les temps du récit et le futur"
      ],
      "Orthographe": [
        "Accorder le participe passé dans les cas étudiés",
        "Réviser les homophones grammaticaux du niveau"
      ],
      "Vocabulaire": [
        "habitat",
        "vêtements",
        "repas",
        "fêtes",
        "école",
        "climat",
        "traditions",
        "voyage"
      ],
      "Production écrite": [
        "Raconter une découverte culturelle et intégrer un passage descriptif et comparatif."
      ],
      "Évaluation": [
        "Production d'au moins 10 phrases au repère terminal",
        "Description",
        "Comparaison respectueuse",
        "Substituts",
        "Cohérence et correction"
      ]
    },
    "supports": [
      "Une journée dans une école lointaine",
      "La fête des lanternes",
      "Chez la famille d'accueil",
      "Le grand voyage de Yasmine."
    ]
  }
];

export function findModuleDetail(grade: number, no: number) {
  return MODULE_DETAILS.find((m) => m.grade === grade && m.no === no);
}
