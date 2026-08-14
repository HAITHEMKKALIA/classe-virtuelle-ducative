import grammaireImg from "@/assets/cours/grammaire.jpg";
import conjugaisonImg from "@/assets/cours/conjugaison.jpg";
import orthographeImg from "@/assets/cours/orthographe.jpg";
import vocabulaireImg from "@/assets/cours/vocabulaire.jpg";
import lectureImg from "@/assets/cours/lecture.jpg";
import ecriteImg from "@/assets/cours/expression_ecrite.jpg";
import oraleImg from "@/assets/cours/expression_orale.jpg";
import poesieImg from "@/assets/cours/poesie.jpg";

/** Illustration officielle associée à chaque matière du programme. */
export const IMAGE_MATIERE: Record<string, string> = {
  grammaire: grammaireImg,
  conjugaison: conjugaisonImg,
  orthographe: orthographeImg,
  vocabulaire: vocabulaireImg,
  lecture: lectureImg,
  expression_ecrite: ecriteImg,
  expression_orale: oraleImg,
  poesie: poesieImg,
};

export type Lecon = {
  niveau: 5 | 6;
  trimestre: 1 | 2 | 3;
  module: string;
  matiere: keyof typeof IMAGE_MATIERE;
  titre: string;
  resume: string;
  objectifs: string[];
  regle: string[];
  exemples: string[];
  astuce: string;
  exercices: string[];
  corriges: string[];
};

/** Construit le contenu Markdown complet d'une leçon. */
export function contenuLecon(l: Lecon): string {
  const img = IMAGE_MATIERE[l.matiere];
  return [
    `![Illustration ${l.matiere}](${img})`,
    "",
    `## Objectifs d'apprentissage`,
    ...l.objectifs.map((o) => `- ${o}`),
    "",
    `## La leçon`,
    ...l.regle.map((r) => `${r}`),
    "",
    `## Exemples`,
    ...l.exemples.map((e) => `- ${e}`),
    "",
    `## À retenir`,
    `> ${l.astuce}`,
    "",
    `## Exercices d'application`,
    ...l.exercices.map((e, i) => `${i + 1}. ${e}`),
    "",
    `## Corrigé`,
    ...l.corriges.map((c, i) => `${i + 1}. ${c}`),
    "",
    `## Trace écrite`,
    `Recopie la règle sur ton cahier, puis illustre-la avec deux exemples personnels tirés de ta vie quotidienne (${l.module}).`,
  ].join("\n");
}

const L = (l: Lecon) => l;

export const CATALOGUE: Lecon[] = [
  /* ================= 5ème année — Trimestre 1 ================= */
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 1 — La vie scolaire",
    matiere: "grammaire",
    titre: "La phrase : types et formes",
    resume: "Reconnaître et construire les quatre types de phrases et leurs formes.",
    objectifs: [
      "Identifier une phrase correcte (majuscule, sens, ponctuation finale).",
      "Distinguer les phrases déclarative, interrogative, impérative, exclamative.",
      "Passer de la forme affirmative à la forme négative.",
    ],
    regle: [
      "Une **phrase** commence par une majuscule et se termine par un point (. ? ! …). Elle a un sens complet.",
      "On distingue **quatre types** : déclaratif (on raconte), interrogatif (on questionne), impératif (on ordonne), exclamatif (on exprime un sentiment).",
      "Chaque phrase peut être à la **forme affirmative** ou à la **forme négative** (ne … pas, ne … jamais, ne … plus, ne … rien).",
    ],
    exemples: [
      "Déclaratif : *L'élève range son cartable.*",
      "Interrogatif : *As-tu fait tes devoirs ?*",
      "Impératif : *Ouvre ton livre.*",
      "Exclamatif : *Quelle belle classe !*",
      "Négatif : *Je **ne** copie **jamais** sur mon voisin.*",
    ],
    astuce:
      "La ponctuation finale est un indice : « ? » interrogatif, « ! » exclamatif, « . » déclaratif ou impératif.",
    exercices: [
      "Indique le type : « Range tes affaires. »",
      "Transforme à la forme négative : « Je parle en classe. »",
      "Transforme en phrase interrogative : « Tu apportes ton cahier. »",
      "Écris une phrase exclamative sur ta salle de classe.",
    ],
    corriges: [
      "Phrase impérative.",
      "Je **ne** parle **pas** en classe.",
      "Apportes-tu ton cahier ? / Est-ce que tu apportes ton cahier ?",
      "Exemple : Comme notre classe est bien décorée !",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 1 — La vie scolaire",
    matiere: "conjugaison",
    titre: "Le présent de l'indicatif (1er et 2ème groupes)",
    resume: "Conjuguer les verbes en -er et en -ir au présent.",
    objectifs: [
      "Reconnaître l'infinitif et le groupe d'un verbe.",
      "Mémoriser les terminaisons du présent des 1er et 2ème groupes.",
      "Accorder le verbe avec son sujet.",
    ],
    regle: [
      "**1er groupe** (verbes en **-er**) : -e, -es, -e, -ons, -ez, -ent.",
      "**2ème groupe** (verbes en **-ir** qui font *-issons*) : -is, -is, -it, -issons, -issez, -issent.",
      "Le présent exprime ce qui se passe **au moment où l'on parle**, une habitude ou une vérité générale.",
    ],
    exemples: [
      "chanter : je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent.",
      "finir : je finis, tu finis, il finit, nous finissons, vous finissez, ils finissent.",
      "Habitude : *Chaque matin, nous commençons par la lecture.*",
    ],
    astuce:
      "Attention aux verbes en -ger (nous mangeons) et en -cer (nous avançons) : on garde le son doux.",
    exercices: [
      "Conjugue « travailler » à toutes les personnes du présent.",
      "Complète : Nous (choisir) … nos livres.",
      "Complète : Vous (ranger) … la classe.",
      "Écris une phrase au présent avec le verbe « réussir ».",
    ],
    corriges: [
      "je travaille, tu travailles, il/elle travaille, nous travaillons, vous travaillez, ils/elles travaillent.",
      "choisissons",
      "rangez",
      "Exemple : Je réussis mes exercices de grammaire.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 1 — La vie scolaire",
    matiere: "orthographe",
    titre: "Le pluriel des noms et l'accord sujet/verbe",
    resume: "Former le pluriel des noms et accorder correctement le verbe.",
    objectifs: [
      "Former le pluriel régulier en -s et les pluriels particuliers.",
      "Repérer le sujet pour accorder le verbe.",
    ],
    regle: [
      "En général, le pluriel se forme en ajoutant **-s** : un cahier → des cahiers.",
      "Noms en **-au, -eau, -eu** → **-x** : un tableau → des tableaux.",
      "Noms en **-al** → **-aux** : un journal → des journaux (sauf bal, carnaval, festival).",
      "Le **verbe s'accorde toujours avec son sujet** : *Les élèves écoutent.*",
    ],
    exemples: [
      "un bureau → des bureaux",
      "un animal → des animaux",
      "*Le maître et les élèves **travaillent** ensemble.* (sujet pluriel)",
    ],
    astuce: "Pose la question « Qui est-ce qui … ? » pour trouver le sujet du verbe.",
    exercices: [
      "Mets au pluriel : un chapeau, un cheval, un jeu.",
      "Accorde : Les enfants (jouer) … dans la cour.",
      "Accorde : Mon cartable et ma trousse (être) … neufs.",
    ],
    corriges: [
      "des chapeaux, des chevaux, des jeux.",
      "jouent",
      "sont",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 1 — La vie scolaire",
    matiere: "vocabulaire",
    titre: "Le champ lexical de l'école",
    resume: "Enrichir son vocabulaire autour de la classe et des fournitures.",
    objectifs: [
      "Classer les mots par familles (lieux, personnes, objets, actions).",
      "Utiliser le dictionnaire pour vérifier un sens.",
    ],
    regle: [
      "Un **champ lexical** regroupe tous les mots qui parlent d'un même thème.",
      "Champ lexical de l'école : *lieux* (classe, cour, bibliothèque), *personnes* (élève, maître, directeur), *objets* (cartable, règle, ardoise), *actions* (apprendre, réviser, réciter).",
    ],
    exemples: [
      "Lieux : la salle, le préau, le laboratoire.",
      "Objets : le compas, l'équerre, le taille-crayon.",
      "Actions : copier, souligner, corriger, réciter.",
    ],
    astuce: "Note chaque mot nouveau dans un répertoire avec un exemple de phrase.",
    exercices: [
      "Trouve 5 mots du champ lexical de la lecture.",
      "Classe : gomme, directeur, réciter, bibliothèque.",
      "Emploie « réviser » dans une phrase.",
    ],
    corriges: [
      "Exemple : livre, page, roman, lecteur, bibliothèque.",
      "objet : gomme ; personne : directeur ; action : réciter ; lieu : bibliothèque.",
      "Exemple : Je révise ma leçon avant l'évaluation.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 1 — La vie scolaire",
    matiere: "lecture",
    titre: "Lire et comprendre un texte narratif",
    resume: "Repérer les personnages, le lieu, le temps et les actions d'un récit.",
    objectifs: [
      "Identifier les informations essentielles d'un texte.",
      "Répondre à des questions de compréhension par une phrase complète.",
    ],
    regle: [
      "Pour comprendre un récit, cherche : **Qui ? Où ? Quand ? Quoi ? Pourquoi ?**",
      "Le récit suit un ordre : **situation initiale → événement → péripéties → fin**.",
      "Les mots de liaison (d'abord, ensuite, enfin) aident à suivre l'histoire.",
    ],
    exemples: [
      "*Ce matin-là, Sami arriva en retard à l'école. Le portail était déjà fermé…*",
      "Qui ? Sami — Quand ? ce matin-là — Où ? à l'école — Quoi ? il arrive en retard.",
    ],
    astuce: "Souligne au crayon les mots qui indiquent le lieu et le temps.",
    exercices: [
      "Lis le texte de ton manuel et relève les personnages.",
      "Indique le lieu et le moment de l'histoire.",
      "Résume l'histoire en trois phrases.",
    ],
    corriges: [
      "Réponse attendue : liste des personnages cités dans le texte.",
      "Réponse en phrase complète : L'histoire se passe … , le/la … .",
      "Résumé : situation de départ, événement, fin.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 1 — La vie scolaire",
    matiere: "expression_ecrite",
    titre: "Écrire un court récit (3 à 5 phrases)",
    resume: "Produire un petit texte narratif cohérent et bien ponctué.",
    objectifs: [
      "Respecter la structure d'un récit court.",
      "Utiliser les connecteurs et la ponctuation.",
    ],
    regle: [
      "Un récit court comporte : **une phrase de début**, **deux ou trois phrases d'action**, **une phrase de fin**.",
      "Utilise les connecteurs : *d'abord, puis, ensuite, enfin*.",
      "Relis toujours : majuscules, points, accords.",
    ],
    exemples: [
      "*D'abord, je suis entré dans la classe. Puis j'ai salué le maître. Enfin, je me suis assis à ma place.*",
    ],
    astuce: "Une idée = une phrase. Évite les phrases trop longues.",
    exercices: [
      "Raconte ta première journée d'école en 5 phrases.",
      "Ajoute un connecteur au début de chaque phrase.",
      "Souligne les verbes de ton texte et vérifie leur accord.",
    ],
    corriges: [
      "Production personnelle respectant les 5 phrases.",
      "Connecteurs attendus : d'abord, puis, ensuite, enfin.",
      "Auto-correction : chaque verbe accordé avec son sujet.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 2 — La famille et le quartier",
    matiere: "expression_orale",
    titre: "Se présenter et présenter sa famille",
    resume: "Prendre la parole clairement pour se présenter devant la classe.",
    objectifs: [
      "Utiliser des formules de présentation.",
      "Parler avec une voix audible et un débit régulier.",
    ],
    regle: [
      "Pour se présenter : *Je m'appelle …, j'ai … ans, j'habite à …, ma famille compte …*",
      "Regarde ton auditoire, articule, respire entre les phrases.",
    ],
    exemples: [
      "*Bonjour, je m'appelle Ahmed. J'ai 10 ans. J'habite à Sfax avec mes parents et ma sœur.*",
    ],
    astuce: "Prépare 4 phrases à l'avance, puis parle sans lire.",
    exercices: [
      "Présente-toi en 5 phrases devant un camarade.",
      "Présente un membre de ta famille et son métier.",
    ],
    corriges: [
      "Grille : phrases complètes, voix audible, regard.",
      "Utilisation du présent et du vocabulaire de la famille.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 1,
    module: "Module 2 — La famille et le quartier",
    matiere: "poesie",
    titre: "Réciter un poème sur la famille",
    resume: "Mémoriser et dire un poème avec le ton juste.",
    objectifs: ["Repérer les vers et les rimes.", "Réciter avec expression."],
    regle: [
      "Un poème est écrit en **vers** regroupés en **strophes**.",
      "Les **rimes** sont les sons qui se répètent à la fin des vers.",
      "Réciter, c'est respecter les pauses, le rythme et l'intonation.",
    ],
    exemples: [
      "Vers rimés : *maison / saison*, *cœur / douceur*.",
      "Une strophe de 4 vers s'appelle un quatrain.",
    ],
    astuce: "Apprends le poème strophe par strophe, en le disant à voix haute.",
    exercices: [
      "Relève deux rimes dans le poème étudié.",
      "Indique le nombre de strophes et de vers.",
      "Récite la première strophe avec le ton.",
    ],
    corriges: [
      "Réponse selon le poème du manuel.",
      "Comptage exact des strophes/vers.",
      "Récitation évaluée : mémorisation, ton, pauses.",
    ],
  }),

  /* ================= 5ème année — Trimestre 2 ================= */
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 3 — La santé et l'hygiène",
    matiere: "grammaire",
    titre: "Les compléments d'objet (COD et COI)",
    resume: "Identifier le COD et le COI dans une phrase.",
    objectifs: [
      "Poser les bonnes questions pour trouver le complément.",
      "Distinguer complément direct et indirect.",
    ],
    regle: [
      "Le **COD** répond à **qui ? / quoi ?** posé après le verbe, sans préposition.",
      "Le **COI** répond à **à qui ? à quoi ? de qui ? de quoi ?** : il est introduit par une préposition.",
      "Ces compléments font partie du **groupe verbal** et ne se déplacent pas.",
    ],
    exemples: [
      "*Je bois **un grand verre d'eau**.* → COD (je bois quoi ?)",
      "*Je parle **au médecin**.* → COI (je parle à qui ?)",
      "*Elle offre **des fruits** **à son frère**.* → COD + COI",
    ],
    astuce: "Pas de préposition = COD. Avec « à » ou « de » = COI.",
    exercices: [
      "Relève le COD : « Nous mangeons des légumes. »",
      "Relève le COI : « Il obéit à sa maman. »",
      "Écris une phrase avec un COD et un COI.",
    ],
    corriges: ["des légumes", "à sa maman", "Exemple : Je donne une pomme à mon ami."],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 3 — La santé et l'hygiène",
    matiere: "conjugaison",
    titre: "Le passé composé avec avoir et être",
    resume: "Former le passé composé et accorder le participe passé avec être.",
    objectifs: [
      "Choisir le bon auxiliaire.",
      "Former le participe passé des verbes courants.",
      "Accorder le participe passé employé avec être.",
    ],
    regle: [
      "Passé composé = **auxiliaire (avoir ou être) au présent + participe passé**.",
      "Avec **être**, le participe passé **s'accorde avec le sujet** : *Elles sont parties.*",
      "Avec **avoir**, pas d'accord avec le sujet : *Elles ont mangé.*",
    ],
    exemples: [
      "j'ai lavé, tu as bu, il a fini",
      "je suis allé(e), nous sommes venu(e)s, elles sont tombées",
    ],
    astuce:
      "Verbes avec être : aller, venir, partir, arriver, entrer, sortir, monter, descendre, rester, tomber, naître, mourir + verbes pronominaux.",
    exercices: [
      "Conjugue « manger » au passé composé (3 personnes).",
      "Complète : Elle (aller) … chez le dentiste.",
      "Complète : Nous (finir) … nos devoirs.",
    ],
    corriges: ["j'ai mangé, tu as mangé, il a mangé…", "est allée", "avons fini"],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 3 — La santé et l'hygiène",
    matiere: "orthographe",
    titre: "Accord du participe passé employé avec être",
    resume: "Accorder le participe passé en genre et en nombre avec le sujet.",
    objectifs: ["Repérer l'auxiliaire être.", "Écrire les bonnes terminaisons."],
    regle: [
      "Avec l'auxiliaire **être**, le participe passé s'accorde avec le **sujet** : + e (féminin), + s (pluriel), + es (féminin pluriel).",
    ],
    exemples: [
      "Il est parti. / Elle est partie. / Ils sont partis. / Elles sont parties.",
    ],
    astuce: "Cherche le sujet, puis demande : masculin ou féminin ? singulier ou pluriel ?",
    exercices: [
      "Accorde : Les filles sont (arriver) … .",
      "Accorde : Mon frère est (rester) … à la maison.",
      "Accorde : Nous (les élèves) sommes (entrer) … en classe.",
    ],
    corriges: ["arrivées", "resté", "entrés"],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 3 — La santé et l'hygiène",
    matiere: "vocabulaire",
    titre: "Le corps, la santé et l'alimentation",
    resume: "Employer le vocabulaire de l'hygiène et des aliments.",
    objectifs: ["Nommer les parties du corps.", "Classer les aliments par familles."],
    regle: [
      "Champ lexical du corps : tête, bras, jambe, dents, peau…",
      "Santé : microbe, maladie, remède, ordonnance, vaccin, hygiène.",
      "Aliments : fruits, légumes, céréales, produits laitiers, protéines.",
    ],
    exemples: [
      "*Je me brosse les dents après chaque repas.*",
      "*Les légumes sont riches en vitamines.*",
    ],
    astuce: "Associe chaque mot à un geste quotidien pour le mémoriser.",
    exercices: [
      "Cite 5 règles d'hygiène.",
      "Classe : pomme, lait, pain, poisson.",
      "Emploie « vitamine » dans une phrase.",
    ],
    corriges: [
      "Exemple : se laver les mains, se brosser les dents, se doucher, dormir tôt, aérer sa chambre.",
      "fruit : pomme ; produit laitier : lait ; céréale : pain ; protéine : poisson.",
      "Exemple : Les oranges contiennent beaucoup de vitamine C.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 4 — Les métiers",
    matiere: "grammaire",
    titre: "Les compléments circonstanciels",
    resume: "Repérer les compléments de temps, de lieu et de manière.",
    objectifs: ["Identifier les CC.", "Déplacer ou supprimer un CC."],
    regle: [
      "Le **complément circonstanciel** donne une précision : **quand ? (temps)**, **où ? (lieu)**, **comment ? (manière)**.",
      "Il peut être **déplacé** ou **supprimé** sans rendre la phrase incorrecte.",
    ],
    exemples: [
      "*Le boulanger travaille **la nuit**.* → CC de temps",
      "*Il pétrit la pâte **dans le fournil**.* → CC de lieu",
      "*Il travaille **avec soin**.* → CC de manière",
    ],
    astuce: "Si tu peux le déplacer en début de phrase, c'est un CC.",
    exercices: [
      "Relève le CC : « Chaque matin, l'infirmière soigne les malades. »",
      "Ajoute un CC de lieu à : « Le menuisier scie une planche. »",
      "Indique la nature du CC : « Il répond poliment. »",
    ],
    corriges: [
      "Chaque matin (CC de temps).",
      "Exemple : dans son atelier.",
      "CC de manière.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 4 — Les métiers",
    matiere: "conjugaison",
    titre: "L'imparfait de l'indicatif",
    resume: "Conjuguer à l'imparfait et employer ce temps dans le récit.",
    objectifs: ["Former l'imparfait à partir de « nous » au présent.", "Décrire au passé."],
    regle: [
      "Radical = **1ère personne du pluriel au présent** sans -ons. Terminaisons : **-ais, -ais, -ait, -ions, -iez, -aient** (pour tous les verbes).",
      "L'imparfait sert à **décrire** et à raconter une **habitude passée**.",
    ],
    exemples: [
      "nous finissons → je finissais",
      "*Autrefois, le forgeron travaillait le fer à la main.*",
    ],
    astuce: "être fait exception au radical : j'étais, tu étais, il était…",
    exercices: [
      "Conjugue « travailler » à l'imparfait.",
      "Complète : Quand j'étais petit, je (jouer) … dans la rue.",
      "Transforme au passé : « Le facteur distribue le courrier. »",
    ],
    corriges: [
      "je travaillais, tu travaillais, il travaillait, nous travaillions, vous travailliez, ils travaillaient.",
      "jouais",
      "Le facteur distribuait le courrier.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 4 — Les métiers",
    matiere: "orthographe",
    titre: "Les homophones : ce/se, on/ont, son/sont",
    resume: "Choisir le bon homophone grammatical.",
    objectifs: ["Distinguer les homophones par un test de remplacement."],
    regle: [
      "**on** (pronom, remplaçable par *il*) / **ont** (verbe avoir, remplaçable par *avaient*).",
      "**son** (déterminant, remplaçable par *mon*) / **sont** (verbe être, remplaçable par *étaient*).",
      "**ce** (déterminant ou pronom : *ce livre*, *c'est*) / **se** (pronom devant un verbe : *il se lave*).",
    ],
    exemples: [
      "*Les ouvriers **ont** fini ; **on** les félicite.*",
      "*Le maçon range **son** outil ; les outils **sont** rangés.*",
      "*Le pêcheur **se** lève tôt ; **ce** métier est difficile.*",
    ],
    astuce: "Remplace mentalement : si « avaient » convient → ont ; si « étaient » convient → sont.",
    exercices: [
      "Complète : Les élèves … partis. (son/sont)",
      "Complète : … a visité une usine. (on/ont)",
      "Complète : … matin, il … lève à six heures. (ce/se)",
    ],
    corriges: ["sont", "On", "Ce matin, il se lève."],
  }),
  L({
    niveau: 5,
    trimestre: 2,
    module: "Module 4 — Les métiers",
    matiere: "expression_ecrite",
    titre: "Rédiger un texte injonctif (consignes, recette)",
    resume: "Écrire des consignes claires à l'impératif.",
    objectifs: ["Utiliser l'impératif ou l'infinitif.", "Organiser les étapes."],
    regle: [
      "Le texte injonctif donne des **ordres, conseils ou étapes** : recette, notice, règlement.",
      "Verbes à l'**impératif** (*Lave, mélange, verse*) ou à l'**infinitif** (*Laver, mélanger*).",
      "On organise avec des **numéros** ou des **connecteurs** (d'abord, ensuite, enfin).",
    ],
    exemples: [
      "1. Laver les légumes. 2. Les couper. 3. Les faire cuire 10 minutes.",
    ],
    astuce: "Une consigne = un verbe d'action au début de la phrase.",
    exercices: [
      "Écris une recette simple en 5 étapes.",
      "Rédige 4 conseils pour rester en bonne santé.",
      "Transforme à l'impératif : « Tu ranges ton matériel. »",
    ],
    corriges: [
      "Production personnelle : étapes numérotées, verbes d'action.",
      "Exemple : Bois de l'eau. Dors huit heures. Mange des fruits. Fais du sport.",
      "Range ton matériel.",
    ],
  }),

  /* ================= 5ème année — Trimestre 3 ================= */
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 5 — L'environnement",
    matiere: "grammaire",
    titre: "L'adjectif qualificatif et les degrés de comparaison",
    resume: "Accorder l'adjectif et exprimer la comparaison.",
    objectifs: ["Accorder l'adjectif avec le nom.", "Former le comparatif et le superlatif."],
    regle: [
      "L'**adjectif qualificatif** s'accorde en **genre** et en **nombre** avec le nom qu'il qualifie.",
      "Comparatif : **plus … que**, **moins … que**, **aussi … que**.",
      "Superlatif : **le plus …**, **le moins …**.",
    ],
    exemples: [
      "*une forêt **verte** / des forêts **vertes***",
      "*L'air de la campagne est **plus pur que** celui de la ville.*",
      "*C'est **le plus beau** jardin du quartier.*",
    ],
    astuce: "bon → meilleur (et non « plus bon ») ; bien → mieux.",
    exercices: [
      "Accorde : des plages (propre) … .",
      "Complète : Le tri des déchets est … utile … le gaspillage. (comparatif)",
      "Écris une phrase au superlatif sur la nature.",
    ],
    corriges: [
      "propres",
      "plus utile que",
      "Exemple : C'est le plus grand parc de la ville.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 5 — L'environnement",
    matiere: "conjugaison",
    titre: "Le futur simple",
    resume: "Conjuguer au futur et parler de projets.",
    objectifs: ["Former le futur à partir de l'infinitif.", "Employer le futur dans un projet."],
    regle: [
      "Futur simple = **infinitif + -ai, -as, -a, -ons, -ez, -ont**.",
      "Verbes irréguliers : être → je serai, avoir → j'aurai, aller → j'irai, faire → je ferai, venir → je viendrai.",
    ],
    exemples: [
      "planter : je planterai, nous planterons",
      "*Demain, nous nettoierons la cour de l'école.*",
    ],
    astuce: "Le futur garde toujours le **r** de l'infinitif : je chante**r**ai.",
    exercices: [
      "Conjugue « protéger » au futur.",
      "Complète : L'an prochain, nous (planter) … des arbres.",
      "Écris deux phrases sur ce que tu feras pour l'environnement.",
    ],
    corriges: [
      "je protégerai, tu protégeras, il protégera, nous protégerons, vous protégerez, ils protégeront.",
      "planterons",
      "Production personnelle au futur simple.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 5 — L'environnement",
    matiere: "vocabulaire",
    titre: "La nature, la pollution et la protection",
    resume: "Employer un vocabulaire précis sur l'écologie.",
    objectifs: ["Constituer un champ lexical.", "Utiliser des mots de la même famille."],
    regle: [
      "Champ lexical de l'environnement : nature, forêt, rivière, faune, flore.",
      "Pollution : déchets, fumée, plastique, gaspillage.",
      "Protection : trier, recycler, économiser, préserver, reboiser.",
      "Mots de la même famille : *polluer / pollution / polluant*.",
    ],
    exemples: [
      "*Il faut recycler le plastique pour préserver la mer.*",
    ],
    astuce: "Une famille de mots partage le même radical.",
    exercices: [
      "Trouve 3 mots de la famille de « planter ».",
      "Classe : recycler, fumée, forêt.",
      "Emploie « gaspillage » dans une phrase.",
    ],
    corriges: [
      "plantation, plante, planteur.",
      "protection : recycler ; pollution : fumée ; nature : forêt.",
      "Exemple : Le gaspillage de l'eau est un grand danger.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 5 — L'environnement",
    matiere: "expression_ecrite",
    titre: "Écrire un texte argumentatif simple",
    resume: "Donner son avis et le justifier par des arguments.",
    objectifs: ["Formuler une opinion.", "Donner deux arguments et un exemple."],
    regle: [
      "Structure : **j'annonce mon avis → je donne 2 arguments → je donne un exemple → je conclus**.",
      "Connecteurs : *d'abord, ensuite, par exemple, c'est pourquoi*.",
    ],
    exemples: [
      "*Je pense qu'il faut trier les déchets. D'abord, cela protège la mer. Ensuite, cela permet de recycler. Par exemple, une bouteille peut redevenir un objet utile. C'est pourquoi je trie chaque jour.*",
    ],
    astuce: "Un argument répond à la question « pourquoi ? ».",
    exercices: [
      "Écris un texte de 5 phrases : faut-il économiser l'eau ?",
      "Souligne tes deux arguments.",
    ],
    corriges: [
      "Production personnelle respectant la structure.",
      "Deux arguments distincts et justifiés.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 6 — Les loisirs et les voyages",
    matiere: "grammaire",
    titre: "La phrase complexe et les connecteurs logiques",
    resume: "Relier deux propositions pour construire une phrase complexe.",
    objectifs: ["Compter les verbes conjugués.", "Employer mais, ou, et, donc, car."],
    regle: [
      "Une phrase **simple** contient **un seul verbe conjugué** ; une phrase **complexe** en contient **plusieurs**.",
      "On relie les propositions par des **connecteurs** : mais, ou, et, donc, or, ni, car.",
    ],
    exemples: [
      "*Nous partons en excursion **et** nous visitons le musée.*",
      "*Je suis fatigué **car** j'ai marché longtemps.*",
    ],
    astuce: "Compte les verbes conjugués : 2 verbes = phrase complexe.",
    exercices: [
      "Relie : « Il pleut. Nous restons à la maison. » (donc)",
      "Indique si la phrase est simple ou complexe : « Les élèves chantent dans le car. »",
      "Écris une phrase complexe avec « mais ».",
    ],
    corriges: [
      "Il pleut, donc nous restons à la maison.",
      "Phrase simple (un seul verbe).",
      "Exemple : J'aime la mer, mais je préfère la montagne.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 6 — Les loisirs et les voyages",
    matiere: "lecture",
    titre: "Lire un récit de voyage",
    resume: "Comprendre un texte descriptif et narratif illustré.",
    objectifs: ["Repérer l'itinéraire.", "Relever les mots de la description."],
    regle: [
      "Un récit de voyage raconte un **déplacement** : départ, étapes, arrivée.",
      "Il mêle **narration** (ce qu'on fait) et **description** (ce qu'on voit).",
      "Repère les indicateurs de lieu et de temps.",
    ],
    exemples: [
      "*Nous avons quitté Tunis à l'aube. Après deux heures de route, nous avons découvert les oasis de Tozeur.*",
    ],
    astuce: "Trace l'itinéraire sur une carte pour mieux comprendre le texte.",
    exercices: [
      "Relève les lieux cités dans le texte.",
      "Relève trois mots de la description du paysage.",
      "Remets les étapes du voyage dans l'ordre.",
    ],
    corriges: [
      "Liste des lieux du texte étudié.",
      "Trois adjectifs ou noms descriptifs.",
      "Ordre chronologique : départ → étapes → arrivée.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 6 — Les loisirs et les voyages",
    matiere: "expression_ecrite",
    titre: "Le récit de voyage illustré",
    resume: "Rédiger un récit accompagné d'une image légendée.",
    objectifs: ["Écrire un récit de 8 à 10 lignes.", "Rédiger une légende d'image."],
    regle: [
      "Plan : **avant le voyage → pendant → après (ce que j'ai aimé)**.",
      "Temps du récit : **passé composé** pour les actions, **imparfait** pour les descriptions.",
      "La **légende** de l'image dit où, quand et quoi en une phrase.",
    ],
    exemples: [
      "*Photo : la médina de Sousse, un matin de printemps, pendant notre visite scolaire.*",
    ],
    astuce: "Choisis une image et écris ton récit autour d'elle.",
    exercices: [
      "Raconte une sortie en 10 lignes.",
      "Ajoute une image et sa légende.",
      "Vérifie l'alternance passé composé / imparfait.",
    ],
    corriges: [
      "Récit structuré en trois parties.",
      "Légende complète (lieu, moment, action).",
      "Emploi correct des deux temps.",
    ],
  }),
  L({
    niveau: 5,
    trimestre: 3,
    module: "Module 6 — Les loisirs et les voyages",
    matiere: "orthographe",
    titre: "Dictée préparée : révision générale",
    resume: "Réviser accords, homophones et ponctuation avant la dictée.",
    objectifs: ["Appliquer les accords étudiés.", "Se relire méthodiquement."],
    regle: [
      "Avant la dictée : relis les règles d'accord (sujet/verbe, nom/adjectif, participe passé).",
      "Pendant : écoute la phrase entière avant d'écrire.",
      "Après : relis **trois fois** — 1) les verbes, 2) les accords du GN, 3) la ponctuation.",
    ],
    exemples: [
      "*Les vacances d'été sont arrivées ; les enfants heureux préparent leurs valises.*",
    ],
    astuce: "La relecture ciblée rapporte plus de points que la relecture rapide.",
    exercices: [
      "Écris la dictée préparée du manuel.",
      "Corrige-toi avec les trois relectures.",
      "Note tes erreurs dans un carnet.",
    ],
    corriges: [
      "Texte de la dictée sans erreur.",
      "Grille : verbes, accords, ponctuation.",
      "Carnet d'erreurs personnalisé.",
    ],
  }),

  /* ================= 6ème année — Trimestre 1 ================= */
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 1 — Vivre ensemble",
    matiere: "grammaire",
    titre: "Les fonctions dans la phrase",
    resume: "Sujet, attribut et compléments : reconnaître chaque fonction.",
    objectifs: ["Identifier le sujet et l'attribut.", "Distinguer compléments essentiels et circonstanciels."],
    regle: [
      "Le **sujet** commande l'accord du verbe (*Qui est-ce qui … ?*).",
      "L'**attribut du sujet** suit un verbe d'état (être, paraître, sembler, devenir, rester).",
      "Les **compléments essentiels** (COD, COI) appartiennent au groupe verbal ; les **circonstanciels** sont déplaçables.",
    ],
    exemples: [
      "*Les citoyens **respectent** la loi.* → COD",
      "*Ce garçon **est** généreux.* → attribut du sujet",
      "*Chaque matin, nous saluons nos voisins.* → CC de temps",
    ],
    astuce: "Verbe d'état → attribut ; verbe d'action → complément d'objet.",
    exercices: [
      "Donne la fonction de « courageux » : « Ces pompiers sont courageux. »",
      "Relève le COD : « La classe organise une collecte. »",
      "Relève le CC : « Dans le quartier, tout le monde s'entraide. »",
    ],
    corriges: ["attribut du sujet", "une collecte", "Dans le quartier (CC de lieu)"],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 1 — Vivre ensemble",
    matiere: "conjugaison",
    titre: "Le présent : révision des trois groupes",
    resume: "Maîtriser le présent, y compris les verbes du 3ème groupe.",
    objectifs: ["Classer les verbes par groupe.", "Conjuguer les verbes irréguliers usuels."],
    regle: [
      "**3ème groupe** : verbes en -ir (sans -issons), -oir, -re. Terminaisons fréquentes : -s, -s, -t/-d, -ons, -ez, -ent.",
      "Verbes usuels : prendre (je prends, nous prenons, ils prennent), venir (je viens, nous venons, ils viennent), pouvoir (je peux, nous pouvons), vouloir (je veux), dire (vous dites), faire (vous faites).",
    ],
    exemples: [
      "*Nous **prenons** le bus ensemble.*",
      "*Vous **faites** un beau travail d'équipe.*",
    ],
    astuce: "Apprends les verbes irréguliers par familles (prendre / apprendre / comprendre).",
    exercices: [
      "Conjugue « comprendre » au présent.",
      "Complète : Vous (dire) … la vérité.",
      "Complète : Ils (venir) … de la même école.",
    ],
    corriges: [
      "je comprends, tu comprends, il comprend, nous comprenons, vous comprenez, ils comprennent.",
      "dites",
      "viennent",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 1 — Vivre ensemble",
    matiere: "orthographe",
    titre: "L'accord de l'adjectif et les pluriels particuliers",
    resume: "Accorder l'adjectif, y compris les cas particuliers.",
    objectifs: ["Accorder en genre et en nombre.", "Connaître les pluriels irréguliers."],
    regle: [
      "L'adjectif s'accorde avec le nom : *un geste généreux → des gestes généreux → une action généreuse*.",
      "Pluriels particuliers : -ou → -oux (bijoux, cailloux, choux, genoux, hiboux, joujoux, poux) ; -al → -aux.",
      "Un adjectif qui qualifie plusieurs noms de genres différents se met au **masculin pluriel**.",
    ],
    exemples: [
      "*Un garçon et une fille **attentifs**.*",
      "*des travaux collectifs*",
    ],
    astuce: "Cherche d'abord le nom noyau, puis accorde.",
    exercices: [
      "Accorde : des règles (essentiel) … .",
      "Mets au pluriel : un journal local.",
      "Accorde : une élève et un élève (poli) … .",
    ],
    corriges: ["essentielles", "des journaux locaux", "polis"],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 1 — Vivre ensemble",
    matiere: "expression_ecrite",
    titre: "Le récit à la première personne",
    resume: "Raconter un souvenir en employant « je ».",
    objectifs: ["Employer le pronom je et les temps du récit.", "Exprimer ses sentiments."],
    regle: [
      "Le récit à la 1ère personne raconte une expérience **vécue** : le narrateur dit **je**.",
      "Temps : **passé composé** (actions) + **imparfait** (décor, sentiments).",
      "Exprime ce que tu as ressenti : *j'étais fier, j'ai eu peur, j'ai été surpris*.",
    ],
    exemples: [
      "*Ce jour-là, j'ai aidé un camarade tombé dans la cour. J'étais inquiet, mais j'étais fier de mon geste.*",
    ],
    astuce: "Un souvenir = un moment précis, pas toute une année.",
    exercices: [
      "Raconte en 10 lignes un jour où tu as aidé quelqu'un.",
      "Souligne les verbes au passé composé.",
      "Ajoute deux phrases exprimant tes sentiments.",
    ],
    corriges: [
      "Récit personnel cohérent.",
      "Verbes au passé composé identifiés.",
      "Vocabulaire des sentiments employé.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 2 — Le patrimoine tunisien",
    matiere: "grammaire",
    titre: "Les propositions : indépendante, principale, subordonnée",
    resume: "Analyser une phrase complexe.",
    objectifs: ["Repérer les propositions.", "Identifier la subordonnée introduite par « que » ou « qui »."],
    regle: [
      "Une **proposition** s'organise autour d'un verbe conjugué.",
      "**Indépendante** : elle se suffit à elle-même.",
      "**Principale + subordonnée** : la subordonnée dépend de la principale et commence souvent par *que, qui, quand, parce que*.",
    ],
    exemples: [
      "*Nous visitons El Jem.* → indépendante",
      "*Je sais **que l'amphithéâtre est romain**.* → principale + subordonnée",
      "*Le guide **qui nous accompagne** connaît l'histoire.* → subordonnée relative",
    ],
    astuce: "Un mot subordonnant (que, qui, quand, parce que) annonce une subordonnée.",
    exercices: [
      "Combien de propositions : « Quand nous sommes arrivés, la visite commençait. » ?",
      "Souligne la subordonnée : « Je pense que ce monument est magnifique. »",
      "Écris une phrase avec une subordonnée relative (qui).",
    ],
    corriges: [
      "Deux propositions (subordonnée de temps + principale).",
      "que ce monument est magnifique",
      "Exemple : La médina qui date du Moyen Âge est bien conservée.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 2 — Le patrimoine tunisien",
    matiere: "vocabulaire",
    titre: "Le patrimoine, les monuments et l'artisanat",
    resume: "Employer un vocabulaire précis pour décrire un monument.",
    objectifs: ["Nommer les éléments d'un monument.", "Décrire un objet artisanal."],
    regle: [
      "Monuments : amphithéâtre, mosquée, ribat, médina, remparts, coupole, minaret, mosaïque.",
      "Artisanat : poterie, tapis, cuivre, broderie, verrerie, artisan, atelier.",
      "Adjectifs utiles : ancien, historique, majestueux, coloré, sculpté, restauré.",
    ],
    exemples: [
      "*La médina de Tunis est un site historique classé, entouré de remparts.*",
    ],
    astuce: "Pour décrire : matière + couleur + forme + usage.",
    exercices: [
      "Cite 5 monuments tunisiens.",
      "Décris un objet d'artisanat en 3 phrases.",
      "Emploie « restaurer » dans une phrase.",
    ],
    corriges: [
      "Exemple : l'amphithéâtre d'El Jem, la mosquée Zitouna, le ribat de Monastir, Carthage, la médina de Sousse.",
      "Description avec matière, couleur, usage.",
      "Exemple : On a restauré les remparts de la médina.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 2 — Le patrimoine tunisien",
    matiere: "lecture",
    titre: "Lire un texte documentaire illustré",
    resume: "Prélever des informations dans un documentaire et ses images.",
    objectifs: ["Utiliser titres, sous-titres et légendes.", "Répondre avec précision."],
    regle: [
      "Un texte documentaire **informe** : il contient titres, sous-titres, photos, légendes, chiffres.",
      "Méthode : lire le titre → observer les images → lire le texte → répondre en citant le texte.",
    ],
    exemples: [
      "*L'amphithéâtre d'El Jem pouvait accueillir 35 000 spectateurs.* → information chiffrée.",
    ],
    astuce: "La légende d'une image contient souvent la réponse à la question.",
    exercices: [
      "Relève deux informations chiffrées du texte.",
      "À quoi sert la légende de la photo ?",
      "Rédige une question dont la réponse est dans le 2ème paragraphe.",
    ],
    corriges: [
      "Deux chiffres relevés dans le texte.",
      "Elle explique et complète l'image.",
      "Question pertinente et réponse localisée.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 1,
    module: "Module 2 — Le patrimoine tunisien",
    matiere: "expression_orale",
    titre: "Présenter un monument à la classe",
    resume: "Préparer et présenter un exposé court et illustré.",
    objectifs: ["Organiser un exposé en trois parties.", "Utiliser une image support."],
    regle: [
      "Plan d'exposé : **je présente (nom, lieu) → je décris (époque, taille, matériaux) → je conclus (pourquoi il faut le protéger)**.",
      "Montre une image et désigne ce dont tu parles.",
    ],
    exemples: [
      "*Je vais vous parler du ribat de Monastir. Il a été construit au VIIIᵉ siècle…*",
    ],
    astuce: "Parle 2 minutes maximum, avec 5 idées claires.",
    exercices: [
      "Prépare une fiche de 5 idées sur un monument.",
      "Présente-le en 2 minutes avec une image.",
    ],
    corriges: [
      "Fiche organisée en trois parties.",
      "Grille : clarté, vocabulaire, support visuel, durée.",
    ],
  }),

  /* ================= 6ème année — Trimestre 2 ================= */
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 3 — Sciences et découvertes",
    matiere: "grammaire",
    titre: "La voix active et la voix passive",
    resume: "Transformer une phrase active en phrase passive.",
    objectifs: ["Repérer la voix d'une phrase.", "Réaliser la transformation."],
    regle: [
      "À la **voix active**, le sujet fait l'action ; à la **voix passive**, il la subit.",
      "Transformation : le **COD** devient sujet, le sujet devient **complément d'agent** (introduit par *par*), le verbe se met à **être + participe passé** au temps de la phrase active.",
    ],
    exemples: [
      "Active : *Pasteur **a découvert** le vaccin.*",
      "Passive : *Le vaccin **a été découvert** par Pasteur.*",
    ],
    astuce: "Seuls les verbes ayant un COD peuvent se mettre à la voix passive.",
    exercices: [
      "Mets à la voix passive : « L'ingénieur construit un pont. »",
      "Mets à la voix active : « La machine est réparée par le technicien. »",
      "Indique la voix : « Les élèves observent les étoiles. »",
    ],
    corriges: [
      "Un pont est construit par l'ingénieur.",
      "Le technicien répare la machine.",
      "Voix active.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 3 — Sciences et découvertes",
    matiere: "conjugaison",
    titre: "Le plus-que-parfait et le passé simple",
    resume: "Employer les temps du récit écrit.",
    objectifs: ["Former le plus-que-parfait.", "Reconnaître le passé simple à la lecture."],
    regle: [
      "**Plus-que-parfait** = auxiliaire à l'**imparfait** + participe passé. Il exprime une action **antérieure** à une autre action passée.",
      "**Passé simple** : temps du récit écrit. 1er groupe : je chantai, il chanta, ils chantèrent ; 2ème/3ème : il finit, il prit, il fut, il eut.",
    ],
    exemples: [
      "*Quand le savant arriva, l'expérience **avait déjà commencé**.*",
      "*Il **découvrit** une nouvelle planète.*",
    ],
    astuce: "Plus-que-parfait = « le passé du passé ».",
    exercices: [
      "Conjugue « terminer » au plus-que-parfait (3 personnes).",
      "Complète : Il raconta ce qu'il (voir) … la veille.",
      "Relève les passés simples d'un paragraphe de ton manuel.",
    ],
    corriges: [
      "j'avais terminé, tu avais terminé, il avait terminé.",
      "avait vu",
      "Liste des verbes au passé simple relevés.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 3 — Sciences et découvertes",
    matiere: "orthographe",
    titre: "Accord du participe passé avec avoir",
    resume: "Accorder le participe passé quand le COD est placé avant.",
    objectifs: ["Repérer la place du COD.", "Appliquer la règle d'accord."],
    regle: [
      "Avec **avoir**, le participe passé **ne s'accorde pas** avec le sujet.",
      "Il **s'accorde avec le COD** uniquement si celui-ci est **placé avant** le verbe.",
    ],
    exemples: [
      "*Elle a écrit une lettre.* (pas d'accord)",
      "*La lettre qu'elle a **écrite** est longue.* (COD avant)",
      "*Ces expériences, je les ai **réussies**.*",
    ],
    astuce: "Cherche le COD : s'il est avant (le, la, les, que), accorde.",
    exercices: [
      "Accorde : Les livres que j'ai (lire) … sont passionnants.",
      "Accorde : Nous avons (observer) … les planètes.",
      "Accorde : Cette invention, il l'a (présenter) … hier.",
    ],
    corriges: ["lus", "observé", "présentée"],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 3 — Sciences et découvertes",
    matiere: "expression_ecrite",
    titre: "Le texte explicatif (documentaire illustré)",
    resume: "Expliquer un phénomène avec un schéma légendé.",
    objectifs: ["Organiser une explication.", "Rédiger des légendes de schéma."],
    regle: [
      "Plan : **question de départ → explication en étapes → conclusion**.",
      "Vocabulaire : *parce que, c'est pourquoi, en effet, donc, ainsi*.",
      "L'image ou le schéma doit être **légendé** et **cité** dans le texte.",
    ],
    exemples: [
      "*Pourquoi l'eau bout-elle ? Quand on chauffe l'eau, sa température monte ; à 100 °C, elle se transforme en vapeur (voir schéma 1).*",
    ],
    astuce: "Explique comme si ton lecteur ne connaissait rien au sujet.",
    exercices: [
      "Explique en 8 lignes le cycle de l'eau.",
      "Ajoute un schéma avec 3 légendes.",
      "Emploie trois connecteurs explicatifs.",
    ],
    corriges: [
      "Texte structuré (question, étapes, conclusion).",
      "Schéma légendé correctement.",
      "Connecteurs : parce que, donc, ainsi.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 4 — Le monde du travail et l'avenir",
    matiere: "grammaire",
    titre: "Les pronoms (personnels, relatifs, démonstratifs)",
    resume: "Éviter les répétitions grâce aux pronoms.",
    objectifs: ["Identifier le mot remplacé.", "Employer qui, que, dont, où."],
    regle: [
      "**Pronoms personnels** : je, tu, il, le, la, lui, leur, en, y.",
      "**Pronoms relatifs** : *qui* (sujet), *que* (COD), *où* (lieu/temps), *dont* (de …).",
      "**Pronoms démonstratifs** : celui, celle, ceux, celles, cela.",
    ],
    exemples: [
      "*Le métier **qui** me plaît est médecin.*",
      "*Le livre **que** je lis parle des métiers.*",
      "*La ville **où** je travaillerai est Sfax.*",
    ],
    astuce: "Si le pronom est suivi d'un verbe → qui ; s'il est suivi d'un sujet → que.",
    exercices: [
      "Complète : L'ingénieur … travaille ici est mon oncle.",
      "Complète : Le projet … nous préparons est utile.",
      "Remplace pour éviter la répétition : « J'aime ce métier ; ce métier est utile. »",
    ],
    corriges: ["qui", "que", "J'aime ce métier qui est utile."],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 4 — Le monde du travail et l'avenir",
    matiere: "conjugaison",
    titre: "Le conditionnel présent",
    resume: "Exprimer un souhait, une politesse ou une hypothèse.",
    objectifs: ["Former le conditionnel.", "Employer si + imparfait → conditionnel."],
    regle: [
      "Conditionnel présent = **radical du futur + terminaisons de l'imparfait** (-ais, -ais, -ait, -ions, -iez, -aient).",
      "Emplois : **souhait** (*j'aimerais*), **politesse** (*pourriez-vous*), **hypothèse** (*Si j'étais grand, je serais pilote*).",
    ],
    exemples: [
      "*Je **voudrais** devenir vétérinaire.*",
      "*Si j'avais le choix, je **travaillerais** dans la recherche.*",
    ],
    astuce: "Futur : je serai (un seul son) ; conditionnel : je serais (avec -ais).",
    exercices: [
      "Conjugue « aimer » au conditionnel présent.",
      "Complète : Si j'étais grand, je (voyager) … .",
      "Écris une demande polie avec « pouvoir ».",
    ],
    corriges: [
      "j'aimerais, tu aimerais, il aimerait, nous aimerions, vous aimeriez, ils aimeraient.",
      "voyagerais",
      "Exemple : Pourriez-vous m'aider, s'il vous plaît ?",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 4 — Le monde du travail et l'avenir",
    matiere: "vocabulaire",
    titre: "Les études, les projets et les métiers d'avenir",
    resume: "Parler de son avenir avec un vocabulaire riche.",
    objectifs: ["Employer le lexique des métiers.", "Former des noms de métiers."],
    regle: [
      "Suffixes de métiers : **-eur/-euse** (chercheur), **-ien/-ienne** (informaticien), **-iste** (journaliste), **-teur/-trice** (formateur).",
      "Lexique des projets : ambition, orientation, diplôme, formation, réussir, s'engager.",
    ],
    exemples: [
      "*Plus tard, je voudrais devenir informaticienne pour créer des applications.*",
    ],
    astuce: "Un métier se décrit par : lieu de travail + outils + missions.",
    exercices: [
      "Forme le nom de métier : soigner → … ; enseigner → … .",
      "Décris un métier d'avenir en 3 phrases.",
      "Emploie « formation » dans une phrase.",
    ],
    corriges: [
      "soignant/infirmier ; enseignant.",
      "Description : lieu, outils, missions.",
      "Exemple : Il suit une formation en informatique.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 2,
    module: "Module 4 — Le monde du travail et l'avenir",
    matiere: "expression_ecrite",
    titre: "La lettre et le courriel",
    resume: "Rédiger une lettre ou un e-mail correctement présenté.",
    objectifs: ["Respecter la présentation.", "Adapter le niveau de langue."],
    regle: [
      "Lettre : **lieu et date**, **formule d'appel** (Monsieur, Madame), **corps** (objet du message), **formule de politesse**, **signature**.",
      "Courriel : **objet clair**, message court, politesse, signature.",
      "Langue **soutenue** pour un adulte, **familière** interdite dans une lettre officielle.",
    ],
    exemples: [
      "*Sfax, le 12 mars — Monsieur le Directeur, je vous écris pour vous demander l'autorisation d'organiser une visite. Veuillez agréer, Monsieur, mes salutations respectueuses.*",
    ],
    astuce: "Une lettre = un seul but, exprimé dès la première phrase.",
    exercices: [
      "Rédige une lettre au directeur pour proposer un club de lecture.",
      "Rédige un courriel de remerciement à un intervenant.",
      "Souligne la formule de politesse.",
    ],
    corriges: [
      "Lettre complète avec les 5 éléments.",
      "Courriel avec objet et politesse.",
      "Formule adaptée au destinataire.",
    ],
  }),

  /* ================= 6ème année — Trimestre 3 ================= */
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 5 — Protéger la planète",
    matiere: "grammaire",
    titre: "Cause, conséquence et but",
    resume: "Exprimer les relations logiques dans une phrase.",
    objectifs: ["Employer parce que, donc, pour que.", "Distinguer les trois relations."],
    regle: [
      "**Cause** (pourquoi ?) : parce que, car, à cause de, grâce à.",
      "**Conséquence** (résultat) : donc, c'est pourquoi, si bien que, alors.",
      "**But** (objectif) : pour, afin de, pour que + subjonctif.",
    ],
    exemples: [
      "*La mer est polluée **parce que** l'on jette des déchets.* (cause)",
      "*Les poissons disparaissent, **c'est pourquoi** il faut agir.* (conséquence)",
      "*Nous trions **afin de** protéger la nature.* (but)",
    ],
    astuce: "« grâce à » = cause positive ; « à cause de » = cause négative.",
    exercices: [
      "Indique la relation : « Il pleut, donc la rivière monte. »",
      "Complète avec un but : « Nous plantons des arbres … . »",
      "Écris une phrase de cause sur la pollution.",
    ],
    corriges: [
      "Conséquence.",
      "Exemple : afin de lutter contre la désertification.",
      "Exemple : L'air est pollué parce que les usines rejettent des fumées.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 5 — Protéger la planète",
    matiere: "conjugaison",
    titre: "Le subjonctif présent (initiation)",
    resume: "Employer le subjonctif après certaines expressions.",
    objectifs: ["Former le subjonctif.", "Repérer les déclencheurs (il faut que, pour que)."],
    regle: [
      "Formation : **que + radical de la 3ème personne du pluriel du présent** + -e, -es, -e, -ions, -iez, -ent.",
      "Emploi après : *il faut que, pour que, avant que, je veux que, bien que*.",
      "Irréguliers : être (que je sois), avoir (que j'aie), aller (que j'aille), faire (que je fasse), pouvoir (que je puisse).",
    ],
    exemples: [
      "*Il faut que nous **protégions** la nature.*",
      "*Pour que la planète **soit** propre, chacun doit agir.*",
    ],
    astuce: "Après « il faut que », jamais de futur : on emploie le subjonctif.",
    exercices: [
      "Complète : Il faut que tu (trier) … tes déchets.",
      "Complète : Pour que nous (être) … en bonne santé…",
      "Écris une phrase avec « il faut que ».",
    ],
    corriges: ["tries", "soyons", "Exemple : Il faut que nous économisions l'eau."],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 5 — Protéger la planète",
    matiere: "expression_ecrite",
    titre: "L'argumentation et le texte persuasif illustré",
    resume: "Convaincre à l'aide d'arguments, d'exemples et d'une affiche.",
    objectifs: ["Construire une argumentation en 3 arguments.", "Créer un slogan et une affiche."],
    regle: [
      "Plan : **thèse (mon avis) → 3 arguments illustrés d'exemples → conclusion (appel à l'action)**.",
      "Connecteurs : *tout d'abord, de plus, enfin, en conclusion*.",
      "Une affiche persuasive = **image forte + slogan court + une phrase d'explication**.",
    ],
    exemples: [
      "*Tout d'abord, l'eau est une ressource rare. De plus, la gaspiller coûte cher. Enfin, chacun peut agir. En conclusion, fermons le robinet !*",
    ],
    astuce: "Un bon slogan tient en 5 mots et donne un ordre.",
    exercices: [
      "Rédige un texte persuasif de 12 lignes sur les déchets plastiques.",
      "Invente un slogan pour ton affiche.",
      "Décris l'image que tu choisirais et pourquoi.",
    ],
    corriges: [
      "Texte structuré : thèse, 3 arguments, conclusion.",
      "Slogan court, verbe à l'impératif.",
      "Justification du choix de l'image.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 5 — Protéger la planète",
    matiere: "vocabulaire",
    titre: "L'écologie et les énergies",
    resume: "Maîtriser le lexique de l'écologie et des énergies renouvelables.",
    objectifs: ["Employer un vocabulaire spécialisé.", "Distinguer énergies fossiles et renouvelables."],
    regle: [
      "Écologie : biodiversité, écosystème, réchauffement, désertification, empreinte.",
      "Énergies **renouvelables** : solaire, éolienne, hydraulique. **Fossiles** : pétrole, charbon, gaz.",
      "Actions : réduire, réutiliser, recycler.",
    ],
    exemples: [
      "*Les panneaux solaires produisent une énergie propre et renouvelable.*",
    ],
    astuce: "Retiens la règle des 3 R : Réduire, Réutiliser, Recycler.",
    exercices: [
      "Classe : pétrole, éolienne, charbon, solaire.",
      "Explique « biodiversité » avec tes mots.",
      "Emploie « réchauffement » dans une phrase.",
    ],
    corriges: [
      "Fossiles : pétrole, charbon. Renouvelables : éolienne, solaire.",
      "La variété des êtres vivants dans un milieu.",
      "Exemple : Le réchauffement climatique fait fondre les glaces.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 6 — Préparation au concours de 6ème",
    matiere: "lecture",
    titre: "Compréhension de texte long : méthode d'épreuve",
    resume: "Méthodologie complète pour réussir la partie compréhension.",
    objectifs: ["Gérer son temps.", "Répondre par des phrases complètes justifiées."],
    regle: [
      "Étape 1 : lire **deux fois** le texte, puis les questions.",
      "Étape 2 : souligner dans le texte les passages qui répondent.",
      "Étape 3 : répondre **par une phrase complète**, en reprenant les mots de la question.",
      "Étape 4 : relire pour vérifier orthographe et accords.",
    ],
    exemples: [
      "Question : *Pourquoi le héros part-il ?* → Réponse : *Le héros part parce que …* (justification tirée du texte).",
    ],
    astuce: "Ne recopie jamais tout le paragraphe : cite seulement la phrase utile.",
    exercices: [
      "Lis un texte long et réponds à 5 questions en phrases complètes.",
      "Justifie chaque réponse par une citation.",
      "Chronomètre-toi : 30 minutes maximum.",
    ],
    corriges: [
      "Réponses complètes et justifiées.",
      "Citations entre guillemets.",
      "Temps respecté.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 6 — Préparation au concours de 6ème",
    matiere: "orthographe",
    titre: "Révision générale : dictée bilan",
    resume: "Réviser toutes les règles d'accord de l'année.",
    objectifs: ["Réviser accords et homophones.", "Se relire efficacement."],
    regle: [
      "Points contrôlés : accord sujet/verbe, accord du GN, participe passé (être / avoir), homophones (a/à, on/ont, son/sont, ce/se, ces/ses, leur/leurs), ponctuation.",
      "Relecture en trois passages ciblés (verbes, GN, homophones).",
    ],
    exemples: [
      "*Les élèves que le maître a encouragés ont réussi leurs épreuves ; ils sont fiers de leur travail.*",
    ],
    astuce: "Chaque erreur récurrente doit devenir ta première vérification.",
    exercices: [
      "Écris la dictée bilan proposée par ton enseignant.",
      "Relève tes 3 erreurs les plus fréquentes de l'année.",
      "Corrige : « Les fleurs que j'ai cueilli sont belle. »",
    ],
    corriges: [
      "Dictée corrigée.",
      "Liste personnelle d'erreurs.",
      "Les fleurs que j'ai cueillies sont belles.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 6 — Préparation au concours de 6ème",
    matiere: "expression_ecrite",
    titre: "Production écrite : critères d'évaluation officiels",
    resume: "Rédiger un texte évalué selon les critères du concours.",
    objectifs: ["Connaître les critères.", "S'auto-évaluer avec une grille."],
    regle: [
      "Critères : **adéquation au sujet**, **cohérence** (idées organisées), **richesse de la langue**, **correction linguistique** (orthographe, conjugaison), **présentation**.",
      "Méthode : lire le sujet 2 fois → faire un brouillon d'idées → rédiger → relire selon la grille.",
    ],
    exemples: [
      "Grille : sujet respecté (4 pts) — organisation (4 pts) — langue (6 pts) — orthographe (4 pts) — présentation (2 pts).",
    ],
    astuce: "10 minutes de brouillon font gagner plus de points que 10 lignes en plus.",
    exercices: [
      "Rédige une production de 12 à 15 lignes sur un sujet donné.",
      "Auto-évalue-toi avec la grille.",
      "Réécris le passage le plus faible.",
    ],
    corriges: [
      "Production conforme au sujet.",
      "Grille remplie honnêtement.",
      "Réécriture améliorée.",
    ],
  }),
  L({
    niveau: 6,
    trimestre: 3,
    module: "Module 6 — Préparation au concours de 6ème",
    matiere: "poesie",
    titre: "Poésie : figures de style et récitation expressive",
    resume: "Repérer comparaison et métaphore, réciter avec émotion.",
    objectifs: ["Identifier une comparaison et une métaphore.", "Réciter en respectant le rythme."],
    regle: [
      "**Comparaison** : deux éléments rapprochés avec un outil (comme, tel que, semblable à).",
      "**Métaphore** : comparaison **sans** outil de comparaison.",
      "**Personnification** : on prête à une chose des comportements humains.",
    ],
    exemples: [
      "Comparaison : *La mer est **comme** un miroir.*",
      "Métaphore : *La mer, **miroir** du ciel.*",
      "Personnification : *Le vent **chuchote** dans les oliviers.*",
    ],
    astuce: "Cherche « comme » : s'il est présent, c'est une comparaison.",
    exercices: [
      "Identifie la figure : « Le soleil est un roi. »",
      "Transforme en comparaison : « Ses yeux, deux étoiles. »",
      "Récite le poème étudié avec le ton approprié.",
    ],
    corriges: [
      "Métaphore.",
      "Ses yeux brillent comme deux étoiles.",
      "Récitation évaluée : mémorisation, rythme, expression.",
    ],
  }),
];

export const leconsDe = (niveau: number, trimestre: number) =>
  CATALOGUE.filter((l) => l.niveau === niveau && l.trimestre === trimestre);
