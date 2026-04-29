import { useState, useMemo, useRef, SetStateAction, useEffect } from "react";
import { revueFiscalService, RevueFiscalCompanyWithStates, RevueFiscalEval, RevueFiscalPriority, QuestionnaireConfig } from "../services/revue-fiscal.service";

type RiskLevel = "FAIBLE" | "MODERE" | "ELEVE";
type View = "companies" | "review" | "plan" | "questionnaire";

interface QuestionState {
  eval: RevueFiscalEval | null;
  note: string;
  renvoi: string;
  priority: RevueFiscalPriority;
}
interface Question {
  id: string;
  text: string;
  isNew2026?: boolean;
  ref?: string;
}
interface SubSection {
  id: string;
  title: string;
  badge?: string;
  info?: string;
  questions: Question[];
}
interface Section {
  id: string;
  number: string;
  title: string;
  subsections: SubSection[];
}

const SECTIONS: Section[] = [
  {
    id: "s00",
    number: "00",
    title: "Renseignements généraux & organisation fiscale",
    subsections: [
      {
        id: "s00-1",
        title: "Identification de l'entreprise",
        questions: [
          {
            id: "00.1.01",
            text: "Dénomination sociale exacte (telle que figurant aux statuts)",
          },
          {
            id: "00.1.02",
            text: "Forme juridique (SA, SARL, SNC, SCS, GIE, EP, etc.)",
          },
          {
            id: "00.1.03",
            text: "Objet social (activité principale / secondaires)",
          },
          {
            id: "00.1.04",
            text: "Numéro d'Identifiant Unique (NIU) — vérifier la cohérence avec les déclarations",
          },
          {
            id: "00.1.05",
            text: "Adresse du siège social / adresse postale / téléphone / e-mail / site web",
          },
          {
            id: "00.1.06",
            text: "Date de création / date de début d'activité effective",
          },
          {
            id: "00.1.07",
            text: "Capital social (montant libéré / non libéré)",
          },
          {
            id: "00.1.08",
            text: "Exercice comptable : période de clôture et durée de l'exercice",
          },
          {
            id: "00.1.09",
            text: "Nom et adresse du ou des commissaires aux comptes agréés",
          },
          {
            id: "00.1.10",
            text: "Nom et adresse de l'expert-comptable ou cabinet comptable",
          },
          {
            id: "00.1.11",
            text: "Nom et adresse des autres conseils (juridique, fiscal, social)",
          },
          {
            id: "00.1.12",
            text: "Principaux actionnaires / associés : noms, nationalité, % de participation, liens de dépendance",
          },
          {
            id: "00.1.13",
            text: "Dirigeants sociaux (gérant, PCA, DG, etc.) : nom, nationalité, type de rémunération",
          },
          {
            id: "00.1.14",
            text: "Chiffre d'affaires du dernier exercice clos (dont exportation)",
          },
          {
            id: "00.1.15",
            text: "Résultats comptables et fiscaux des 3 derniers exercices (tableau comparatif)",
          },
          {
            id: "00.1.16",
            text: "Déficits fiscaux reportés (limite des 5 ans)",
          },
          {
            id: "00.1.17",
            text: "Lieu d'implantation des établissements, usines, dépôts, agences au Cameroun",
          },
          {
            id: "00.1.18",
            text: "L'entreprise fait-elle partie d'un groupe ? (organigramme juridique et capitalistique au dossier)",
          },
          {
            id: "00.1.19",
            text: "Existence d'un pacte d'actionnaires ou convention de vote ? (incidence sur le contrôle fiscal de groupe)",
          },
        ],
      },
      {
        id: "s00-2",
        title: "Données fiscales formelles",
        questions: [
          {
            id: "00.2.01",
            text: "Régime d'imposition applicable : Libératoire / Simplifié / Réel (Art. C38 ss CGI)",
          },
          {
            id: "00.2.02",
            text: "Centre des impôts compétent (Centre Régional / CIME / DGE) et gestionnaire fiscal",
          },
          {
            id: "00.2.03",
            text: "Lieu et date de dépôt des déclarations annuelles (DSF, IS, liasses fiscales)",
          },
          {
            id: "00.2.04",
            text: "L'entreprise est-elle habilitée à effectuer des retenues à la source ? (liste des impôts concernés)",
          },
          {
            id: "00.2.05",
            text: "Adhésion à un Centre de Gestion Agréé (CGA) ? Avantages fiscaux en découlant ? (CGI 2026 : abattements étendus aux membres CGA)",
            isNew2026: true,
          },
          {
            id: "00.2.06",
            text: "Le caractère libératoire de l'IGS a-t-il été correctement appliqué ? Conditions d'éligibilité respectées ? Obligations déclaratives aménagées respectées ? ✦ (Art. C38, C39, C41, C44 CGI 2026)",
            isNew2026: true,
            ref: "Art. C38, C39, C41, C44 CGI 2026",
          },
        ],
      },
      {
        id: "s00-3",
        title: "Historique fiscal : contrôles et contentieux",
        questions: [
          {
            id: "00.3.01",
            text: "L'entreprise a-t-elle fait l'objet de contrôles fiscaux au cours des 5 derniers exercices ?",
          },
          {
            id: "00.3.02",
            text: "Type de contrôle : contrôle sur pièces / vérification générale de comptabilité / ponctuel / partiel",
          },
          {
            id: "00.3.03",
            text: "Impôts vérifiés et période contrôlée",
          },
          {
            id: "00.3.04",
            text: "Montant des redressements notifiés et acceptés / contestés",
          },
          {
            id: "00.3.05",
            text: "Notifications et réponses jointes au dossier ?",
          },
          {
            id: "00.3.06",
            text: "Y a-t-il des litiges en cours ? (stade de la procédure, pièces disponibles)",
          },
          {
            id: "00.3.07",
            text: "Quelles écritures comptables et régularisations fiscales ont été opérées suite aux redressements ?",
          },
          {
            id: "00.3.08",
            text: "L'entreprise a-t-elle tenu compte des observations et rappels dont elle a été l'objet pour les exercices suivants ?",
          },
          {
            id: "00.3.09",
            text: "Niveau de la procédure contentieuse : Chef CRI / DGI / Ministre / Tribunal Administratif ou Grande Instance",
          },
          {
            id: "00.3.10",
            text: "A-t-on demandé le sursis de paiement ? Conditions et garanties offertes ?",
          },
          {
            id: "00.3.11",
            text: "L'entreprise a-t-elle engagé des procédures gracieuses ? Transaction fiscale ?",
          },
          {
            id: "00.3.12",
            text: "La procédure spéciale de transaction fiscale reconduisant les créances émises avant le 31/12/2023, avec réduction à 80 %, a-t-elle été activée ? ✦ (Nouveau 2026)",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s00-4",
        title: "Organisation du service fiscal",
        questions: [
          {
            id: "00.4.01",
            text: "Existe-t-il un service fiscal interne ? Rattachement hiérarchique ?",
          },
          {
            id: "00.4.02",
            text: "Qui établit les déclarations fiscales ? Qui les contrôle avant dépôt ?",
          },
          {
            id: "00.4.03",
            text: "Qui est responsable du respect des obligations fiscales dans le domaine informatique ?",
          },
          {
            id: "00.4.04",
            text: "Les déclarations sont-elles déposées dans les délais légaux ? (Art. L1 LPF)",
          },
          {
            id: "00.4.05",
            text: "Les règlements sont-ils effectués à temps ? Mode de paiement utilisé (chèque, virement, télépaiement)",
          },
          {
            id: "00.4.06",
            text: "Existe-t-il un état récapitulatif des sommes versées aux tiers (listing achats par fournisseur) ? (Art. 101 ss CGI)",
          },
          {
            id: "00.4.07",
            text: "Les obligations de déclarations mensuelles (fiscales et sociales) sont-elles respectées ? (Art. L2 LPF)",
          },
          {
            id: "00.4.08",
            text: "Y a-t-il eu des mises en demeure ? Des pénalités de retard de dépôt ou de paiement ?",
          },
          {
            id: "00.4.09",
            text: "Y a-t-il une démarche d'optimisation et de planification fiscale documentée ?",
          },
          {
            id: "00.4.10",
            text: "Un diagnostic fiscal global des risques a-t-il été établi récemment ?",
          },
          {
            id: "00.4.11",
            text: "Les taux d'amortissement pratiqués sont-ils conformes à la réglementation ? (Art. 7D CGI)",
          },
          {
            id: "00.4.12",
            text: "Les provisions constituées sont-elles fiscalement déductibles ? (Art. 7E CGI)",
          },
          {
            id: "00.4.13",
            text: "Les amendes et pénalités ont-elles été réintégrées au résultat comptable avant IS ? (Art. 7A al.3 CGI)",
          },
          {
            id: "00.4.14",
            text: "L'entreprise a-t-elle transmis les PV du Conseil d'Administration et de l'AGO à l'administration fiscale ?",
          },
        ],
      },
      {
        id: "s00-5",
        title: "Revue fiscale obligatoire (Nouveau 2026)",
        info: "Art. L6 quater CGI — Applicable aux entreprises avec CA > 1 milliard FCFA",
        questions: [
          {
            id: "00.5.01",
            text: "Le CA de l'entreprise dépasse-t-il 1 milliard FCFA ? (Vérifier seuil)",
            isNew2026: true,
          },
          {
            id: "00.5.02",
            text: "Un rapport de revue fiscale établi par un conseil fiscal agréé a-t-il été annexé à la DSF ? ✦",
            isNew2026: true,
          },
          {
            id: "00.5.03",
            text: "Le rapport couvre-t-il toutes les rubriques requises par la réglementation ? ✦",
            isNew2026: true,
          },
          {
            id: "00.5.04",
            text: "Le conseil fiscal agréé signataire est-il bien inscrit au tableau de l'ordre compétent ? ✦",
            isNew2026: true,
          },
          {
            id: "00.5.05",
            text: "Les recommandations de la revue précédente ont-elles été mises en œuvre ? ✦",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s00-6",
        title: "Obligations déclaratives renforcées (Nouveau 2026)",
        questions: [
          {
            id: "00.6.01",
            text: "L'entreprise transmet-elle ses données de transactions en temps réel à l'administration ? ✦ (Art. L8 sexies CGI)",
            isNew2026: true,
          },
          {
            id: "00.6.02",
            text: "Le système d'information permet-il la transmission instantanée des données de facturation ? ✦",
            isNew2026: true,
          },
          {
            id: "00.6.03",
            text: "En cas de cessation d'activité envisagée, la déclaration préalable a-t-elle été ou sera-t-elle souscrite 3 mois à l'avance ? ✦ (Art. 95, 95 bis, 96 CGI et L105 quater LPF)",
            isNew2026: true,
          },
          {
            id: "00.6.04",
            text: "Les nouvelles amendes forfaitaires pour défaut/retard de déclaration sont-elles provisionnées si nécessaire ? ✦ (Art. L97 et L99(4) LPF)",
            isNew2026: true,
          },
        ],
      },
    ],
  },
  {
    id: "s01",
    number: "01",
    title: "Respect des obligations comptables et formelles",
    subsections: [
      {
        id: "s01-1",
        title: "Organisation de la comptabilité",
        questions: [
          {
            id: "01.1.01",
            text: "Qui est chargé de la tenue de la comptabilité ? (interne / cabinet externe)",
          },
          {
            id: "01.1.02",
            text: "Quel système/logiciel comptable est utilisé ? (OHADA — Plan comptable SYSCOHADA révisé)",
          },
          {
            id: "01.1.03",
            text: "A-t-on changé récemment de système comptable ou de logiciel ? Migration des données vérifiée ?",
          },
          {
            id: "01.1.04",
            text: "La comptabilité est-elle tenue à jour ? Délai entre la pièce et la saisie ?",
          },
          {
            id: "01.1.05",
            text: "Existe-t-il une comptabilité analytique ou un tableau de bord de gestion ?",
          },
          {
            id: "01.1.06",
            text: "Le plan de comptes est-il adapté à l'activité et conforme au SYSCOHADA ?",
          },
          {
            id: "01.1.07",
            text: "La séparation des exercices est-elle correctement appliquée (cut-off) ?",
          },
          {
            id: "01.1.08",
            text: "Existe-t-il une procédure de clôture mensuelle et annuelle documentée ?",
          },
        ],
      },
      {
        id: "s01-2",
        title: "Régularité de la comptabilité",
        questions: [
          {
            id: "01.2.01",
            text: "Existence et tenue à jour des livres légaux : livre journal, livre d'inventaire, grand-livre",
          },
          {
            id: "01.2.02",
            text: "Existence des autres livres imposés par activité (livre de police, livre de pourboires, tableaux d'amortissements) ?",
          },
          {
            id: "01.2.03",
            text: "Les livres comptables sont-ils cotés et paraphés (ou leur équivalent électronique certifié) ?",
          },
          {
            id: "01.2.04",
            text: "La comptabilité informatisée respecte-t-elle les obligations légales (sauvegarde, inaltérabilité, archivage) ?",
          },
          {
            id: "01.2.05",
            text: "La comptabilité informatisée est-elle conforme aux nouvelles exigences CGI 2026 ? ✦ (Art. L30 bis LPF)",
            isNew2026: true,
            ref: "Art. L30 bis LPF",
          },
        ],
      },
      {
        id: "s01-3",
        title: "Probité et sincérité de la comptabilité",
        questions: [
          {
            id: "01.3.01",
            text: "Conservation des pièces justificatives originales (factures d'achat, de vente, bons de commande, BL) ?",
          },
          {
            id: "01.3.02",
            text: "Les factures d'acquisition d'immobilisations sont-elles toutes disponibles ?",
          },
          {
            id: "01.3.03",
            text: "Existence de bandes de caisse enregistreuse / tickets POS / états journaliers de recettes ?",
          },
          {
            id: "01.3.04",
            text: "L'inventaire du stock est-il probant, daté et suffisamment détaillé ?",
          },
          {
            id: "01.3.05",
            text: "Existence d'une balance détaillée des comptes de tiers (clients, fournisseurs, autres tiers) ?",
          },
          {
            id: "01.3.06",
            text: "Les états de rapprochements bancaires sont-ils établis mensuellement et à jour ?",
          },
          {
            id: "01.3.07",
            text: "La réalité des dépenses incombant personnellement et directement à l'entreprise est-elle vérifiable (sondages) ?",
          },
          {
            id: "01.3.08",
            text: "Y a-t-il des décalages entre la comptabilisation des recettes et leur encaissement effectif ?",
          },
          {
            id: "01.3.09",
            text: "Quels sont les délais légaux et conditions matérielles de conservation des pièces comptables ? (Délai minimum 10 ans)",
          },
          {
            id: "01.3.10",
            text: "Les comptes annuels (bilan, compte de résultat, annexe) sont-ils établis dans les délais légaux ?",
          },
          {
            id: "01.3.11",
            text: "Les états financiers ont-ils été certifiés par le commissaire aux comptes dans les délais ?",
          },
        ],
      },
    ],
  },
  {
    id: "s02",
    number: "02",
    title: "Immobilisations incorporelles et corporelles",
    subsections: [
      {
        id: "s02-1",
        title: "Inventaire et gestion des immobilisations",
        questions: [
          {
            id: "02.1.01",
            text: "Existe-t-il un fichier des immobilisations (informatisé) avec : date d'acquisition, coût d'entrée, durée, taux amortissement ?",
          },
          {
            id: "02.1.02",
            text: "Un rapprochement régulier entre le fichier et les comptes comptables est-il effectué ?",
          },
          {
            id: "02.1.03",
            text: "Quelle est la date et la périodicité du dernier inventaire physique des immobilisations ?",
          },
          {
            id: "02.1.04",
            text: "Quel est le sort des immobilisations entièrement amorties encore en service ? Sont-elles maintenues au fichier ?",
          },
          {
            id: "02.1.05",
            text: "Y a-t-il eu des mises au rebut ? Quelle est la procédure administrative et comptable (sortie du fichier, PV de destruction) ?",
          },
          {
            id: "02.1.06",
            text: "Y a-t-il eu sinistre ? Sur quelles immobilisations ? Suivi et sort de l'indemnité d'assurance ?",
          },
        ],
      },
      {
        id: "s02-2",
        title: "Acquisitions et évaluation",
        questions: [
          {
            id: "02.2.01",
            text: "Des achats de terrain ont-ils été effectués avec engagement de construire ? L'engagement a-t-il été respecté dans les délais ?",
          },
          {
            id: "02.2.02",
            text: "La valeur du terrain supportant une construction a-t-elle bien été isolée au bilan ?",
          },
          {
            id: "02.2.03",
            text: "La société bénéficie-t-elle d'un bail à construction ? (durée 18 à 99 ans, clause d'accession en fin de bail ?)",
          },
          {
            id: "02.2.04",
            text: "Les dépenses suivantes ont-elles été correctement inscrites à un compte d'immobilisations (et non en charges) ? ◦ Droits de mutation, honoraires notariés, frais d'actes ◦ Indemnités accessoires au prix d'acquisition ◦ Matériels et outillages, mobiliers de bureaux de valeur unitaire > 400 000 FCFA ◦ Études, logiciels créés par l'entreprise ou facturés par des tiers ◦ Frais d'installation et d'aménagement de nature durable",
          },
          {
            id: "02.2.05",
            text: "Existe-t-il des immeubles à usage d'habitation à l'actif ? Sont-ils donnés en location ? A qui ? TVA déduite ?",
          },
          {
            id: "02.2.06",
            text: "En cas de prise en location d'immeuble, y a-t-il eu versement d'un droit d'entrée ou droit de bail ? Mutation de jouissance possible ?",
          },
          {
            id: "02.2.07",
            text: "Des biens réévalués ont-ils été cédés ? Sort de la réserve/provision ? La réserve de réévaluation a-t-elle été distribuée ou incorporée au capital ?",
          },
          {
            id: "02.2.08",
            text: "Les amortissements des éléments réévalués sont-ils calculés sur les valeurs réévaluées ?",
          },
          {
            id: "02.2.09",
            text: "Les achats importants de matériel ne dissimulent-ils pas des apports de clientèle ?",
          },
          {
            id: "02.2.10",
            text: "L'entreprise a-t-elle fabriqué ou créé des immobilisations pour elle-même ? Méthodes d'évaluation ? TVA sur livraison à soi-même ?",
          },
          {
            id: "02.2.11",
            text: "Comment sont évaluées les immobilisations en cours à la clôture ?",
          },
          {
            id: "02.2.12",
            text: "L'entreprise a-t-elle acquis des immobilisations en devises étrangères ? Traitement des différences de change ?",
          },
          {
            id: "02.2.13",
            text: "L'entreprise a-t-elle acquis du matériel destiné à économiser l'énergie ou des matières premières ?",
          },
          {
            id: "02.2.14",
            text: "L'entreprise a-t-elle acquis des véhicules au gaz naturel ? Exonérations fiscales 2026 applicables ? ✦ (Art. 228 septies CGI — Nouveau 2026)",
            isNew2026: true,
            ref: "Art. 228 septies CGI",
          },
        ],
      },
      {
        id: "s02-3",
        title: "Cessions d'immobilisations",
        questions: [
          {
            id: "02.3.01",
            text: "Y a-t-il eu des cessions d'immobilisations durant la période ? La plus-value ou moins-value est-elle correctement calculée ?",
          },
          {
            id: "02.3.02",
            text: "Y a-t-il eu des cessions à des sociétés du groupe, à des dirigeants/associés ou à leur famille ? Conditions normales de marché ?",
          },
          {
            id: "02.3.03",
            text: "A-t-on cédé des biens ayant figuré successivement en patrimoine privé et professionnel de l'exploitant ?",
          },
          {
            id: "02.3.04",
            text: "Les plus-values réalisées sont-elles correctement imposées (court terme / long terme) ?",
          },
          {
            id: "02.3.05",
            text: "L'entreprise procède-t-elle à la régularisation de TVA en cas de cession d'immobilisation avant 5 ans ?",
          },
          {
            id: "02.3.06",
            text: "Les cessions de biens mobiliers ayant ouvert droit à déduction TVA sont-elles bien soumises à TVA ?",
          },
          {
            id: "02.3.07",
            text: "Les plus-values de cession d'actions et participations ont-elles été imposées selon les nouvelles règles renforcées ? ✦ (Art. 42 CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 42 CGI modifié 2026",
          },
        ],
      },
      {
        id: "s02-4",
        title: "Amortissements",
        questions: [
          {
            id: "02.4.01",
            text: "Les taux d'amortissement pratiqués sont-ils conformes aux usages de la profession et à la réglementation ? (Art. 7D CGI)",
          },
          {
            id: "02.4.02",
            text: "Le point de départ du calcul est-il bien respecté pour les biens acquis en cours d'exercice ? ◦ Amortissement linéaire : date d'acquisition prorata temporis ◦ Amortissement dégressif : premier jour de l'exercice d'acquisition",
          },
          {
            id: "02.4.03",
            text: "L'entreprise a-t-elle différé des amortissements ? L'amortissement linéaire minimal a-t-il été respecté ?",
          },
          {
            id: "02.4.04",
            text: "Y a-t-il eu des amortissements exceptionnels ? Sur quels biens ? Justification économique ?",
          },
          {
            id: "02.4.05",
            text: "L'amortissement dégressif est-il utilisé à plein pour l'ensemble des matériels y ouvrant droit ?",
          },
          {
            id: "02.4.06",
            text: "Les amortissements excédentaires ont-ils bien été réintégrés au résultat fiscal ? ◦ Sur les véhicules de tourisme (limite de valeur d'amortissement) ◦ Sur les biens somptuaires ◦ Sur les biens donnés en location à des tiers ou aux dirigeants",
          },
          {
            id: "02.4.07",
            text: "L'entreprise amortit-elle les biens l'année de la cession (y compris véhicules de tourisme) ?",
          },
          {
            id: "02.4.08",
            text: "Les avantages en nature résultant de la mise à disposition de biens sont-ils correctement évalués et déclarés ?",
          },
          {
            id: "02.4.09",
            text: "La durée d'amortissement fiscal des biens en crédit-bail est-elle alignée sur la durée du contrat de financement ? ✦ (Nouveau 2026)",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s02-5",
        title: "Crédit-bail et location financière",
        questions: [
          {
            id: "02.5.01",
            text: "L'entreprise utilise-t-elle des biens en crédit-bail ? Limitations des loyers déductibles respectées ? Réintégrations fiscales effectuées ?",
          },
          {
            id: "02.5.02",
            text: "Y a-t-il eu achat de contrat de crédit-bail ? Traitement comptable et fiscal correct ? Droits d'enregistrement ?",
          },
          {
            id: "02.5.03",
            text: "Y a-t-il eu cession de contrat de crédit-bail à un dirigeant ou associé ? Traitement fiscal examiné ? ◦ En matière de droits d'enregistrement ◦ En matière d'impôts directs",
          },
          {
            id: "02.5.04",
            text: "Les charges locatives payées à un bailleur-associé détenant plus de 25 % du capital sont-elles plafonnées à 2,5 % du bénéfice fiscal ? ✦ (Seuil relevé de 10 % à 25 % — Art. CGI modifié 2026)",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s02-6",
        title: "TVA sur immobilisations",
        questions: [
          {
            id: "02.6.01",
            text: "A-t-on bien respecté les règles de déduction TVA sur immobilisations ? ◦ Exclusions : véhicules de tourisme, biens somptuaires ◦ Prorata : règles d'affectation et de prorata correctement appliquées ◦ Opérations hors champ TVA : règle d'affectation appliquée",
          },
          {
            id: "02.6.02",
            text: "Les déductions de TVA afférentes aux biens importés sont-elles corroborées par les documents douaniers ?",
          },
          {
            id: "02.6.03",
            text: "Y a-t-on procédé à livraison à soi-même avec déclaration de TVA ? Cohérence avec le point de départ de l'amortissement ?",
          },
          {
            id: "02.6.04",
            text: "Lors de la dernière vérification fiscale, y a-t-il eu des redressements sur les immobilisations ? Causes ? Mesures correctrices ?",
          },
        ],
      },
    ],
  },
  {
    id: "s03",
    number: "03",
    title: "Titres de participations et de placement",
    subsections: [
      {
        id: "s03-1",
        title: "Évaluation et comptabilisation",
        questions: [
          {
            id: "03.1.01",
            text: "Les titres de participation sont-ils correctement évalués (coût historique / provision pour dépréciation) ?",
          },
          {
            id: "03.1.02",
            text: "Les provisions pour dépréciation de titres sont-elles fiscalement déductibles ? Critères justificatifs documentés ?",
          },
          {
            id: "03.1.03",
            text: "Les revenus de participations (dividendes) sont-ils correctement comptabilisés et fiscalisés ?",
          },
          {
            id: "03.1.04",
            text: "L'entreprise bénéficie-t-elle du régime mère-fille ? Conditions remplies (participation ≥ seuil légal, durée de détention) ?",
          },
        ],
      },
      {
        id: "s03-2",
        title: "Opérations sur titres",
        questions: [
          {
            id: "03.2.01",
            text: "Y a-t-il eu acquisitions de participations au cours de la période ? TVA ou droit d'enregistrement appliqués ?",
          },
          {
            id: "03.2.02",
            text: "L'entreprise a-t-elle été partie à une fusion, scission, apport partiel d'actif ? ◦ Ces opérations ont-elles été soumises au droit d'enregistrement ? ◦ Les plus-values réalisées sont-elles imposables à l'IS ? ◦ La TVA initialement déduite par la société absorbée a-t-elle fait l'objet d'une double déduction ? ◦ La société absorbante a-t-elle reversé la TVA collectée sur les ventes de marchandises de l'absorbée ?",
          },
          {
            id: "03.2.03",
            text: "Les plus-values de cession d'actions et participations ont-elles été déclarées selon les nouvelles modalités renforcées ? ✦ (Art. 42 CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 42 CGI modifié 2026",
          },
          {
            id: "03.2.04",
            text: "Les règles de déductibilité des frais d'assistance technique ont-elles été respectées selon les nouvelles dispositions ? ✦ (Art. 57 CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 57 CGI modifié 2026",
          },
        ],
      },
      {
        id: "s03-3",
        title: "Fiscalité numérique non-résidente (Nouveau 2026)",
        info: "Art. 5 bis, 5 ter, 17 quater, 21(1)(f) CGI — L'entreprise peut être débitrice (précompte) ou bénéficiaire (partenaire) de ces dispositifs",
        questions: [
          {
            id: "03.3.01",
            text: "L'entreprise réalise-t-elle des transactions avec des plateformes/opérateurs numériques non-résidents ? ✦",
            isNew2026: true,
          },
          {
            id: "03.3.02",
            text: "Ces opérateurs étrangers ont-ils un CA > 50 MFCFA ou > 1 000 utilisateurs camerounais ? (Seuil de présence économique significative) ✦",
            isNew2026: true,
          },
          {
            id: "03.3.03",
            text: "L'IS au taux de 3 % sur les revenus bruts de ces non-résidents a-t-il été correctement prélevé et reversé ? ✦",
            isNew2026: true,
          },
          {
            id: "03.3.04",
            text: "Les compagnies aériennes et maritimes étrangères opérant au Cameroun ont-elles été soumises à l'IS ? ✦",
            isNew2026: true,
          },
          {
            id: "03.3.05",
            text: "L'immatriculation des opérateurs numériques étrangers auprès de l'administration fiscale camerounaise a-t-elle été vérifiée ? ✦",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s03-4",
        title: "Dividendes et retenues à la source",
        questions: [
          {
            id: "03.4.01",
            text: "Y a-t-il eu distribution de dividendes ? À des sociétés du groupe ? À des non-résidents ?",
          },
          {
            id: "03.4.02",
            text: "La déclaration des retenues à la source sur dividendes a-t-elle été déposée dans les délais ?",
          },
          {
            id: "03.4.03",
            text: "L'entreprise dispose-t-elle des justificatifs prévus par les conventions de non-double imposition ?",
          },
          {
            id: "03.4.04",
            text: "Les dividendes ont-ils été prélevés sur des profits ayant supporté l'IS au taux normal ?",
          },
          {
            id: "03.4.05",
            text: "A-t-on déclaré les distributions se rapportant aux dépenses somptuaires ? Réintégrées ?",
          },
        ],
      },
    ],
  },
  {
    id: "s04",
    number: "04",
    title: "Stocks et en cours",
    subsections: [
      {
        id: "s04-1",
        title: "Inventaire physique",
        questions: [
          {
            id: "04.1.01",
            text: "Un inventaire physique est-il effectué à la clôture de chaque exercice ? Est-il correct sur la forme ?",
          },
          {
            id: "04.1.02",
            text: "Date du dernier inventaire physique ? Qui le réalise ? Procédure documentée ?",
          },
          {
            id: "04.1.03",
            text: "Y a-t-il des stocks hors des locaux de l'entreprise (entrepôts, dépôts, consignation chez clients) ? Inclus dans l'inventaire ?",
          },
          {
            id: "04.1.04",
            text: "Des marchandises en dépôt chez des clients sont-elles incluses dans l'inventaire de l'entreprise ?",
          },
          {
            id: "04.1.05",
            text: "Les stocks en cours de route (en transit) ont-ils été inclus dans l'inventaire ? Les factures correspondantes ont-elles été comptabilisées ?",
          },
          {
            id: "04.1.06",
            text: "Des inventaires tournants (entre deux clôtures) sont-ils effectués ? Résultats cohérents avec les inventaires annuels ?",
          },
        ],
      },
      {
        id: "s04-2",
        title: "Valorisation des stocks",
        questions: [
          {
            id: "04.2.01",
            text: "Quelle est la méthode de valorisation des stocks ? (Art. 6 Al.3 CGI — FIFO, CMUP autorisés)",
          },
          {
            id: "04.2.02",
            text: "Marchandises : méthode utilisée et cohérence avec N-1",
          },
          {
            id: "04.2.03",
            text: "Matières premières et consommables",
          },
          {
            id: "04.2.04",
            text: "Produits en cours / travaux en cours : méthode de calcul du coût de revient",
          },
          {
            id: "04.2.05",
            text: "Produits finis : incorporations des charges directes et indirectes",
          },
          {
            id: "04.2.06",
            text: "Ces méthodes ont-elles été modifiées récemment ? Impact chiffré sur le résultat fiscal ?",
          },
          {
            id: "04.2.07",
            text: "Comment les charges indirectes sont-elles incorporées dans l'évaluation des stocks ? A-t-on pris en compte le gaspillage et la sous-activité ?",
          },
          {
            id: "04.2.08",
            text: "Le stock comprend-il des marchandises achetées à un prix libellé en monnaie étrangère ? Taux de conversion utilisé ?",
          },
          {
            id: "04.2.09",
            text: "Le stock comprend-il des marchandises achetées auprès de sociétés du groupe ? À quel prix par rapport aux fournisseurs externes ?",
          },
          {
            id: "04.2.10",
            text: "Comment sont comptabilisés les emballages récupérables identifiables : en immobilisations / charges / stocks ?",
          },
        ],
      },
      {
        id: "s04-3",
        title: "Provisions et dépréciations sur stocks",
        questions: [
          {
            id: "04.3.01",
            text: "Des provisions pour dépréciation de stocks ont-elles été constituées ? Critères objectifs documentés ?",
          },
          {
            id: "04.3.02",
            text: "La règle en matière de reprise de provisions sur stocks a-t-elle été respectée ?",
          },
          {
            id: "04.3.03",
            text: "Toutes les provisions sont-elles portées au bilan et figurent-elles dans le tableau 12 de la DSF ?",
          },
          {
            id: "04.3.04",
            text: "Y a-t-il eu des prélèvements sur le stock pour les besoins personnels du chef d'entreprise ? La TVA déduite a-t-elle été reversée en fin d'exercice ?",
          },
        ],
      },
    ],
  },
  {
    id: "s05",
    number: "05",
    title: "Créances et dettes — Comptes d'associés — Abandons de créances",
    subsections: [
      {
        id: "s05-1",
        title: "Créances clients",
        questions: [
          {
            id: "05.1.01",
            text: "Le principe de rattachement des créances acquises est-il respecté ? ◦ Pour les ventes : date de livraison du bien ◦ Pour les prestations de services : date d'achèvement ou d'encaissement selon option",
          },
          {
            id: "05.1.02",
            text: "Y a-t-il eu des ventes avec clause de réserve de propriété ? Suivi en comptabilité ?",
          },
          {
            id: "05.1.03",
            text: "Les créances en monnaie étrangère sont-elles évaluées au dernier cours de change à la clôture ?",
          },
          {
            id: "05.1.04",
            text: "Des provisions pour dépréciation clients ont-elles été constituées ? Sont-elles calculées hors taxes ?",
          },
          {
            id: "05.1.05",
            text: "Les écarts de conversion actif/passif sont-ils correctement traités ? ◦ Écart actif : déductible (provision pour perte de change) ◦ Écart passif : imposable — bien intégré dans la base IS ?",
          },
          {
            id: "05.1.06",
            text: "L'entreprise procède-t-elle à des compensations entre créances clients et dettes fournisseurs ?",
          },
          {
            id: "05.1.07",
            text: "A-t-on constaté des anomalies dans les comptes clients (soldes trop importants, identité douteuse, comptes inexactement dénommés) ?",
          },
          {
            id: "05.1.08",
            text: "Le taux de TVA appliqué sur les ventes est-il correct ? Y a-t-il des opérations non soumises à TVA ? Lesquelles ?",
          },
          {
            id: "05.1.09",
            text: "Les créances définitivement irrécouvrables sont-elles correctement suivies ? La TVA est-elle récupérée en temps utile ?",
          },
          {
            id: "05.1.10",
            text: "En cas de remise à l'escompte d'effets (TVA sur encaissements) : à quelle date intervient l'exigibilité de la TVA ?",
          },
          {
            id: "05.1.11",
            text: "La TVA sur les encaissements est-elle bien appréhendée et suivie ? Régularisations annuelles déclarées l'année suivante ?",
          },
        ],
      },
      {
        id: "s05-2",
        title: "Comptes courants d'associés",
        questions: [
          {
            id: "05.2.01",
            text: "Existe-t-il des avances en compte courant de la société à ses associés / dirigeants ? Taux d'intérêt pratiqué ? Cohérence avec le marché ?",
          },
          {
            id: "05.2.02",
            text: "Existe-t-il des avances en compte courant des associés / dirigeants à la société ? Respect du taux maximum de déductibilité ?",
          },
          {
            id: "05.2.03",
            text: "Les intérêts versés sur les comptes courants d'associés sont-ils déductibles (conditions légales : libération du capital, plafond de déduction) ?",
          },
          {
            id: "05.2.04",
            text: "Les intérêts reçus par les associés ont-ils été soumis à la retenue à la source adéquate ?",
          },
          {
            id: "05.2.05",
            text: "Y a-t-il confusion entre compte courant d'associé et compte de l'exploitant / caisse ?",
          },
        ],
      },
      {
        id: "s05-3",
        title: "Dettes fournisseurs et dettes sociales/fiscales",
        questions: [
          {
            id: "05.3.01",
            text: "Les emprunts comptabilisés sont-ils nécessaires aux besoins de l'exploitation ? Les intérêts ont-ils bien été déclarés ?",
          },
          {
            id: "05.3.02",
            text: "Le remboursement des dettes sociales est-il entièrement justifié ?",
          },
          {
            id: "05.3.03",
            text: "Les retenues sur salaires correspondent-elles à la masse salariale déclarée ?",
          },
          {
            id: "05.3.04",
            text: "La retenue à la source de 5 % sur honoraires/commissions a-t-elle été effectuée et reversée au plus tard le 15 du mois suivant ? (Art. 92 bis CGI)",
          },
          {
            id: "05.3.05",
            text: "Le solde d'IS de la DSF a-t-il fait l'objet d'un règlement dans les délais auprès de la recette des impôts ?",
          },
          {
            id: "05.3.06",
            text: "La balance auxiliaire fournisseurs est-elle conforme avec le compte collectif ? Y a-t-il des compensations débiteurs/créditeurs ?",
          },
          {
            id: "05.3.07",
            text: "Existe-t-il des fournisseurs anciens non soldés ? Risque de prescription ou de rappel fiscal ?",
          },
          {
            id: "05.3.08",
            text: "A-t-on payé des marchandises à un prix excessif à un fournisseur étranger (transfer pricing) ?",
          },
          {
            id: "05.3.09",
            text: "A-t-on bien tenu compte de toutes les dettes sociales et fiscales restant à payer à la clôture (charges à payer) ?",
          },
          {
            id: "05.3.10",
            text: "Le formalisme des provisions et charges à payer a-t-il bien été respecté à la clôture ?",
          },
          {
            id: "05.3.11",
            text: "Les dirigeants ont-ils cautionné les emprunts ? Engagements souscrits en proportion des rémunérations perçues ?",
          },
        ],
      },
      {
        id: "s05-4",
        title: "Abandons de créances",
        questions: [
          {
            id: "05.4.01",
            text: "L'entreprise a-t-elle consenti des abandons de créances ? ◦ L'entreprise bénéficiaire était-elle bien en difficulté avérée ? ◦ S'agissait-il d'une filiale camerounaise / étrangère du groupe ? ◦ Les abandons ont-ils été consentis à des fins commerciales ou dans le cadre de relations financières ? ◦ Les abandons de créances ont-ils été correctement soumis à la TVA ? ◦ La situation nette de la filiale bénéficiaire est-elle devenue positive du fait de l'abandon ? ◦ L'engagement de procéder à une augmentation de capital dans les 2 ans a-t-il été pris et respecté ? ◦ L'abandon fait-il l'objet de délibérations des CA des deux sociétés ? ◦ Le traitement fiscal des abandons obtenus pour la détermination du bénéfice imposable est-il correct (commercial / financier) ?",
          },
        ],
      },
    ],
  },
  {
    id: "s06",
    number: "06",
    title: "Comptes de trésorerie",
    subsections: [
      {
        id: "s06-1",
        title: "Banque",
        questions: [
          {
            id: "06.1.01",
            text: "Qui détient la signature bancaire (gérance majoritaire / procurations) ?",
          },
          {
            id: "06.1.02",
            text: "Existe-t-il des charges ou produits différés relevés par les états de rapprochement bancaires ?",
          },
          {
            id: "06.1.03",
            text: "La TVA facturée par les établissements financiers (commissions, agios) est-elle bien récupérée ?",
          },
          {
            id: "06.1.04",
            text: "Les états de rapprochements bancaires sont-ils établis mensuellement et validés par une personne habilitée ?",
          },
          {
            id: "06.1.05",
            text: "Y a-t-il des opérations en attente prolongée dans les comptes de rapprochement ?",
          },
          {
            id: "06.1.06",
            text: "Les espèces en devises sont-elles bien converties au cours du jour de clôture de l'exercice ?",
          },
          {
            id: "06.1.07",
            text: "L'entreprise a-t-elle plusieurs comptes bancaires ? Tous sont-ils comptabilisés et déclarés ?",
          },
        ],
      },
      {
        id: "s06-2",
        title: "Caisse",
        questions: [
          {
            id: "06.2.01",
            text: "Le journal de caisse enregistre-t-il également les chèques ou seulement les espèces ?",
          },
          {
            id: "06.2.02",
            text: "Existe-t-il un brouillard de caisse, des bordereaux de ventes, des bordereaux de remises en banque ?",
          },
          {
            id: "06.2.03",
            text: "Le solde habituel en caisse paraît-il normal ? Apparaît-il parfois créditeur (anomalie majeure) ?",
          },
          {
            id: "06.2.04",
            text: "L'alimentation de la caisse est-elle régulière et cohérente avec le niveau d'activité ?",
          },
          {
            id: "06.2.05",
            text: "Les opérations au comptant sont-elles inscrites globalement en fin de journée ?",
          },
          {
            id: "06.2.06",
            text: "Existent-ils des documents analytiques de première main (tickets de caisse, POS) ?",
          },
          {
            id: "06.2.07",
            text: "Y a-t-il confusion entre le compte caisse et le compte de l'exploitant ?",
          },
          {
            id: "06.2.08",
            text: "Y a-t-il beaucoup de dépenses d'achats ou de frais généraux réglées en espèces ?",
          },
          {
            id: "06.2.09",
            text: "Comment sont réglés les frais d'hôtel, de restaurant, d'essence (espèces / carte / virement) ?",
          },
          {
            id: "06.2.10",
            text: "Les paiements de sommes ≥ 500 000 FCFA sont-ils tous effectués par chèque ou virement ? (Art. 8 bis CGI)",
          },
          {
            id: "06.2.11",
            text: "Les escomptes de caisse pour paiement comptant sont-ils bien suivis sur l'aspect TVA ?",
          },
        ],
      },
    ],
  },
  {
    id: "s07",
    number: "07",
    title: "Capitaux propres — Réserves — Distributions",
    subsections: [
      {
        id: "s07-1",
        title: "Capital et modifications statutaires",
        questions: [
          {
            id: "07.1.01",
            text: "La société a-t-elle réalisé une augmentation de capital au cours de la période ? ◦ Apports extérieurs en numéraire ou en nature : évaluation approuvée par un commissaire aux apports ? ◦ Compensation de dettes : conditions fiscales respectées (créances certaines, liquides et exigibles) ? ◦ Incorporation de réserves ou de réserve de réévaluation",
          },
          {
            id: "07.1.02",
            text: "Les droits d'enregistrement correspondant aux modifications de capital ont-ils été acquittés ?",
          },
          {
            id: "07.1.03",
            text: "Quelles ont été les modifications intervenues dans la composition du capital au cours des 3 derniers exercices ?",
          },
          {
            id: "07.1.04",
            text: "Y a-t-il eu réduction de capital ? Conditions fiscales (remboursement d'apports / annulation de pertes) ?",
          },
          {
            id: "07.1.05",
            text: "Y a-t-il eu cession de droits sociaux ? Droits d'enregistrement applicables acquittés ?",
          },
        ],
      },
      {
        id: "s07-2",
        title: "Distributions de dividendes",
        questions: [
          {
            id: "07.2.01",
            text: "Y a-t-il eu distribution de dividendes pendant la période examinée ? ◦ Distribution à des sociétés du groupe : régime mère-fille applicable ? ◦ Distribution à des non-résidents : retenue à la source effectuée ? Conventions fiscales appliquées ?",
          },
          {
            id: "07.2.02",
            text: "La déclaration des retenues à la source a-t-elle bien été déposée dans les délais ?",
          },
          {
            id: "07.2.03",
            text: "L'entreprise dispose-t-elle des justificatifs prévus par les conventions internationales contre la double imposition ?",
          },
          {
            id: "07.2.04",
            text: "Les dividendes ont-ils été prélevés sur des profits ayant supporté l'IS au taux normal ?",
          },
          {
            id: "07.2.05",
            text: "A-t-on déclaré les distributions se rapportant aux dépenses somptuaires ? Ont-elles été réintégrées ?",
          },
          {
            id: "07.2.06",
            text: "Les augmentations de capital ouvrent-elles droit à un crédit d'impôt ? A-t-il été correctement imputé ?",
          },
        ],
      },
      {
        id: "s07-3",
        title: "Crédit d'impôt emploi jeunes (Nouveau 2026)",
        info: "Art. 105 et 105 bis CGI modifiés 2026 — Étendu aux contrats d'alternance professionnelle",
        questions: [
          {
            id: "07.3.01",
            text: "L'entreprise emploie-t-elle des jeunes diplômés sous contrat d'insertion ou d'alternance professionnelle ? ✦",
            isNew2026: true,
          },
          {
            id: "07.3.02",
            text: "Le crédit d'impôt insertion de 20 % des charges exposées a-t-il été correctement calculé et déclaré ? ✦",
            isNew2026: true,
          },
          {
            id: "07.3.03",
            text: "Le crédit d'impôt mentorat a-t-il été utilisé le cas échéant ? ✦",
            isNew2026: true,
          },
          {
            id: "07.3.04",
            text: "Des avantages fiscaux sont-ils accordés dans le cadre d'investissements en zones économiquement sinistrées ? ✦",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s07-4",
        title: "Réserves et report à nouveau",
        questions: [
          {
            id: "07.4.01",
            text: "Les réserves légales, statutaires et libres sont-elles correctement constituées et mouvementées ?",
          },
          {
            id: "07.4.02",
            text: "Les pertes antérieures ont-elles été correctement imputées sur les bénéfices et les réserves disponibles ?",
          },
          {
            id: "07.4.03",
            text: "Le report à nouveau débiteur (déficit) est-il clairement identifié et justifié ?",
          },
        ],
      },
    ],
  },
  {
    id: "s08",
    number: "08",
    title: "Les subventions",
    subsections: [
      {
        id: "s08-1",
        title: "Subventions d'investissement",
        questions: [
          {
            id: "08.1.01",
            text: "L'entreprise a-t-elle bénéficié de subventions d'équipement ? De quel organisme ? Conditions d'octroi ?",
          },
          {
            id: "08.1.02",
            text: "L'entreprise a-t-elle réintégré le surplus dégagé entre l'amortissement calculé sur la valeur totale et la fraction de subvention ?",
          },
          {
            id: "08.1.03",
            text: "Les imputations comptables (compte de capitaux) et fiscales sont-elles correctes ?",
          },
          {
            id: "08.1.04",
            text: "La subvention est-elle rattachée à l'exercice conformément aux règles de rattachement à l'exercice ?",
          },
        ],
      },
      {
        id: "s08-2",
        title: "Subventions d'exploitation et d'équilibre",
        questions: [
          {
            id: "08.2.01",
            text: "L'entreprise a-t-elle obtenu des subventions d'exploitation ? De quel organisme ? Traitement comptable et fiscal correct ?",
          },
          {
            id: "08.2.02",
            text: "L'entreprise a-t-elle obtenu des subventions d'équilibre ? Sont-elles imposables ?",
          },
          {
            id: "08.2.03",
            text: "L'entreprise a-t-elle accordé des subventions d'équilibre à des filiales ? Traitement fiscal correct ?",
          },
          {
            id: "08.2.04",
            text: "La provision pour investissement a-t-elle été bien déterminée et les conditions d'investissement respectées ?",
          },
          {
            id: "08.2.05",
            text: "L'entreprise a-t-elle signé un accord dérogatoire de participation aux résultats ? Date ? Conditions ?",
          },
        ],
      },
      {
        id: "s08-3",
        title: "Aides et incitations à l'investissement",
        questions: [
          {
            id: "08.3.01",
            text: "L'entreprise bénéficie-t-elle d'un régime fiscal dérogatoire ou d'un code des investissements ?",
          },
          {
            id: "08.3.02",
            text: "L'entreprise bénéficiant d'un régime fiscal dérogatoire tient-elle une comptabilité séparée pour le projet agréé ? ✦ (Nouveau 2026 — Obligation renforcée)",
            isNew2026: true,
          },
          {
            id: "08.3.03",
            text: "Les engagements souscrits dans le cadre du régime dérogatoire sont-ils respectés ? ✦ (Nouveau 2026)",
            isNew2026: true,
          },
          {
            id: "08.3.04",
            text: "Des avantages fiscaux ont-ils été accordés dans le cadre de contrats de travail particuliers ou pour des entreprises nouvelles ?",
          },
        ],
      },
    ],
  },
  {
    id: "s09",
    number: "09",
    title: "Les provisions fiscales",
    subsections: [
      {
        id: "s09-1",
        title: "Provisions pour risques et charges",
        questions: [
          {
            id: "09.1.01",
            text: "Au cours de l'exercice, la société a-t-elle constitué des provisions pour les postes suivants ? ◦ Créances douteuses (calculées hors taxes ?) ◦ Risques / litiges en cours (provision individualisée avec dossier justificatif ?) ◦ Licenciements économiques / pré-retraites ◦ Prêts d'installation des salariés ◦ Indemnités de départ à la retraite / plan de retraite ◦ Primes de fin d'année non encore versées à la clôture ◦ Congés payés et charges sociales y afférentes ◦ Investissements ou travaux programmés / grosses réparations",
          },
          {
            id: "09.1.02",
            text: "Une provision pour garantie accordée aux clients est-elle constituée ? Mode de calcul justifié par des données statistiques suffisantes ?",
          },
          {
            id: "09.1.03",
            text: "A-t-on pratiqué une provision pour pensions et obligations similaires ? Le mode de calcul est-il conforme à la réglementation ?",
          },
        ],
      },
      {
        id: "s09-2",
        title: "Contrôle des provisions",
        questions: [
          {
            id: "09.2.01",
            text: "Les provisions pour créances douteuses sont-elles bien calculées et comptabilisées hors taxes ?",
          },
          {
            id: "09.2.02",
            text: "Des provisions devenues sans objet figurent-elles encore au bilan ? Provisions détournées de leur objet ?",
          },
          {
            id: "09.2.03",
            text: "Les provisions non déductibles figurent-elles dans la rubrique des réintégrations du tableau 22 de la DSF ?",
          },
          {
            id: "09.2.04",
            text: "Les provisions réglementées devant faire l'objet d'une reprise ont-elles été effectivement reprises dans les délais légaux ?",
          },
          {
            id: "09.2.05",
            text: "S'il y a eu reprise avant le délai légal, les raisons sont-elles clairement justifiées ?",
          },
          {
            id: "09.2.06",
            text: "Toutes les provisions inscrites au bilan figurent-elles bien dans le tableau 12 de la DSF ?",
          },
          {
            id: "09.2.07",
            text: "L'entreprise a-t-elle participé à un investissement à l'étranger ? Montant des investissements réalisés ? Résultats de la filiale étrangère ?",
          },
        ],
      },
    ],
  },
  {
    id: "s10",
    number: "10",
    title: "Charges — Relevé des frais généraux",
    subsections: [
      {
        id: "s10-1",
        title: "Conditions générales de déductibilité",
        questions: [
          {
            id: "10.1.01",
            text: "Le relevé des frais généraux est-il correctement établi ? Exhaustivité des postes déclarés ?",
          },
          {
            id: "10.1.02",
            text: "Les conditions de FOND sont-elles respectées pour chaque charge déduite ? ◦ Dépenses incombant personnellement et directement à l'entreprise camerounaise ◦ Dépenses se rapportant à l'exercice fiscal (principe de rattachement) ◦ Dépenses entraînant une diminution de l'actif net ◦ Dépenses dans l'intérêt direct de l'exploitation ◦ Absence d'acte anormal de gestion ou de dépense somptuaire ◦ Perte licite, évolution cohérente des dépenses par rapport aux résultats",
          },
          {
            id: "10.1.03",
            text: "Les conditions de FORME sont-elles respectées ? ◦ Pièces justificatives originales disponibles ◦ Comptabilisation régulière en charges de l'exercice",
          },
          {
            id: "10.1.04",
            text: "Les pénalités, amendes fiscales et pénalités contractuelles sont-elles exclues des charges déductibles ? (Art. 7A al.3 CGI)",
          },
        ],
      },
      {
        id: "s10-2",
        title: "Rémunérations et charges de personnel",
        questions: [
          {
            id: "10.2.01",
            text: "Les rémunérations prélevées par les dirigeants correspondent-elles aux délibérations des organes compétents, avant la date du dépôt de la déclaration ?",
          },
          {
            id: "10.2.02",
            text: "Existe-t-il des employés dont le salaire est inférieur au SMIG (62 000 FCFA) ? Ont-ils été soumis à l'IRPP ? (Art. 81 CGI)",
          },
          {
            id: "10.2.03",
            text: "L'entreprise ne considère-t-elle pas comme honoraires des sommes qui représentent en réalité des salaires ? Requalification risquée ?",
          },
          {
            id: "10.2.04",
            text: "Le personnel rémunéré a-t-il effectivement une activité dans l'entreprise justifiant salaires et rémunérations pris en charge ?",
          },
          {
            id: "10.2.05",
            text: "Y a-t-il parmi les salariés des membres de la famille du dirigeant ? Le travail effectif est-il en rapport avec la rémunération de chaque personne ?",
          },
          {
            id: "10.2.06",
            text: "A-t-on bien déclaré les rémunérations occultes sur la déclaration IRPP ? Sont-elles sur le relevé des frais généraux ?",
          },
          {
            id: "10.2.07",
            text: "Y a-t-il des charges versées dans des pays à fiscalité privilégiée (paradis fiscaux) ?",
          },
          {
            id: "10.2.08",
            text: "Existe-t-il un état de rapprochement entre le livre de paye, la comptabilité et les déclarations sociales ?",
          },
          {
            id: "10.2.09",
            text: "Existe-t-il un relevé des avantages en nature par bénéficiaire (logement, véhicule, frais divers) ?",
          },
          {
            id: "10.2.10",
            text: "Les indemnités kilométriques versées aux dirigeants et cadres sont-elles justifiées ? Barème utilisé ? Cumul avec amortissement véhicule évité ?",
          },
          {
            id: "10.2.11",
            text: "Les primes exceptionnelles ont-elles été correctement déclarées à l'IRPP et soumises aux cotisations sociales ?",
          },
          {
            id: "10.2.12",
            text: "L'abattement forfaitaire de 35 % (relevé de 25 %) sur les revenus exceptionnels des personnes physiques a-t-il été correctement appliqué ? ✦ (Art. 65 bis CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 65 bis CGI modifié 2026",
          },
          {
            id: "10.2.13",
            text: "Les jetons de présence payés ont-ils donné lieu à délibération du CA et approbation par l'assemblée ? Ont-ils supporté charges sociales et taxes assises sur les salaires ?",
          },
          {
            id: "10.2.14",
            text: "Les limites de déduction des jetons de présence sont-elles bien respectées ?",
          },
        ],
      },
      {
        id: "s10-3",
        title: "Versements à des non-résidents et prix de transfert",
        questions: [
          {
            id: "10.3.01",
            text: "Y a-t-il des versements à des non-résidents ou à des sociétés étrangères ? Ces versements correspondent-ils à une prestation réelle ? S'appuient-ils sur un contrat ?",
          },
          {
            id: "10.3.02",
            text: "Ces versements supportent-ils une retenue à la source ? (taux applicable selon convention ou droit interne)",
          },
          {
            id: "10.3.03",
            text: "Les dépenses réalisées avec d'autres sociétés du groupe sont-elles effectuées à un prix identique à celui pratiqué avec des tiers (prix de pleine concurrence) ?",
          },
          {
            id: "10.3.04",
            text: "L'entreprise reçoit-elle des prestations de personnes établies à l'étranger ? ◦ Cessions, concessions de brevets, droits de licence, marques ◦ Publicité, conseil, traitement de données ◦ Opérations bancaires, financières, d'assurance ◦ Mise à disposition de personnel",
          },
          {
            id: "10.3.05",
            text: "La partie non déductible des frais financiers a-t-elle bien été réintégrée au résultat fiscal ?",
          },
          {
            id: "10.3.06",
            text: "Les règles de déductibilité des frais d'assistance technique ont-elles été respectées selon les nouvelles dispositions ? ✦ (Art. 57 CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 57 CGI modifié 2026",
          },
        ],
      },
      {
        id: "s10-4",
        title: "Assurances et loyers",
        questions: [
          {
            id: "10.4.01",
            text: "L'entreprise fait-elle bien la distinction entre entretien/réparation (charges) et rénovation/amélioration (immobilisation) ?",
          },
          {
            id: "10.4.02",
            text: "Des travaux d'entretien concernant des immeubles personnels de certains dirigeants ont-ils été comptabilisés en charges d'entreprise ?",
          },
          {
            id: "10.4.03",
            text: "Les primes d'assurance-vie sont-elles bien suivies fiscalement ? ◦ Contrats souscrits au profit de la société (souscription volontaire ou imposée par un organisme financier) ◦ Contrats souscrits au profit des dirigeants (délibération de l'organe social compétent ? Primes comprises dans les rémunérations ?)",
          },
          {
            id: "10.4.04",
            text: "L'examen des contrats d'assurances ne révèle-t-il pas des contrats au bénéfice des dirigeants (assurance propre assureur) ?",
          },
          {
            id: "10.4.05",
            text: "Les loyers versés sont-ils dans le marché ? Les bénéficiaires sont-ils sans liens de dépendance avec l'entreprise, ses dirigeants ou ses associés ?",
          },
          {
            id: "10.4.06",
            text: "Le précompte sur loyers a-t-il été calculé au nouveau taux de 10 % (baissé de 15 % à 10 %) ? ✦ (Art. 87 CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 87 CGI modifié 2026",
          },
        ],
      },
      {
        id: "s10-5",
        title: "Frais de déplacement, représentation et divers",
        questions: [
          {
            id: "10.5.01",
            text: "Un suivi comptable des cadeaux clients est-il effectué ? La TVA sur cadeaux de faible valeur a-t-elle été traitée ?",
          },
          {
            id: "10.5.02",
            text: "Les frais de transport de marchandises ont-ils bien été assujettis à la TVA ?",
          },
          {
            id: "10.5.03",
            text: "Y a-t-il des ventes faites en conditions « départ » ? Les frais de transport ont-ils alors été assujettis à TVA ?",
          },
          {
            id: "10.5.04",
            text: "Tous les frais de déplacements, missions et réceptions sont-ils bien justifiés par la nature et l'importance de l'exploitation ?",
          },
          {
            id: "10.5.05",
            text: "L'entreprise conserve-t-elle toutes les pièces justificatives (y compris les frais remboursés aux salariés) ?",
          },
          {
            id: "10.5.06",
            text: "Y a-t-il des allocations forfaitaires de frais et des remboursements réels ?",
          },
          {
            id: "10.5.07",
            text: "L'entreprise respecte-t-elle bien les limites de déductions pour les dons et subventions versés à des associations, fondations, organismes d'utilité publique ?",
          },
          {
            id: "10.5.08",
            text: "Des intérêts, commissions, honoraires ont-ils été payés à des personnes domiciliées hors du Cameroun ? Conditions de déductibilité vérifiées ?",
          },
        ],
      },
      {
        id: "s10-6",
        title: "Paradis fiscaux et pays à fiscalité privilégiée",
        questions: [
          {
            id: "10.6.01",
            text: "L'entreprise a-t-elle versé des sommes à des personnes établies dans des pays à fiscalité privilégiée ? (Art. 8 ter CGI)",
          },
          {
            id: "10.6.02",
            text: "Ces dépenses correspondent-elles à des charges effectives et justifiées ?",
          },
          {
            id: "10.6.03",
            text: "L'entreprise a-t-elle effectué des versements sur un compte bancaire d'un organisme financier établi dans un État à régime fiscal privilégié ?",
          },
          {
            id: "10.6.04",
            text: "L'entreprise détient-elle une participation ≥ 10 % d'une société étrangère établie dans un paradis fiscal ?",
          },
          {
            id: "10.6.05",
            text: "Cette filiale étrangère exerce-t-elle une activité industrielle ou commerciale effective sur place ou avec des entreprises non liées ?",
          },
        ],
      },
      {
        id: "s10-7",
        title: "Précomptes secteurs numérique/télécom (Nouveau 2026)",
        info: "Art. 21 et 58 CGI modifiés 2026 — Nouveaux précomptes sur les opérations télécom et plateformes numériques",
        questions: [
          {
            id: "10.7.01",
            text: "Les nouveaux précomptes instaurés dans les secteurs des télécommunications ont-ils bien été collectés et reversés ? ✦",
            isNew2026: true,
          },
          {
            id: "10.7.02",
            text: "Les précomptes sur les plateformes numériques ont-ils bien été traités ? ✦",
            isNew2026: true,
          },
          {
            id: "10.7.03",
            text: "Les acomptes d'IS du secteur téléphonie/numérique sont-ils alignés sur les encaissements effectifs ? ✦ (Art. 21 bis CGI)",
            isNew2026: true,
          },
          {
            id: "10.7.04",
            text: "L'extension du précompte sur achats aux opérations réalisées dans le secteur téléphonie/numérique est-elle correctement appliquée ? ✦ (Art. 21(3) CGI)",
            isNew2026: true,
          },
        ],
      },
    ],
  },
  {
    id: "s11",
    number: "11",
    title: "Les produits",
    subsections: [
      {
        id: "s11-1",
        title: "Chiffre d'affaires et rattachement",
        questions: [
          {
            id: "11.1.01",
            text: "Un rapprochement périodique est-il effectué entre les déclarations mensuelles de TVA et le chiffre d'affaires comptabilisé ?",
          },
          {
            id: "11.1.02",
            text: "L'entreprise indique-t-elle son NIU sur toutes ses factures de vente ?",
          },
          {
            id: "11.1.03",
            text: "Les règles de rattachement à l'exercice sont-elles bien appliquées (ventes livrées avant clôture mais non facturées, ou facturées non livrées) ?",
          },
          {
            id: "11.1.04",
            text: "A-t-on procédé à des rapprochements pour vérifier les ventes (fiches de magasin, carnets de commandes, reconstitution des quantités) ?",
          },
          {
            id: "11.1.05",
            text: "Les intérêts pour règlement à terme des clients sont-ils inclus dans la base TVA ?",
          },
          {
            id: "11.1.06",
            text: "Comment sont facturés les frais de transport à la charge des clients ? Sont-ils soumis à TVA ?",
          },
          {
            id: "11.1.07",
            text: "Les réductions de prix (rabais, remises, ristournes) sont-elles exclues de la base d'imposition ? Les avoirs sont-ils correctement libellés ?",
          },
          {
            id: "11.1.08",
            text: "Les règles concernant les escomptes ont-elles bien été respectées (impact sur la base TVA) ?",
          },
        ],
      },
      {
        id: "s11-2",
        title: "TVA collectée",
        questions: [
          {
            id: "11.2.01",
            text: "La TVA est-elle reversée sur les sommes encaissées se rapportant à des créances considérées irrécouvrables ?",
          },
          {
            id: "11.2.02",
            text: "Si la TVA est acquittée sur les encaissements : la taxe afférente aux sommes dues par les clients à la clôture figure-t-elle au passif du bilan ?",
          },
          {
            id: "11.2.03",
            text: "La TVA correspondant aux avances reçues des clients figure-t-elle à l'actif ?",
          },
          {
            id: "11.2.04",
            text: "Les règles TVA sur les factures sont-elles respectées (date, n°, NIU fournisseur/client, désignation, prix HT, taux, total HT, taxe) ?",
          },
          {
            id: "11.2.05",
            text: "Y a-t-il des opérations avec des clients non-résidents (exonération possible à l'export) ? Les conditions sont-elles remplies ?",
          },
        ],
      },
      {
        id: "s11-3",
        title: "TVA déductible et régime particulier",
        questions: [
          {
            id: "11.3.01",
            text: "L'entreprise est-elle partiellement assujettie à la TVA ? Secteurs distincts identifiés ? Règles d'affectation et de prorata respectées ?",
          },
          {
            id: "11.3.02",
            text: "L'entreprise effectue-t-elle des achats ou des ventes en suspension de taxe ? Conformité avec les attestations visées par l'administration ?",
          },
          {
            id: "11.3.03",
            text: "Les déductions de TVA afférentes aux biens importés sont-elles correctement pratiquées et corroborées par les documents douaniers ?",
          },
          {
            id: "11.3.04",
            text: "L'entreprise récupère-t-elle la TVA sur les opérations résiliées, annulées ou impayées ? Quelle procédure utilise-t-elle ?",
          },
          {
            id: "11.3.05",
            text: "Les règles de récupération de TVA sur les charges ont-elles bien été appliquées ? ◦ Exclusions : produits pétroliers, véhicules de tourisme, dépenses somptuaires ◦ Les déductions sont-elles justifiées par des factures mentionnant la TVA ?",
          },
          {
            id: "11.3.06",
            text: "Si fusion ou apport partiel d'actif, les formalités TVA ont-elles été correctement respectées (engagements dans le traité d'apport) ?",
          },
          {
            id: "11.3.07",
            text: "L'entreprise vérifie-t-elle l'exactitude du NIU de ses contractants sur les factures d'achat ?",
          },
          {
            id: "11.3.08",
            text: "Si le prestataire étranger facture la TVA, a-t-il désigné un représentant fiscal au Cameroun ?",
          },
        ],
      },
      {
        id: "s11-4",
        title: "Taux réduit TVA 10 % (Nouveau 2026)",
        info: "Art. 142 CGI modifié 2026 — Le taux réduit de 10 % remplace l'exonération sur certaines opérations immobilières sociales",
        questions: [
          {
            id: "11.4.01",
            text: "Un taux réduit de TVA de 10 % est-il appliqué aux opérations d'intérêts sur prêts immobiliers pour l'acquisition d'une première maison d'habitation ? ✦",
            isNew2026: true,
          },
          {
            id: "11.4.02",
            text: "Un taux réduit de TVA de 10 % est-il appliqué aux ventes et locations de logements sociaux consentis par les promoteurs ? ✦",
            isNew2026: true,
          },
          {
            id: "11.4.03",
            text: "L'ancien régime d'exonération a-t-il été correctement remplacé par le taux réduit (pas de rémanence, chaîne de déduction respectée) ? ✦",
            isNew2026: true,
          },
          {
            id: "11.4.04",
            text: "Les opérations immobilières sociales ont-elles fait l'objet d'une facturation distincte avec mention du taux réduit ? ✦",
            isNew2026: true,
          },
        ],
      },
      {
        id: "s11-5",
        title: "Droits d'accises",
        questions: [
          {
            id: "11.5.01",
            text: "L'entreprise produit-elle ou vend-elle des produits soumis aux droits d'accises (boissons alcoolisées, tabacs, produits de luxe) ?",
          },
          {
            id: "11.5.02",
            text: "Les droits d'accises sur les vins et spiritueux haut de gamme sont-ils calculés aux nouveaux tarifs relevés pour 2026 ? ✦ (Art. 142(8) CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 142(8) CGI modifié 2026",
          },
          {
            id: "11.5.03",
            text: "Les droits d'accises sur la bière restent-ils au taux antérieur (pas de relèvement pour ce produit de grande consommation) ?",
          },
        ],
      },
      {
        id: "s11-6",
        title: "Autres produits",
        questions: [
          {
            id: "11.6.01",
            text: "Les productions immobilisées ont-elles bien donné lieu à livraison à soi-même (TVA ? Déduction éventuelle ?) ?",
          },
          {
            id: "11.6.02",
            text: "Si la société perçoit des revenus mobiliers sans bénéficier du régime mère-fille, les crédits d'impôts ou avoirs fiscaux sont-ils déduits de l'IS ?",
          },
          {
            id: "11.6.03",
            text: "A-t-on tenu compte des conventions fiscales internationales pour les crédits d'impôts reçus des sociétés étrangères ?",
          },
          {
            id: "11.6.04",
            text: "L'entreprise a-t-elle perçu des indemnités (assurance, expropriation) ? Traitement fiscal correct ?",
          },
          {
            id: "11.6.05",
            text: "L'entreprise a-t-elle perçu des subventions ? De quel organisme ? Sont-elles imposables ?",
          },
          {
            id: "11.6.06",
            text: "Les travaux et expertises sur biens meubles corporels matériellement exécutés au Cameroun par des entreprises étrangères sont-ils bien imposés à la TVA au Cameroun ?",
          },
          {
            id: "11.6.07",
            text: "L'entreprise donne-t-elle en location des immeubles d'habitation ? Droit de bail correctement calculé ? Option TVA sur les immeubles y donnant droit ?",
          },
          {
            id: "11.6.08",
            text: "Y a-t-il eu des rectifications de factures entraînant des régularisations (avoirs, escomptes, autres) ?",
          },
          {
            id: "11.6.09",
            text: "Le suivi fiscal des dividendes des participations dans des sociétés de personnes a-t-il bien été effectué ?",
          },
        ],
      },
    ],
  },
  {
    id: "s12",
    number: "12",
    title: "Droits de douane et contrôle des changes",
    subsections: [
      {
        id: "s12-1",
        title: "Droits de douane",
        questions: [
          {
            id: "12.1.01",
            text: "L'entreprise fait-elle appel à un transitaire ou à un commissionnaire en douane agréé ?",
          },
          {
            id: "12.1.02",
            text: "L'entreprise est-elle inscrite au fichier des importateurs ?",
          },
          {
            id: "12.1.03",
            text: "L'entreprise pratique-t-elle des exportations ou importations sous régimes suspensifs ? (Art. L49 CGI)",
          },
          {
            id: "12.1.04",
            text: "Les biens importés sont-ils placés sous régime d'admission temporaire ou de transit ?",
          },
          {
            id: "12.1.05",
            text: "L'entreprise a-t-elle des difficultés concernant la détermination de la valeur en douane pour certains biens ? Lesquels ?",
          },
          {
            id: "12.1.06",
            text: "L'entreprise a-t-elle fait l'objet de poursuites pour minoration de valeur ? Majoration de valeur ?",
          },
          {
            id: "12.1.07",
            text: "Les biens importés par l'entreprise sont-ils soumis à une licence d'importation ?",
          },
          {
            id: "12.1.08",
            text: "L'entreprise bénéficie-t-elle de tarifs préférentiels (accords CEMAC, ZLECAf ou bilatéraux) ?",
          },
          {
            id: "12.1.09",
            text: "Les importations réalisées sont-elles soumises aux droits de douane ? Taux applicables correctement appliqués ?",
          },
          {
            id: "12.1.10",
            text: "L'entreprise a-t-elle fait l'objet de poursuites pour fausse déclaration d'origine ou autres motifs douaniers ? Les faits ont-ils cessé ?",
          },
          {
            id: "12.1.11",
            text: "L'entreprise a-t-elle des crédits d'impôts en matière de droits de douane ? Sont-ils correctement suivis ?",
          },
          {
            id: "12.1.12",
            text: "Les déductions douanières sur matériels importés sont-elles corroborées par les déclarations en douane (DUM/DAU) ?",
          },
        ],
      },
      {
        id: "s12-2",
        title: "Contrôle des changes",
        questions: [
          {
            id: "12.2.01",
            text: "L'entreprise a-t-elle fait l'objet d'un contrôle pour non-respect de la réglementation des changes ? Y a-t-il eu sanction ? Les faits ont-ils cessé ?",
          },
          {
            id: "12.2.02",
            text: "L'entreprise détient-elle des participations supérieures à 20 % dans d'autres entreprises (filiales camers/étrangères/hors groupe) ?",
          },
          {
            id: "12.2.03",
            text: "Si participation > 20 % dans une entreprise étrangère : déclaration préalable d'investissement direct et/ou autorisation préalable déposées ?",
          },
          {
            id: "12.2.04",
            text: "L'entreprise bénéficie-t-elle de garanties accordées par des entreprises camerounaises ou étrangères ? Déclaration/autorisation préalable ?",
          },
          {
            id: "12.2.05",
            text: "L'entreprise a-t-elle accordé des garanties à des filiales ou sociétés hors groupe ? Lesquelles ?",
          },
          {
            id: "12.2.06",
            text: "L'entreprise rencontre-t-elle des difficultés dans la mise en jeu de ces garanties ?",
          },
          {
            id: "12.2.07",
            text: "Dans ses importations, l'entreprise recourt-elle à des couvertures de change à terme ou des avances en devises ?",
          },
          {
            id: "12.2.08",
            text: "L'entreprise accorde-t-elle des prêts à des entreprises étrangères (du groupe / hors groupe) ? Autorisation sollicitée ? Difficultés de rapatriement des intérêts ?",
          },
          {
            id: "12.2.09",
            text: "L'entreprise a-t-elle emprunté à des entreprises étrangères (du groupe / hors groupe) ? Autorisation sollicitée ?",
          },
          {
            id: "12.2.10",
            text: "L'entreprise est-elle une filiale d'une société étrangère ? Liens de dépendance ou de contrôle (juridique ou de fait) ?",
          },
          {
            id: "12.2.11",
            text: "Y a-t-il des transferts indirects de bénéfices à l'étranger ? ◦ Majoration ou minoration de prix d'achat et de vente ◦ Redevances excessives ou sans contrepartie ◦ Attribution d'avantages hors de proportion avec les services obtenus",
          },
          {
            id: "12.2.12",
            text: "L'entreprise a-t-elle versé des sommes à des personnes établies à l'étranger soumises à un régime fiscal privilégié ? (Art. 8 ter CGI)",
          },
        ],
      },
      {
        id: "s12-3",
        title: "Assistance internationale au recouvrement (Nouveau 2026)",
        info: "Art. L94 septies LPF — Nouveau 2026 : l'administration fiscale camerounaise peut solliciter l'assistance d'administrations étrangères",
        questions: [
          {
            id: "12.3.01",
            text: "L'entreprise a-t-elle été informée de l'activation de la clause d'assistance internationale au recouvrement à son encontre ? ✦",
            isNew2026: true,
          },
          {
            id: "12.3.02",
            text: "Des créances fiscales de l'État camerounais sur l'entreprise sont-elles en cours de recouvrement à l'étranger ? ✦",
            isNew2026: true,
          },
          {
            id: "12.3.03",
            text: "Des démarches de mise en conformité ont-elles été engagées pour prévenir ce risque ? ✦",
            isNew2026: true,
          },
        ],
      },
    ],
  },
  {
    id: "s13",
    number: "13",
    title: "IRPP — Fiscalité des personnes et obligations sociales",
    subsections: [
      {
        id: "s13-1",
        title: "IRPP sur salaires et traitements",
        questions: [
          {
            id: "13.1.01",
            text: "Le calcul de l'IRPP sur les salaires est-il conforme au barème légal (tranches et taux) ?",
          },
          {
            id: "13.1.02",
            text: "Les déductions légales (abattement forfaitaire pour frais professionnels, cotisations sociales) sont-elles correctement appliquées ?",
          },
          {
            id: "13.1.03",
            text: "L'IRPP retenu à la source est-il reversé dans les délais (avant le 15 du mois suivant) ?",
          },
          {
            id: "13.1.04",
            text: "L'abattement de 35 % (relevé de 25 %) sur les revenus exceptionnels est-il correctement appliqué ? ✦ (Art. 65 bis CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 65 bis CGI modifié 2026",
          },
          {
            id: "13.1.05",
            text: "La déclaration annuelle des salaires (DIPE) est-elle déposée dans les délais et concordante avec les bulletins de paie et la comptabilité ?",
          },
          {
            id: "13.1.06",
            text: "Les avantages en nature sont-ils correctement évalués et intégrés dans la base IRPP ?",
          },
        ],
      },
      {
        id: "s13-2",
        title: "Cotisations et obligations sociales",
        questions: [
          {
            id: "13.2.01",
            text: "Les cotisations CNPS (part patronale et salariale) sont-elles correctement calculées et déclarées ?",
          },
          {
            id: "13.2.02",
            text: "Le Crédit Foncier du Cameroun (CFC) — taxe sur les salaires — est-il correctement calculé et déclaré ?",
          },
          {
            id: "13.2.03",
            text: "Le Fonds National de l'Emploi (FNE) — contribution patronale — est-il correctement calculé et déclaré ?",
          },
          {
            id: "13.2.04",
            text: "La taxe d'apprentissage est-elle calculée sur la bonne assiette et déclarée dans les délais ?",
          },
          {
            id: "13.2.05",
            text: "La contribution au logement est-elle correctement calculée et reversée ?",
          },
          {
            id: "13.2.06",
            text: "Les retenues et contributions sociales sont-elles correctement rapprochées entre le livre de paye, la comptabilité et les déclarations sociales ?",
          },
        ],
      },
      {
        id: "s13-3",
        title: "Taxe sur la valeur locative (TVL) et taxe foncière",
        questions: [
          {
            id: "13.3.01",
            text: "L'entreprise est-elle assujettie à la taxe sur la valeur locative (TVL) ? Base correctement calculée ?",
          },
          {
            id: "13.3.02",
            text: "L'entreprise est-elle propriétaire d'immeubles ? La taxe foncière a-t-elle été correctement acquittée ?",
          },
          {
            id: "13.3.03",
            text: "La répartition géographique du personnel est-elle correcte pour la TVL ? Opportunité de transférer le siège social ?",
          },
        ],
      },
      {
        id: "s13-4",
        title: "Patente et taxe professionnelle",
        questions: [
          {
            id: "13.4.01",
            text: "Quel est le montant de la patente/taxe professionnelle payée au cours des 3 derniers exercices ?",
          },
          {
            id: "13.4.02",
            text: "L'entreprise donne-t-elle en location des biens à des tiers ? Exclusion des biens affectés à une activité non taxable ?",
          },
          {
            id: "13.4.03",
            text: "Y a-t-il eu création ou acquisition d'un établissement au cours de l'exercice ? Déclaration effectuée ?",
          },
          {
            id: "13.4.04",
            text: "Des immobilisations peuvent-elles être mises au rebut et exclues de la base de la patente ? Tableaux d'amortissements apurés ?",
          },
          {
            id: "13.4.05",
            text: "Les agencements à caractère immobilier sont-ils exclus de la base assujettie à la patente ?",
          },
          {
            id: "13.4.06",
            text: "Comment ont été déclarés les salaires provenant de la mise à disposition de personnel (par l'employeur / par l'utilisateur) ?",
          },
          {
            id: "13.4.07",
            text: "L'entreprise a-t-elle bénéficié d'exonérations (contrats de travail particuliers, entreprises nouvelles) ?",
          },
        ],
      },
    ],
  },
  {
    id: "s14",
    number: "14",
    title: "Retenues à la source et taxe spéciale sur les revenus (TSR)",
    subsections: [
      {
        id: "s14-1",
        title: "Taxe Spéciale sur les Revenus (TSR)",
        questions: [
          {
            id: "14.1.01",
            text: "L'entreprise effectue-t-elle des paiements à des personnes physiques ou morales domiciliées à l'étranger au titre de revenus passifs (dividendes, intérêts, redevances, loyers...) ?",
          },
          {
            id: "14.1.02",
            text: "La TSR au taux applicable selon la convention fiscale ou à défaut selon le droit interne a-t-elle été correctement retenue et reversée ?",
          },
          {
            id: "14.1.03",
            text: "Les certificats de résidence fiscale des bénéficiaires étrangers sont-ils disponibles au dossier ?",
          },
          {
            id: "14.1.04",
            text: "Les déclarations mensuelles de TSR sont-elles déposées dans les délais ?",
          },
        ],
      },
      {
        id: "s14-2",
        title: "Retenues à la source sur honoraires et prestations",
        questions: [
          {
            id: "14.2.01",
            text: "La retenue à la source de 5 % sur les honoraires, commissions, courtages et émoluments versés à des tiers a-t-elle été effectuée ? (Art. 92 bis CGI)",
          },
          {
            id: "14.2.02",
            text: "Cette retenue a-t-elle été reversée au plus tard le 15 du mois suivant ?",
          },
          {
            id: "14.2.03",
            text: "L'entreprise distingue-t-elle correctement les honoraires (soumis à retenue) des frais de sous-traitance (traitement différent) ?",
          },
          {
            id: "14.2.04",
            text: "La retenue à la source sur loyers (précompte) a-t-elle été effectuée au nouveau taux de 10 % ? ✦ (Art. 87 CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 87 CGI modifié 2026",
          },
        ],
      },
      {
        id: "s14-3",
        title: "Précompte IS",
        questions: [
          {
            id: "14.3.01",
            text: "Les acomptes d'IS (précompte sur achats, précompte sur importations) sont-ils correctement calculés et reversés ?",
          },
          {
            id: "14.3.02",
            text: "Le précompte sur achats est-il bien appliqué aux transactions avec les assujettis du régime simplifié ou du libératoire ?",
          },
          {
            id: "14.3.03",
            text: "Le solde d'IS en fin d'exercice a-t-il été correctement calculé en tenant compte des acomptes versés ?",
          },
        ],
      },
    ],
  },
  {
    id: "s15",
    number: "15",
    title: "Transition écologique — Taxes environnementales (Nouveau 2026)",
    info: "Art. 124 quater à 124 octies et 228 septies CGI — Nouvelles mesures fiscales écologiques introduites par la Loi de Finances 2026",
    subsections: [
      {
        id: "s15-1",
        title: "Taxes environnementales",
        questions: [
          {
            id: "15.1.01",
            text: "L'entreprise est-elle assujettie aux nouvelles taxes environnementales introduites par la LF 2026 ? ✦ (Art. 124 quater à 124 octies CGI)",
            isNew2026: true,
            ref: "Art. 124 quater à 124 octies CGI",
          },
          {
            id: "15.1.02",
            text: "Ces taxes ont-elles été correctement calculées et déclarées ? ✦",
            isNew2026: true,
          },
          {
            id: "15.1.03",
            text: "L'entreprise bénéficie-t-elle d'exonérations fiscales pour les véhicules au gaz naturel ou à énergie propre ? ✦ (Art. 228 septies CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 228 septies CGI modifié 2026",
          },
          {
            id: "15.1.04",
            text: "L'entreprise a-t-elle investi dans des équipements à économie d'énergie ou des matières premières ? Traitement fiscal correct ? ✦",
            isNew2026: true,
          },
          {
            id: "15.1.05",
            text: "Les bouquets TV de base bénéficiant de mesures fiscales favorables pour le pouvoir d'achat ont-ils été traités conformément à la réglementation ? ✦ (Nouveauté 2026)",
            isNew2026: true,
          },
          {
            id: "15.1.06",
            text: "Les mesures fiscales en faveur des personnes handicapées ont-elles été appliquées le cas échéant ? ✦ (Art. 149(2) CGI modifié 2026)",
            isNew2026: true,
            ref: "Art. 149(2) CGI modifié 2026",
          },
        ],
      },
    ],
  },
  {
    id: "s16",
    number: "16",
    title: "Synthèse — Risques et recommandations",
    subsections: [
      {
        id: "s16-1",
        title: "Évaluation globale du risque fiscal",
        questions: [
          {
            id: "16.1.01",
            text: "Quel est le niveau global de risque fiscal estimé de l'entreprise (faible / modéré / élevé) ?",
          },
          {
            id: "16.1.02",
            text: "Les principaux risques identifiés ont-ils été correctement provisionnés dans les comptes ?",
          },
          {
            id: "16.1.03",
            text: "Y a-t-il des risques de redressement sur des exercices non prescrits ? Montant estimé ?",
          },
          {
            id: "16.1.04",
            text: "L'entreprise est-elle en mesure de justifier l'ensemble de ses positions fiscales adoptées ?",
          },
        ],
      },
      {
        id: "s16-2",
        title: "Délais de prescription",
        questions: [
          {
            id: "16.2.01",
            text: "La prescription de 3 ans est-elle opposable à l'administration pour les exercices N-3 et antérieurs ? (Art. L50 LPF)",
          },
          {
            id: "16.2.02",
            text: "Des actes interruptifs de prescription ont-ils été établis par l'administration ?",
          },
          {
            id: "16.2.03",
            text: "La prescription décennale s'applique-t-elle dans des cas d'activité occulte ou de manœuvres frauduleuses ?",
          },
        ],
      },
      {
        id: "s16-3",
        title: "Recommandations et plan d'action",
        questions: [
          {
            id: "16.3.01",
            text: "Des recommandations de mise en conformité ont-elles été formulées par le réviseur ?",
          },
          {
            id: "16.3.02",
            text: "Un plan d'action avec délais et responsables a-t-il été établi et validé par la direction ?",
          },
          {
            id: "16.3.03",
            text: "Les erreurs matérielles identifiées feront-elles l'objet de déclarations rectificatives ?",
          },
          {
            id: "16.3.04",
            text: "Des décisions de gestion ou optimisations fiscales sont-elles à suggérer à la direction ?",
          },
          {
            id: "16.3.05",
            text: "Une formation fiscale du personnel en charge des déclarations est-elle nécessaire ?",
          },
        ],
      },
    ],
  },
];

const EC = {
  NA: { label: "N.A.", color: "#6b7280", bg: "#f3f4f6", icon: "—" },
  OK: { label: "O.K.", color: "#15803d", bg: "#f0fdf4", icon: "✓" },
  ERR_MAT: { label: "ERR.MAT.", color: "#c2410c", bg: "#fff7ed", icon: "!" },
  ANOMALIE: { label: "ANOMALIE", color: "#b91c1c", bg: "#fef2f2", icon: "✕" },
};

const defQS = (): QuestionState => ({
  eval: null,
  note: "",
  renvoi: "",
  priority: "normale",
});

function getStats(
  cid: string,
  states: Record<string, Record<string, QuestionState>>,
) {
  const cs = states[cid] ?? {};
  const all: string[] = [];
  SECTIONS.forEach((s) =>
    s.subsections.forEach((sub) =>
      sub.questions.forEach((q) => all.push(q.id)),
    ),
  );
  const answered = all.filter((id) => cs[id]?.eval != null);
  return {
    total: all.length,
    answered: answered.length,
    anomalies: all.filter((id) => cs[id]?.eval === "ANOMALIE").length,
    erreurs: all.filter((id) => cs[id]?.eval === "ERR_MAT").length,
    ok: all.filter((id) => cs[id]?.eval === "OK").length,
    na: all.filter((id) => cs[id]?.eval === "NA").length,
    pct: Math.round((answered.length / all.length) * 100),
  };
}

// ─────────────────────────────────────────────
export default function RevueFiscal() {
  const [view, setView] = useState<View>("companies");
  const [companies, setCompanies] = useState<RevueFiscalCompanyWithStates[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSec, setActiveSec] = useState("s00");
  const [states, setStates] = useState<
    Record<string, Record<string, QuestionState>>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Partial<RevueFiscalCompanyWithStates>>({});
  const [planFilter, setPlanFilter] = useState<"all" | "anomalies" | "erreurs">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Questionnaire editing state
  const [isEditingQuestionnaire, setIsEditingQuestionnaire] = useState(false);
  const [questionnaireConfig, setQuestionnaireConfig] = useState<QuestionnaireConfig | null>(null);
  const [questionnaireSections, setQuestionnaireSections] = useState<Section[]>(SECTIONS);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await revueFiscalService.getCompanies();

        // Convert to local state format
        const companiesData = data.map(company => ({
          ...company,
          sector: company.sector || "",
          exercice: company.exercice || "",
          reviseur: company.reviseur || "",
          chef: company.chef || "",
          niu: company.niu || "",
        }));

        setCompanies(companiesData);

        // Build states from questionStates
        const statesData: Record<string, Record<string, QuestionState>> = {};
        data.forEach(company => {
          statesData[company.id] = {};
          company.questionStates.forEach(qs => {
            statesData[company.id][qs.questionId] = {
              eval: qs.eval || null,
              note: qs.note || "",
              renvoi: qs.renvoi || "",
              priority: qs.priority,
            };
          });
        });
        setStates(statesData);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
        console.error("Error loading companies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Load questionnaire configuration on mount
  useEffect(() => {
    const loadQuestionnaireConfig = async () => {
      try {
        const config = await revueFiscalService.getDefaultQuestionnaire();
        console.log('Loaded questionnaire config from backend:', config);

        // Check if we have a complete questionnaire (at least 16 sections)
        if (config.sections && config.sections.length >= 16) {
          setQuestionnaireConfig(config);
          // Convert to Section format
          const sections: Section[] = config.sections.map(s => ({
            id: s.id,
            number: s.number,
            title: s.title,
            subsections: s.subsections.map(ss => ({
              id: ss.id,
              title: ss.title,
              badge: ss.badge,
              info: ss.info,
              questions: ss.questions,
            })),
          }));
          setQuestionnaireSections(sections);
        } else {
          console.log('Backend questionnaire incomplete, using local SECTIONS');
          // If backend doesn't have complete data, use the full local SECTIONS
          setQuestionnaireSections(SECTIONS);
        }
      } catch (err: any) {
        console.error("Error loading questionnaire config:", err);
        // If loading fails, use the default SECTIONS
        setQuestionnaireSections(SECTIONS);
      }
    };
    loadQuestionnaireConfig();
  }, []);

  // When entering questionnaire view, ensure we have the config loaded
  useEffect(() => {
    if (view === "questionnaire" && !questionnaireConfig) {
      const loadQuestionnaireConfig = async () => {
        try {
          const config = await revueFiscalService.getDefaultQuestionnaire();
          setQuestionnaireConfig(config);
        } catch (err: any) {
          console.error("Error loading questionnaire config:", err);
          // Create a default config if loading fails
          setQuestionnaireConfig({
            id: "default",
            name: "Default Questionnaire",
            sections: questionnaireSections,
          });
        }
      };
      loadQuestionnaireConfig();
    }
  }, [view, questionnaireConfig]);

  const company = companies.find((c) => c.id === activeId);
  const cs = activeId ? (states[activeId] ?? {}) : {};
  const getQS = (id: string) => cs[id] ?? defQS();

  // Save questionnaire configuration
  const saveQuestionnaire = async () => {
    try {
      setSaving(true);
      setError(null);

      // Use existing config ID or default
      const configId = questionnaireConfig?.id || "default";
      const configName = questionnaireConfig?.name || "Default Questionnaire";

      // Convert sections back to QuestionnaireConfig format
      const configToSave: QuestionnaireConfig = {
        id: configId,
        name: configName,
        sections: questionnaireSections.map(s => ({
          id: s.id,
          number: s.number,
          title: s.title,
          subsections: s.subsections.map(ss => ({
            id: ss.id,
            title: ss.title,
            badge: ss.badge,
            info: ss.info,
            questions: ss.questions,
          })),
        })),
      };

      console.log('Saving questionnaire config:', configToSave);
      await revueFiscalService.updateQuestionnaire(configId, configToSave);
      setIsEditingQuestionnaire(false);
      setView("companies");
      setQuestionnaireConfig(null); // Reset to reload fresh data next time
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde du questionnaire");
      console.error("Error saving questionnaire:", err);
    } finally {
      setSaving(false);
    }
  };
  const setQS = async (id: string, p: Partial<QuestionState>) => {
    if (!activeId) return;

    const currentState = getQS(id);
    const updatedState = { ...currentState, ...p };

    // Update local state immediately for UI responsiveness
    setStates((prev) => ({
      ...prev,
      [activeId]: { ...(prev[activeId] ?? {}), [id]: updatedState },
    }));

    // Save to API
    try {
      await revueFiscalService.updateQuestionState({
        companyId: activeId,
        questionId: id,
        eval: updatedState.eval || undefined,
        note: updatedState.note,
        renvoi: updatedState.renvoi,
        priority: updatedState.priority,
      });
    } catch (err: any) {
      console.error("Error saving question state:", err);
      // Revert local state on error
      setStates((prev) => ({
        ...prev,
        [activeId]: { ...(prev[activeId] ?? {}), [id]: currentState },
      }));
      setError(err.message || "Erreur lors de la sauvegarde");
    }
  };

  const createCompany = async () => {
    if (!draft.name) return;

    try {
      setSaving(true);
      setError(null);

      const newCompany = await revueFiscalService.createCompany({
        name: draft.name,
        sector: draft.sector,
        exercice: draft.exercice,
        reviseur: draft.reviseur,
        chef: draft.chef,
        niu: draft.niu,
      });

      // Convert to local format
      const companyWithStates: RevueFiscalCompanyWithStates = {
        ...newCompany,
        sector: newCompany.sector || "",
        exercice: newCompany.exercice || "",
        reviseur: newCompany.reviseur || "",
        chef: newCompany.chef || "",
        niu: newCompany.niu || "",
        questionStates: [],
      };

      setCompanies((p) => [...p, companyWithStates]);
      setStates((prev) => ({ ...prev, [newCompany.id]: {} }));

      setDraft({});
      setShowModal(false);
      setActiveId(newCompany.id);
      setActiveSec("s00");
      setView("review");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'entreprise");
      console.error("Error creating company:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f2f1ed",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 16 }}>Chargement...</div>
          <div style={{ width: 40, height: 40, border: "4px solid #e0dfd8", borderTop: "4px solid #E85D04", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f2f1ed",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 18, color: "#b91c1c", marginBottom: 16 }}>Erreur</div>
          <div style={{ color: "#666", marginBottom: 20 }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#E85D04",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  if (view === "companies") {
    return (
      <CompaniesView
        companies={companies}
        states={states}
        onOpen={(id: SetStateAction<string | null>) => {
          setActiveId(id);
          setActiveSec("s00");
          setView("review");
        }}
        onPlan={(id: SetStateAction<string | null>) => {
          setActiveId(id);
          setView("plan");
        }}
        onNew={() => setShowModal(true)}
        showModal={showModal}
        draft={draft}
        setDraft={setDraft}
        onCreate={createCompany}
        saving={saving}
        onCloseModal={() => {
          setShowModal(false);
          setDraft({});
        }}
        isEditingQuestionnaire={isEditingQuestionnaire}
        setIsEditingQuestionnaire={setIsEditingQuestionnaire}
        setView={setView}
      />
    );
  }
  if (view === "questionnaire") {
    return (
      <QuestionnaireEditView
        questionnaireSections={questionnaireSections}
        setQuestionnaireSections={setQuestionnaireSections}
        onSave={saveQuestionnaire}
        onCancel={() => {
          setIsEditingQuestionnaire(false);
          setView("companies");
          setQuestionnaireConfig(null);
          setQuestionnaireSections(SECTIONS); // Reset to original
        }}
        saving={saving}
      />
    );
  }
  if (view === "plan" && company) {
    return (
      <PlanView
        company={company}
        cs={cs}
        stats={getStats(company.id, states)}
        filter={planFilter}
        setFilter={setPlanFilter}
        onBack={() => setView("companies")}
        onReview={() => {
          setActiveSec("s00");
          setView("review");
        }}
      />
    );
  }
  return (
    <ReviewView
      company={company!}
      activeSec={activeSec}
      setActiveSec={setActiveSec}
      getQS={getQS}
      setQS={setQS}
      stats={getStats(company?.id ?? "", states)}
      cs={cs}
      onBack={() => setView("companies")}
      onPlan={() => setView("plan")}
      questionnaireSections={questionnaireSections}
      isEditingQuestionnaire={isEditingQuestionnaire}
    />
  );
}

// ─────────────────────────────────────────────
function CompaniesView({
  companies,
  states,
  onOpen,
  onPlan,
  onNew,
  showModal,
  draft,
  setDraft,
  onCreate,
  saving,
  onCloseModal,
  isEditingQuestionnaire,
  setIsEditingQuestionnaire,
  setView,
}: any) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`}</style>
      {/* NAV */}
      <nav
        style={{
          background: "#111",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "#E85D04",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 15,
              color: "#fff",
              letterSpacing: "0.02em",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            RF
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: "-0.02em",
              }}
            >
              Revue Fiscale
            </div>
            <div
              style={{
                color: "#555",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              CGI 2026 — Loi N°2025/012
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onNew}
            style={{
              background: "#E85D04",
              color: "#fff",
              border: "none",
              padding: "11px 26px",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, marginTop: -1 }}>+</span>{" "}
            Nouvelle mission
          </button>
          <button
            onClick={() => {
              setIsEditingQuestionnaire(true);
              setView("questionnaire");
            }}
            style={{
              background: isEditingQuestionnaire ? "#d32f2f" : "#2e7d32",
              color: "#fff",
              border: "none",
              padding: "11px 26px",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>✏️</span>{" "}
            {isEditingQuestionnaire ? "Annuler l'édition" : "Éditer le questionnaire"}
          </button>
        </div>
      </nav>

      <div style={{ padding: "44px 48px", maxWidth: 1200, margin: "0 auto" }}>
        {companies.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 100,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: "#e8e7e3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                marginBottom: 24,
              }}
            >
              📋
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#111",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Aucune mission en cours
            </div>
            <div
              style={{
                color: "#999",
                fontSize: 14,
                marginBottom: 32,
                textAlign: "center",
                maxWidth: 400,
              }}
            >
              Commencez par créer une mission de revue fiscale pour une
              entreprise.
            </div>
            <button
              onClick={onNew}
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                padding: "14px 36px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Créer une mission →
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: 32,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#111",
                    letterSpacing: "-0.03em",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  Tableau de bord
                </h1>
                <p
                  style={{
                    color: "#888",
                    fontSize: 14,
                    marginTop: 6,
                    margin: "6px 0 0",
                  }}
                >
                  {companies.length} mission{companies.length > 1 ? "s" : ""} de
                  revue — Exercice 2026
                </p>
              </div>
            </div>
            {/* Summary strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 32,
              }}
            >
              {[
                { label: "Missions", val: companies.length, color: "#111" },
                {
                  label: "Total anomalies",
                  val: companies.reduce(
                    (a: number, c: { id: string; }) => a + getStats(c.id, states).anomalies,
                    0,
                  ),
                  color: "#b91c1c",
                },
                {
                  label: "Erreurs matérielles",
                  val: companies.reduce(
                    (a: number, c: { id: string; }) => a + getStats(c.id, states).erreurs,
                    0,
                  ),
                  color: "#c2410c",
                },
                {
                  label: "Points conformes",
                  val: companies.reduce(
                    (a: number, c: { id: string; }) => a + getStats(c.id, states).ok,
                    0,
                  ),
                  color: "#15803d",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0dfd8",
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: s.color,
                      lineHeight: 1,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#888",
                      marginTop: 5,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))",
                gap: 20,
              }}
            >
              {companies.map((c: Company) => (
                <CompanyCard
                  key={c.id}
                  c={c}
                  s={getStats(c.id, states)}
                  onOpen={() => onOpen(c.id)}
                  onPlan={() => onPlan(c.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 32px 100px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                background: "#111",
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "-0.01em",
                }}
              >
                Nouvelle mission de revue fiscale
              </div>
              <button
                onClick={onCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#555",
                  fontSize: 22,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                {
                  k: "name",
                  l: "Raison sociale *",
                  ph: "Ex: SARL ACME Cameroun",
                },
                { k: "niu", l: "NIU", ph: "Numéro d'Identifiant Unique" },
                {
                  k: "sector",
                  l: "Secteur d'activité",
                  ph: "Commerce, BTP, Services, Industrie...",
                },
                {
                  k: "exercice",
                  l: "Exercice fiscal",
                  ph: "01/01/2025 – 31/12/2025",
                },
                {
                  k: "reviseur",
                  l: "Réviseur fiscal",
                  ph: "Nom complet du réviseur",
                },
                {
                  k: "chef",
                  l: "Chef de mission",
                  ph: "Nom complet du chef de mission",
                },
              ].map((f) => (
                <div key={f.k}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#888",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 5,
                    }}
                  >
                    {f.l}
                  </label>
                  <input
                    value={(draft as any)[f.k] ?? ""}
                    onChange={(e) =>
                      setDraft((p: any) => ({ ...p, [f.k]: e.target.value }))
                    }
                    placeholder={f.ph}
                    style={{
                      width: "100%",
                      border: "1.5px solid #e0dfd8",
                      padding: "10px 12px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#fafaf8",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#E85D04")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0dfd8")}
                  />
                </div>
              ))}
              <button
                onClick={onCreate}
                disabled={!draft.name || saving}
                style={{
                  background: draft.name && !saving ? "#E85D04" : "#e0dfd8",
                  color: draft.name && !saving ? "#fff" : "#bbb",
                  border: "none",
                  padding: "13px",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: draft.name && !saving ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginTop: 4,
                }}
              >
                {saving ? "Création..." : "Créer la mission →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyCard({
  c,
  s,
  onOpen,
  onPlan,
}: {
  c: Company;
  s: ReturnType<typeof getStats>;
  onOpen: () => void;
  onPlan: () => void;
}) {
  const risk: RiskLevel =
    s.anomalies > 5 ? "ELEVE" : s.anomalies > 1 ? "MODERE" : "FAIBLE";
  const rc = {
    FAIBLE: { c: "#15803d", bg: "#f0fdf4" },
    MODERE: { c: "#d97706", bg: "#fffbeb" },
    ELEVE: { c: "#b91c1c", bg: "#fef2f2" },
  }[risk];
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e0dfd8",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#111",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {c.name}
          </div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
            {c.sector || "—"} · {c.exercice || "—"}
          </div>
        </div>
        <div
          style={{
            background: rc.bg,
            border: `1.5px solid ${rc.c}`,
            padding: "4px 10px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: rc.c,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            RISQUE {risk}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>
            Progression
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: s.pct === 100 ? "#15803d" : "#E85D04",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {s.pct}%
          </span>
        </div>
        <div style={{ background: "#f0efe8", height: 5 }}>
          <div
            style={{
              background: s.pct === 100 ? "#15803d" : "#E85D04",
              height: "100%",
              width: `${s.pct}%`,
              transition: "width 0.4s",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            marginTop: 14,
            paddingBottom: 16,
            borderBottom: "1px solid #f0efe8",
          }}
        >
          {[
            { v: s.answered, l: "Renseignées", c: "#111" },
            { v: s.anomalies, l: "Anomalies", c: "#b91c1c" },
            { v: s.erreurs, l: "Err. mat.", c: "#c2410c" },
            { v: s.ok, l: "Conformes", c: "#15803d" },
          ].map((x) => (
            <div
              key={x.l}
              style={{
                textAlign: "center",
                padding: "8px 4px",
                background: "#fafaf7",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: x.c,
                  lineHeight: 1,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {x.v}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: 3,
                }}
              >
                {x.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px 16px", flex: 1 }}>
        {[
          ["NIU", c.niu],
          ["Réviseur", c.reviseur],
          ["Chef de mission", c.chef],
          ["Créée le", c.createdAt],
        ].map(([l, v]) => (
          <div
            key={l as string}
            style={{ display: "flex", gap: 6, marginBottom: 4 }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#bbb",
                minWidth: 110,
                flexShrink: 0,
              }}
            >
              {l as string}
            </span>
            <span style={{ fontSize: 11, color: "#444", fontWeight: 600 }}>
              {(v as string) || "—"}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1.5px solid #e0dfd8",
        }}
      >
        <button
          onClick={onOpen}
          style={{
            padding: "13px 8px",
            background: "#111",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "inherit",
            borderRight: "1px solid #1c1c1c",
          }}
        >
          ▶ Questionnaire
        </button>
        <button
          onClick={onPlan}
          style={{
            padding: "13px 8px",
            background: "#E85D04",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "inherit",
          }}
        >
          📋 Plan de travail
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function QuestionnaireEditView({
  questionnaireSections,
  setQuestionnaireSections,
  onSave,
  onCancel,
  saving,
}: {
  questionnaireSections: Section[];
  setQuestionnaireSections: (sections: Section[]) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* NAV */}
      <nav
        style={{
          background: "#111",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "#E85D04",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 15,
              color: "#fff",
              letterSpacing: "0.02em",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            RF
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: "-0.02em",
              }}
            >
              Édition du Questionnaire
            </div>
            <div
              style={{
                color: "#555",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Configuration des sections
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              padding: "11px 26px",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ❌ Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              background: saving ? "#666" : "#2e7d32",
              color: "#fff",
              border: "none",
              padding: "11px 26px",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: saving ? 0.6 : 1,
            }}
          >
            💾 Sauvegarder
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ padding: "44px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111", marginBottom: 8 }}>
            Configuration du Questionnaire
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: 16 }}>
            Modifiez les libellés des sections, sous-sections et questions selon vos besoins.
          </p>
        </div>

        {questionnaireSections.map((section, sectionIndex) => (
          <div key={section.id} style={{ marginBottom: 48 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#E85D04",
                    fontFamily: "'DM Mono',monospace",
                    minWidth: 32,
                  }}
                >
                  {section.number}
                </span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setQuestionnaireSections(
                      questionnaireSections.map((sec, idx) =>
                        idx === sectionIndex ? { ...sec, title: newTitle } : sec
                      )
                    );
                  }}
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111",
                    border: "2px solid transparent",
                    background: "transparent",
                    outline: "none",
                    padding: "4px 8px",
                    borderRadius: 4,
                    flex: 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "2px solid #E85D04";
                    e.target.style.background = "#f5f5f5";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "2px solid transparent";
                    e.target.style.background = "transparent";
                  }}
                />
              </div>
            </div>

            {section.subsections.map((subsection, subIndex) => (
              <div
                key={subsection.id}
                style={{
                  marginLeft: 44,
                  marginBottom: 24,
                  padding: 20,
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    value={subsection.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setQuestionnaireSections(
                        questionnaireSections.map((sec, secIdx) =>
                          secIdx === sectionIndex
                            ? {
                                ...sec,
                                subsections: sec.subsections.map((sub, subIdx) =>
                                  subIdx === subIndex ? { ...sub, title: newTitle } : sub
                                ),
                              }
                            : sec
                        )
                      );
                    }}
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111",
                      border: "2px solid transparent",
                      background: "transparent",
                      outline: "none",
                      padding: "4px 8px",
                      borderRadius: 4,
                      width: "100%",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "2px solid #E85D04";
                      e.target.style.background = "#f5f5f5";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "2px solid transparent";
                      e.target.style.background = "transparent";
                    }}
                  />
                </div>

                {subsection.questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      background: "#f9f9f7",
                      borderRadius: 6,
                      border: "1px solid #e8e8e8",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#888",
                          fontFamily: "'DM Mono',monospace",
                          marginTop: 2,
                          minWidth: 60,
                        }}
                      >
                        {question.id}
                      </span>
                      <textarea
                        value={question.text}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setQuestionnaireSections(
                            questionnaireSections.map((sec, secIdx) =>
                              secIdx === sectionIndex
                                ? {
                                    ...sec,
                                    subsections: sec.subsections.map((sub, subIdx) =>
                                      subIdx === subIndex
                                        ? {
                                            ...sub,
                                            questions: sub.questions.map((q, qIdx) =>
                                              qIdx === qIndex ? { ...q, text: newText } : q
                                            ),
                                          }
                                        : sub
                                    ),
                                  }
                                : sec
                            )
                          );
                        }}
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: "#111",
                          border: "1px solid transparent",
                          background: "transparent",
                          outline: "none",
                          padding: "4px 8px",
                          borderRadius: 4,
                          resize: "vertical",
                          minHeight: "40px",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => {
                          e.target.style.border = "1px solid #E85D04";
                          e.target.style.background = "#fff";
                        }}
                        onBlur={(e) => {
                          e.target.style.border = "1px solid transparent";
                          e.target.style.background = "transparent";
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Add Question Button */}
                <button
                  onClick={() => {
                    const nextQuestionNumber = subsection.questions.length + 1;
                    const newQuestionId = `${subsection.id}.${String(nextQuestionNumber).padStart(2, '0')}`;
                    const newQuestion = {
                      id: newQuestionId,
                      text: "Nouvelle question",
                      isNew2026: false,
                      ref: null,
                    };
                    setQuestionnaireSections(
                      questionnaireSections.map((sec, secIdx) =>
                        secIdx === sectionIndex
                          ? {
                              ...sec,
                              subsections: sec.subsections.map((sub, subIdx) =>
                                subIdx === subIndex
                                  ? {
                                      ...sub,
                                      questions: [...sub.questions, newQuestion],
                                    }
                                  : sub
                              ),
                            }
                          : sec
                      )
                    );
                  }}
                  style={{
                    background: "#f3e5f5",
                    border: "2px dashed #9c27b0",
                    color: "#7b1fa2",
                    padding: "8px 16px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  ➕ Ajouter une question
                </button>
              </div>
            ))}

            {/* Add Subsection Button */}
            <div style={{ marginLeft: 44, marginBottom: 24 }}>
              <button
                onClick={() => {
                  const newSubsectionId = `s${section.id}-${section.subsections.length + 1}`;
                  const newSubsection = {
                    id: newSubsectionId,
                    title: "Nouvelle sous-section",
                    badge: null,
                    info: null,
                    questions: [],
                  };
                  setQuestionnaireSections(
                    questionnaireSections.map((sec, idx) =>
                      idx === sectionIndex
                        ? { ...sec, subsections: [...sec.subsections, newSubsection] }
                        : sec
                    )
                  );
                }}
                style={{
                  background: "#e8f5e8",
                  border: "2px dashed #4caf50",
                  color: "#2e7d32",
                  padding: "12px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                ➕ Ajouter une sous-section
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function ReviewView({
  company,
  activeSec,
  setActiveSec,
  getQS,
  setQS,
  stats,
  cs,
  onBack,
  onPlan,
  questionnaireSections,
  isEditingQuestionnaire,
}: any) {
  const sec = questionnaireSections.find((s) => s.id === activeSec) ?? questionnaireSections[0];
  const secStats = useMemo(() => {
    const ids: string[] = [];
    sec.subsections.forEach((sub) =>
      sub.questions.forEach((q) => ids.push(q.id)),
    );
    return {
      total: ids.length,
      done: ids.filter((id) => cs[id]?.eval != null).length,
    };
  }, [sec, cs]);

  const secPct = (s: Section) => {
    const ids: string[] = [];
    s.subsections.forEach((sub) =>
      sub.questions.forEach((q) => ids.push(q.id)),
    );
    const done = ids.filter((id) => cs[id]?.eval != null).length;
    return ids.length ? Math.round((done / ids.length) * 100) : 0;
  };
  const secAlert = (s: Section) => {
    const ids: string[] = [];
    s.subsections.forEach((sub) =>
      sub.questions.forEach((q) => ids.push(q.id)),
    );
    return ids.some(
      (id) => cs[id]?.eval === "ANOMALIE" || cs[id]?.eval === "ERR_MAT",
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* SIDEBAR */}
      <aside
        style={{
          width: 264,
          background: "#111",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Company */}
        <div
          style={{
            padding: "18px 18px 16px",
            borderBottom: "1px solid #1e1e1e",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontSize: 10,
              cursor: "pointer",
              padding: 0,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "inherit",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← Accueil
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: "#E85D04",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 15,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {company.name.charAt(0)}
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1.25,
                }}
              >
                {company.name}
              </div>
              <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>
                {company.exercice || "Exercice —"}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Avancement global
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#E85D04",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {stats.pct}%
              </span>
            </div>
            <div style={{ background: "#1e1e1e", height: 4 }}>
              <div
                style={{
                  background: "#E85D04",
                  height: "100%",
                  width: `${stats.pct}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  color: "#b91c1c",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ✕ {stats.anomalies}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#c2410c",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ! {stats.erreurs}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#15803d",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ✓ {stats.ok}
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {console.log('Rendering sections:', questionnaireSections.length, questionnaireSections.map(s => ({id: s.id, title: s.title, subsectionsCount: s.subsections?.length})))}
          {questionnaireSections.map((s, index) => {
            console.log(`Rendering section ${index}: ${s.id} - ${s.title}`);
            try {
              const isActive = s.id === activeSec;
              const pct = secPct(s);
              const alert = secAlert(s);
              console.log(`Section ${s.id} - pct: ${pct}, alert: ${alert}`);
              return (
              <button
                key={s.id}
                onClick={() => setActiveSec(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "9px 14px",
                  background: isActive ? "#1a1a1a" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#E85D04" : "transparent"}`,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 8,
                  transition: "background 0.1s",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: isActive ? "#E85D04" : "#3a3a3a",
                    minWidth: 22,
                    fontFamily: "'DM Mono',monospace",
                  }}
                >
                  {s.number}
                </span>
                {isEditingQuestionnaire ? (
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setQuestionnaireSections(prev =>
                        prev.map(sec =>
                          sec.id === s.id ? { ...sec, title: newTitle } : sec
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: isActive ? "#fff" : "#666",
                      lineHeight: 1.3,
                      fontFamily: "inherit",
                      background: "transparent",
                      border: "1px solid transparent",
                      outline: "none",
                      padding: "2px 4px",
                      borderRadius: 3,
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid #E85D04";
                      e.target.style.background = isActive ? "#333" : "#f5f5f5";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid transparent";
                      e.target.style.background = "transparent";
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: isActive ? "#fff" : "#666",
                      lineHeight: 1.3,
                      fontFamily: "inherit",
                    }}
                  >
                    {s.title}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {alert && (
                    <span style={{ fontSize: 8, color: "#ef4444" }}>●</span>
                  )}
                  {pct > 0 && (
                    <span
                      style={{
                        fontSize: 9,
                        color: pct === 100 ? "#22c55e" : "#444",
                        fontWeight: 700,
                        fontFamily: "'DM Mono',monospace",
                      }}
                    >
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
            } catch (error) {
              console.error('Error rendering section', s.id, error);
              return null; // Skip this section
            }
          })}
        </div>

        {isEditingQuestionnaire && (
          <div style={{ padding: 14, borderTop: "1px solid #1a1a1a", display: "flex", gap: 8 }}>
            <button
              onClick={saveQuestionnaire}
              disabled={saving}
              style={{
                flex: 1,
                background: "#2e7d32",
                color: "#fff",
                border: "none",
                padding: "11px",
                fontWeight: 800,
                fontSize: 11,
                cursor: saving ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "inherit",
                opacity: saving ? 0.6 : 1,
              }}
            >
              💾 Sauvegarder
            </button>
            <button
              onClick={() => {
                setIsEditingQuestionnaire(false);
                setQuestionnaireConfig(null);
                setQuestionnaireSections(SECTIONS); // Reset to original
              }}
              disabled={saving}
              style={{
                flex: 1,
                background: "#d32f2f",
                color: "#fff",
                border: "none",
                padding: "11px",
                fontWeight: 800,
                fontSize: 11,
                cursor: saving ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "inherit",
                opacity: saving ? 0.6 : 1,
              }}
            >
              ❌ Annuler
            </button>
          </div>
        )}

        <div style={{ padding: 14, borderTop: "1px solid #1a1a1a" }}>
          <button
            onClick={onPlan}
            style={{
              width: "100%",
              background: "#E85D04",
              color: "#fff",
              border: "none",
              padding: "11px",
              fontWeight: 800,
              fontSize: 11,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "inherit",
            }}
          >
            📋 Plan de travail
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "2px solid #111",
            padding: "0 28px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                background: "#E85D04",
                color: "#fff",
                fontWeight: 900,
                fontSize: 12,
                padding: "5px 11px",
                letterSpacing: "0.06em",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              §{sec.number}
            </span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              {sec.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "#999" }}>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    secStats.done === secStats.total && secStats.done > 0
                      ? "#15803d"
                      : "#111",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {secStats.done}
              </span>
              <span style={{ color: "#ccc" }}> / </span>
              <span style={{ fontFamily: "'DM Mono',monospace" }}>
                {secStats.total}
              </span>
              <span style={{ marginLeft: 4 }}>questions</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {sec.subsections.map((sub) => (
            <SubBlock
              key={sub.id}
              sub={sub}
              getQS={getQS}
              setQS={setQS}
              cs={cs}
              isEditingQuestionnaire={isEditingQuestionnaire}
              onUpdateSubsection={(sectionId, subsectionId, updates) => {
                setQuestionnaireSections(prev =>
                  prev.map(sec =>
                    sec.id === sectionId
                      ? {
                          ...sec,
                          subsections: sec.subsections.map(sub =>
                            sub.id === subsectionId ? { ...sub, ...updates } : sub
                          )
                        }
                      : sec
                  )
                );
              }}
              sectionId={sec.id}
            />
          ))}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

function SubBlock({
  sub,
  getQS,
  setQS,
  cs,
  isEditingQuestionnaire,
  onUpdateSubsection,
  sectionId,
}: {
  sub: SubSection;
  getQS: any;
  setQS: any;
  cs: any;
  isEditingQuestionnaire?: boolean;
  onUpdateSubsection?: (sectionId: string, subsectionId: string, updates: Partial<SubSection>) => void;
  sectionId?: string;
}) {
  const [open, setOpen] = useState(true);
  const alerts = sub.questions.filter((q) => {
    const e = cs[q.id]?.eval;
    return e === "ANOMALIE" || e === "ERR_MAT";
  }).length;
  return (
    <div
      style={{
        marginBottom: 14,
        border: "1.5px solid #e0dfd8",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 18px",
          cursor: "pointer",
          background: "#fafaf7",
          borderBottom: open ? "1.5px solid #e0dfd8" : "none",
          userSelect: "none",
        }}
      >
        <span
          style={{
            color: open ? "#E85D04" : "#ccc",
            fontSize: 10,
            fontWeight: 700,
            transition: "transform 0.2s",
            display: "inline-block",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          ▼
        </span>
        {isEditingQuestionnaire ? (
          <input
            type="text"
            value={sub.title}
            onChange={(e) => {
              if (onUpdateSubsection && sectionId) {
                onUpdateSubsection(sectionId, sub.id, { title: e.target.value });
              }
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontWeight: 800,
              fontSize: 13,
              color: "#111",
              flex: 1,
              background: "transparent",
              border: "1px solid transparent",
              outline: "none",
              padding: "2px 4px",
              borderRadius: 3,
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #E85D04";
              e.target.style.background = "#f5f5f5";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid transparent";
              e.target.style.background = "transparent";
            }}
          />
        ) : (
          <span style={{ fontWeight: 800, fontSize: 13, color: "#111", flex: 1 }}>
            {sub.title}
          </span>
        )}
        {sub.badge && (
          <span
            style={{
              background: "#E85D04",
              color: "#fff",
              fontSize: 8,
              fontWeight: 900,
              padding: "2px 7px",
              letterSpacing: "0.1em",
            }}
          >
            {sub.badge}
          </span>
        )}
        {alerts > 0 && (
          <span
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
            }}
          >
            {alerts} {alerts > 1 ? "anomalies" : "anomalie"}
          </span>
        )}
        <span style={{ fontSize: 10, color: "#ccc" }}>
          {sub.questions.length}q
        </span>
      </div>
      {open && (
        <>
          {sub.info && (
            <div
              style={{
                padding: "7px 18px",
                background: "#fffbf5",
                borderBottom: "1px solid #fed7aa",
                fontSize: 11,
                color: "#92400e",
              }}
            >
              ℹ {sub.info}
            </div>
          )}
          {sub.questions.map((q, i) => (
            <QRow
              key={q.id}
              q={q}
              s={getQS(q.id)}
              onChange={(p: any) => setQS(q.id, p)}
              even={i % 2 === 0}
              isEditingQuestionnaire={isEditingQuestionnaire}
              onUpdateQuestion={(sectionId, subsectionId, questionId, updates) => {
                setQuestionnaireSections(prev =>
                  prev.map(sec =>
                    sec.id === sectionId
                      ? {
                          ...sec,
                          subsections: sec.subsections.map(sub =>
                            sub.id === subsectionId
                              ? {
                                  ...sub,
                                  questions: sub.questions.map(q =>
                                    q.id === questionId ? { ...q, ...updates } : q
                                  )
                                }
                              : sub
                          )
                        }
                      : sec
                  )
                );
              }}
              sectionId={sectionId}
              subsectionId={sub.id}
            />
          ))}
        </>
      )}
    </div>
  );
}

function QRow({
  q,
  s,
  onChange,
  even,
  isEditingQuestionnaire,
  onUpdateQuestion,
  sectionId,
  subsectionId,
}: {
  q: Question;
  s: QuestionState;
  onChange: (p: Partial<QuestionState>) => void;
  even: boolean;
  isEditingQuestionnaire?: boolean;
  onUpdateQuestion?: (sectionId: string, subsectionId: string, questionId: string, updates: Partial<Question>) => void;
  sectionId?: string;
  subsectionId?: string;
}) {
  const [noteOpen, setNoteOpen] = useState(!!s.note);
  const conf = s.eval ? EC[s.eval as keyof typeof EC] : null;
  const bls = {
    ANOMALIE: "3px solid #b91c1c",
    ERR_MAT: "3px solid #c2410c",
    OK: "3px solid #15803d",
    NA: "3px solid #6b7280",
  };
  const bgs = {
    ANOMALIE: "#fef8f8",
    ERR_MAT: "#fffaf6",
    OK: "#f7fef9",
    NA: "#f9f9f9",
  };

  return (
    <div
      style={{
        borderBottom: "1px solid #f0efe8",
        borderLeft: s.eval ? bls[s.eval] : "3px solid transparent",
        background: s.eval ? bgs[s.eval] : even ? "#fff" : "#fdfdfb",
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          padding: "11px 18px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            {q.isNew2026 && (
              <span
                style={{
                  background: "#E85D04",
                  color: "#fff",
                  fontSize: 7,
                  fontWeight: 900,
                  padding: "2px 5px",
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                  marginTop: 3,
                  lineHeight: "12px",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                ★ 2026
              </span>
            )}
            {isEditingQuestionnaire ? (
              <textarea
                value={q.text}
                onChange={(e) => {
                  if (onUpdateQuestion && sectionId && subsectionId) {
                    onUpdateQuestion(sectionId, subsectionId, q.id, { text: e.target.value });
                  }
                }}
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#111",
                  lineHeight: 1.6,
                  fontWeight: 500,
                  width: "100%",
                  minHeight: "40px",
                  background: "transparent",
                  border: "1px solid transparent",
                  outline: "none",
                  padding: "2px 4px",
                  borderRadius: 3,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid #E85D04";
                  e.target.style.background = "#f5f5f5";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid transparent";
                  e.target.style.background = "transparent";
                }}
              />
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#111",
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {q.text}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
            <span
              style={{
                fontSize: 9,
                color: "#d0d0cc",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {q.id}
            </span>
            {q.ref && (
              <span
                style={{
                  fontSize: 9,
                  color: "#E85D04",
                  fontWeight: 600,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {q.ref}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            flexShrink: 0,
            alignItems: "flex-end",
          }}
        >
          {/* Eval */}
          <div style={{ display: "flex", gap: 3 }}>
            {(Object.entries(EC) as [string, any][]).map(([code, cfg]) => {
              const active = s.eval === code;
              return (
                <button
                  key={code}
                  onClick={() =>
                    onChange({ eval: active ? null : (code as EvalCode) })
                  }
                  title={cfg.label}
                  style={{
                    height: 30,
                    width: active ? undefined : 30,
                    padding: active ? "0 9px" : "0",
                    background: active ? cfg.color : "#fff",
                    border: `1.5px solid ${cfg.color}`,
                    color: active ? "#fff" : cfg.color,
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: active ? 9 : 13,
                    letterSpacing: "0.04em",
                    fontFamily: "'DM Mono',monospace",
                    transition: "all 0.12s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {active ? cfg.label : cfg.icon}
                </button>
              );
            })}
          </div>
          {/* Meta */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <button
              onClick={() => setNoteOpen((v) => !v)}
              style={{
                padding: "3px 8px",
                fontSize: 9,
                fontWeight: 700,
                background: s.note || noteOpen ? "#111" : "#f2f1ed",
                border:
                  "1.5px solid " + (s.note || noteOpen ? "#111" : "#e0dfd8"),
                cursor: "pointer",
                color: s.note || noteOpen ? "#fff" : "#888",
                fontFamily: "inherit",
                letterSpacing: "0.05em",
              }}
            >
              {s.note ? "✎ Note" : "+ Note"}
            </button>
            <input
              value={s.renvoi}
              onChange={(e) => onChange({ renvoi: e.target.value })}
              placeholder="Réf. feuille"
              style={{
                width: 78,
                border: "1.5px solid #e0dfd8",
                padding: "3px 7px",
                fontSize: 9,
                fontFamily: "'DM Mono',monospace",
                background: "#fafafa",
                color: "#555",
                outline: "none",
              }}
            />
            <select
              value={s.priority}
              onChange={(e) => onChange({ priority: e.target.value as any })}
              style={{
                border: "1.5px solid #e0dfd8",
                padding: "3px 5px",
                fontSize: 9,
                fontFamily: "inherit",
                background: "#fafafa",
                color: "#555",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="haute">🔴 Priorité haute</option>
              <option value="normale">🟡 Normale</option>
              <option value="basse">🟢 Basse</option>
            </select>
          </div>
        </div>
      </div>
      {noteOpen && (
        <div style={{ padding: "0 18px 10px", paddingLeft: 32 }}>
          <textarea
            value={s.note}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Observations, décisions, suggestions, recommandations, références..."
            rows={2}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1.5px solid #e0dfd8",
              padding: "8px 10px",
              fontSize: 12,
              fontFamily: "inherit",
              background: "#fffef8",
              color: "#222",
              outline: "none",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
function PlanView({
  company,
  cs,
  stats,
  filter,
  setFilter,
  onBack,
  onReview,
}: any) {
  const all = useMemo(() => {
    const items: Array<{
      sec: Section;
      sub: SubSection;
      q: Question;
      s: QuestionState;
    }> = [];
    SECTIONS.forEach((sec) =>
      sec.subsections.forEach((sub) =>
        sub.questions.forEach((q) => {
          const st: QuestionState = cs[q.id] ?? defQS();
          if (st.eval !== null) items.push({ sec, sub, q, s: st });
        }),
      ),
    );
    return items;
  }, [cs]);

  const anomalies = all.filter((i) => i.s.eval === "ANOMALIE");
  const erreurs = all.filter((i) => i.s.eval === "ERR_MAT");
  const toAction = all.filter((i) => i.s.eval !== "OK" && i.s.eval !== "NA");
  const display =
    filter === "anomalies"
      ? anomalies
      : filter === "erreurs"
        ? erreurs
        : toAction;
  const priority = all.filter(
    (i) =>
      i.s.priority === "haute" &&
      (i.s.eval === "ANOMALIE" || i.s.eval === "ERR_MAT"),
  );
  const risk: RiskLevel =
    anomalies.length > 5 ? "ELEVE" : anomalies.length > 1 ? "MODERE" : "FAIBLE";
  const rc = {
    FAIBLE: { c: "#15803d", bg: "#f0fdf4", l: "FAIBLE" },
    MODERE: { c: "#d97706", bg: "#fffbeb", l: "MODÉRÉ" },
    ELEVE: { c: "#b91c1c", bg: "#fef2f2", l: "ÉLEVÉ" },
  }[risk];

  // Group by section
  const grouped = useMemo(() => {
    const map: Record<string, typeof display> = {};
    display.forEach((i) => {
      if (!map[i.sec.id]) map[i.sec.id] = [];
      map[i.sec.id].push(i);
    });
    return map;
  }, [display]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f1ed",
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
      @media print { .no-print{display:none!important} body{background:#fff} }`}</style>

      {/* STICKY HEADER */}
      <div
        className="no-print"
        style={{
          background: "#111",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "2px solid #E85D04",
        }}
      >
        <div
          style={{
            padding: "0 40px",
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                color: "#555",
                fontSize: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ← Accueil
            </button>
            <div style={{ color: "#333", fontSize: 16 }}>|</div>
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "-0.01em",
              }}
            >
              Plan de Travail
            </span>
            <div
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                padding: "4px 12px",
              }}
            >
              <span style={{ color: "#E85D04", fontWeight: 700, fontSize: 13 }}>
                {company.name}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onReview}
              style={{
                background: "transparent",
                border: "1px solid #333",
                color: "#888",
                padding: "7px 14px",
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              ← Questionnaire
            </button>
            <button
              onClick={() => window.print()}
              style={{
                background: "#E85D04",
                border: "none",
                color: "#fff",
                padding: "7px 18px",
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "inherit",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              🖨 Imprimer
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "36px 40px", maxWidth: 1060, margin: "0 auto" }}>
        {/* TITLE */}
        <div
          style={{
            background: "#111",
            padding: "28px 32px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                color: "#E85D04",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 10,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              Plan de Travail · Revue Fiscale CGI 2026
            </div>
            <div
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {company.name}
            </div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 8 }}>
              {company.sector && <span>{company.sector} · </span>}
              {company.exercice && <span>Exercice {company.exercice} · </span>}
              {company.niu && (
                <span style={{ fontFamily: "'DM Mono',monospace" }}>
                  NIU: {company.niu}
                </span>
              )}
            </div>
            <div style={{ color: "#444", fontSize: 11, marginTop: 5 }}>
              Réviseur: {company.reviseur || "—"} · Chef de mission:{" "}
              {company.chef || "—"}
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <div
              style={{
                background: rc.bg,
                border: `2px solid ${rc.c}`,
                padding: "14px 20px",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: rc.c,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Risque Global
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: rc.c,
                  lineHeight: 1,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {rc.l}
              </div>
            </div>
            <div
              style={{
                color: "#444",
                fontSize: 9,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>

        {/* KPI ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            {
              l: "Renseignées",
              v: stats.answered,
              sub: `/ ${stats.total}`,
              c: "#111",
            },
            {
              l: "Anomalies",
              v: stats.anomalies,
              sub: "à traiter",
              c: "#b91c1c",
            },
            {
              l: "Err. matérielles",
              v: stats.erreurs,
              sub: "à corriger",
              c: "#c2410c",
            },
            { l: "Conformes", v: stats.ok, sub: "O.K.", c: "#15803d" },
            { l: "N. applicables", v: stats.na, sub: "N.A.", c: "#6b7280" },
          ].map((x) => (
            <div
              key={x.l}
              style={{
                background: "#fff",
                border: "1.5px solid #e0dfd8",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: x.c,
                  lineHeight: 1,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {x.v}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#999",
                  marginTop: 5,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {x.l}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: x.c,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {x.sub}
              </div>
            </div>
          ))}
        </div>

        {/* PRIORITY BLOCK */}
        {priority.length > 0 && (
          <div
            style={{
              border: "2px solid #E85D04",
              background: "#fff",
              marginBottom: 24,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#E85D04",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                🔴 Actions Prioritaires — {priority.length} point
                {priority.length > 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ padding: "4px 0" }}>
              {priority.map((item) => {
                const cfg = EC[item.s.eval as keyof typeof EC];
                return (
                  <div
                    key={item.q.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px 18px",
                      borderBottom: "1px solid #f8f8f6",
                      borderLeft: `4px solid ${cfg.color}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "2px 6px",
                        background: cfg.color,
                        color: "#fff",
                        flexShrink: 0,
                        marginTop: 3,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {cfg.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.q.text}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bbb",
                          marginTop: 2,
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        {item.q.id} · {item.sub.title}
                      </div>
                      {item.s.note && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#92400e",
                            marginTop: 5,
                            background: "#fffbf0",
                            padding: "6px 8px",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          "{item.s.note}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTER TABS */}
        <div
          className="no-print"
          style={{
            display: "flex",
            marginBottom: 18,
            border: "1.5px solid #e0dfd8",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          {(
            [
              { k: "all", l: `Points à traiter (${toAction.length})` },
              { k: "anomalies", l: `Anomalies (${anomalies.length})` },
              { k: "erreurs", l: `Erreurs matérielles (${erreurs.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              style={{
                flex: 1,
                padding: "11px 14px",
                border: "none",
                cursor: "pointer",
                background: filter === t.k ? "#111" : "transparent",
                color: filter === t.k ? "#fff" : "#777",
                fontWeight: 700,
                fontSize: 11,
                fontFamily: "inherit",
                borderRight: "1px solid #e0dfd8",
                letterSpacing: "0.02em",
              }}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* GROUPED ITEMS */}
        {Object.keys(grouped).length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e0dfd8",
              padding: 56,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#15803d" }}>
              Aucun point à signaler
            </div>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
              Tous les points renseignés sont conformes dans cette catégorie.
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([sid, items]) => {
            const sec = items[0].sec;
            return (
              <div key={sid} style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: "#111",
                      color: "#E85D04",
                      fontWeight: 900,
                      fontSize: 11,
                      padding: "4px 10px",
                      letterSpacing: "0.06em",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    §{sec.number}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#111",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {sec.title}
                  </span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>
                    — {items.length} point{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0dfd8",
                    overflow: "hidden",
                  }}
                >
                  {(items as any[]).map((item: any, idx: number) => {
                    const cfg = EC[item.s.eval as keyof typeof EC];
                    const pc =
                      item.s.priority === "haute"
                        ? "#b91c1c"
                        : item.s.priority === "normale"
                          ? "#d97706"
                          : "#6b7280";
                    return (
                      <div
                        key={item.q.id}
                        style={{
                          display: "flex",
                          borderBottom:
                            idx < items.length - 1
                              ? "1px solid #f0efe8"
                              : "none",
                          borderLeft: `4px solid ${cfg.color}`,
                        }}
                      >
                        <div
                          style={{
                            width: 82,
                            background: cfg.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "12px 6px",
                            flexShrink: 0,
                            borderRight: "1px solid #f0efe8",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              fontWeight: 900,
                              color: cfg.color,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              textAlign: "center",
                              lineHeight: 1.5,
                              fontFamily: "'DM Mono',monospace",
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ flex: 1, padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#111",
                                  lineHeight: 1.55,
                                }}
                              >
                                {item.q.text}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginTop: 4,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 9,
                                    color: "#d0d0cc",
                                    fontFamily: "'DM Mono',monospace",
                                  }}
                                >
                                  {item.q.id}
                                </span>
                                <span style={{ fontSize: 9, color: "#bbb" }}>
                                  ·
                                </span>
                                <span style={{ fontSize: 9, color: "#999" }}>
                                  {item.sub.title}
                                </span>
                                {item.q.ref && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      color: "#E85D04",
                                      fontWeight: 600,
                                      fontFamily: "'DM Mono',monospace",
                                    }}
                                  >
                                    {item.q.ref}
                                  </span>
                                )}
                                {item.q.isNew2026 && (
                                  <span
                                    style={{
                                      background: "#E85D04",
                                      color: "#fff",
                                      fontSize: 7,
                                      fontWeight: 900,
                                      padding: "1px 4px",
                                      fontFamily: "'DM Mono',monospace",
                                    }}
                                  >
                                    ★ 2026
                                  </span>
                                )}
                              </div>
                              {item.s.note && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    padding: "7px 10px",
                                    background: "#fffef6",
                                    border: "1px solid #f0ede0",
                                    fontSize: 12,
                                    color: "#555",
                                    fontStyle: "italic",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  📝 {item.s.note}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                flexShrink: 0,
                                alignItems: "flex-end",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 8,
                                  fontWeight: 800,
                                  color: pc,
                                  padding: "2px 7px",
                                  border: `1px solid ${pc}`,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.07em",
                                  fontFamily: "'DM Mono',monospace",
                                }}
                              >
                                {item.s.priority === "haute"
                                  ? "🔴 Haute"
                                  : item.s.priority === "normale"
                                    ? "🟡 Normale"
                                    : "🟢 Basse"}
                              </span>
                              {item.s.renvoi && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    color: "#aaa",
                                    fontFamily: "'DM Mono',monospace",
                                  }}
                                >
                                  📄 {item.s.renvoi}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* SIGNATURE */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e0dfd8",
            padding: "22px 28px",
            marginTop: 28,
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #f0efe8",
              paddingBottom: 14,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: "#111",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Visas et signatures
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 28,
            }}
          >
            {[
              { r: "Réviseur fiscal", n: company.reviseur },
              { r: "Chef de mission", n: company.chef },
              { r: "Visa direction", n: "" },
            ].map((sg) => (
              <div key={sg.r}>
                <div
                  style={{
                    fontSize: 9,
                    color: "#aaa",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  {sg.r}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 24,
                  }}
                >
                  {sg.n || "—"}
                </div>
                <div style={{ borderTop: "1.5px solid #111", paddingTop: 5 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#ccc",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Signature · Date
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 9,
            color: "#ccc",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          Loi N°2025/012 du 17 décembre 2025 portant CGI 2026 — République du
          Cameroun
        </div>
      </div>
    </div>
  );
}
