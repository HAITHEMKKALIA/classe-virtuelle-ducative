# Ma Classe de Français TN — feuille de route

## Ce qui existe déjà
- Comptes Google/e-mail, rôles super admin / prof / élève avec approbation.
- Classes avec code d'invitation, approbation des élèves.
- Programme officiel : 2 niveaux, 3 trimestres, 16 modules, 128 séances, contenus par domaine, suivi de progression.
- 48 cours illustrés, création manuelle et génération IA (cours, exercices, images), correction assistée.
- Devoirs et examens avec anti-triche de base (plein écran, blocage copie, changements d'onglet), corrections et résultats.

## Ce qu'il reste à construire, par étapes

### Étape 1 — Leçon interactive en 8 temps
Chaque séance devient un parcours : intro audio/vidéo du prof, explication illustrée, exemple animé, exercice guidé, exercice autonome, correction expliquée, mini-évaluation, remédiation automatique si le score est faible. Progression sauvegardée étape par étape.

### Étape 2 — Moteur d'exercices complet
Ajout des types manquants : texte à trous, glisser-déposer, remise en ordre, association mot-image, correction de phrase, conjugaison, dictée audio, réponse orale enregistrée, dépôt de photo/PDF du cahier, chronomètre. Correction automatique pour l'objectif, grille + IA (brouillon) pour l'écrit et l'oral, note finale toujours validée par le prof.

### Étape 3 — Tableau de bord du professeur
Cours du jour, classes, devoirs en attente, copies à corriger, examens programmés, absents, compétences non maîtrisées, messages, bouton « Générer avec l'IA ».

### Étape 4 — Devoirs et examens avancés
Paramètres complets (ouverture, échéance, tentatives, ordre aléatoire, brouillon, retard, correction immédiate ou différée, notifications). Examen : minuterie serveur, sauvegarde auto, session unique, tirage depuis une banque de questions, filigrane au nom de l'élève, journal d'incidents, publication différée des résultats, détection de réponses trop similaires. Prévention intelligente plutôt que surveillance : pas de webcam ni reconnaissance faciale pour des mineurs.

### Étape 5 — Bibliothèque de médias
Import d'images et de PDF, recadrage, annotations, questions posées sur l'image, OCR d'un PDF pour en tirer un devoir interactif, générateur d'images pédagogiques (niveau, module, objectif, style, contexte tunisien, format), texte alternatif obligatoire et champ origine/licence/autorisation sur chaque ressource.

### Étape 6 — PWA et connexion lente
Installable sur mobile et ordinateur, cours téléchargés et brouillons consultables hors connexion, images allégées, interface française avec aide en arabe pour les consignes administratives.

### Étape 7 — Classe virtuelle en direct (LiveKit)
Vidéo, micro, partage d'écran et de documents, tableau blanc, main levée, sondages et quiz express, messagerie de classe, groupes de travail, présence automatique, enregistrement et replay uniquement avec autorisation. Nécessite un compte LiveKit (clé API et secret) — je vous les demanderai au moment de cette étape.

### Étape 8 — Rôle parent et conformité
Accès parent en lecture (présence, progression, résultats de son enfant uniquement), consentement du responsable légal, journal des actions administratives, durée de conservation configurable, suppression des enregistrements devenus inutiles, liens de fichiers privés et temporaires.

## Points techniques
- Base de données : nouvelles tables pour les étapes de leçon, la banque de questions, les tentatives et sauvegardes d'examen, la bibliothèque de médias avec licence, les sessions de classe virtuelle, la présence, le lien parent-élève. Chaque table protégée par des règles d'accès par rôle et par classe.
- IA : passerelle Lovable AI pour la génération de leçons, d'exercices, d'images et des propositions de correction ; l'IA ne produit qu'un brouillon.
- Stockage privé avec liens signés à durée limitée pour audio, PDF, photos de cahiers et productions.
- Temps réel : messagerie et présence via la base ; la visio arrive avec LiveKit à l'étape 7.

## Ordre proposé
Je commence par les étapes 1 à 3 (leçon interactive, moteur d'exercices, tableau de bord prof), qui donnent immédiatement une vraie valeur pédagogique, puis les étapes 4 à 6, et enfin la classe virtuelle et l'espace parent.
