# NeoTravel — Agent IA Backend

Agent conversationnel développé avec le **Vercel AI SDK** permettant d'automatiser le processus commercial de NeoTravel :

- qualification des prospects ;
- génération automatique de devis ;
- création des leads dans Airtable ;
- génération du devis PDF ;
- envoi automatique par email ;
- mise à jour du pipeline commercial.

---

# Sommaire

- Présentation
- Fonctionnalités
- Stack technique
- Architecture
- Installation
- Variables d'environnement
- Lancement
- Tests
- Structure du projet
- Fonctionnement de l'agent
- Outils disponibles
- Pipeline commercial
- Pricing
- Déploiement
- Développement
- Observabilité
- Limitations
- Évolutions prévues

---

# Présentation

Ce projet implémente un agent IA chargé d'automatiser tout le cycle commercial de NeoTravel.

L'objectif est de garantir que chaque devis soit :

- cohérent ;
- reproductible ;
- traçable ;
- calculé de manière déterministe.

L'agent n'effectue jamais de calcul de prix lui-même.

Toutes les opérations métier sont déléguées à des outils spécialisés.

---

# Fonctionnalités

✅ Qualification conversationnelle

✅ Collecte des informations du voyage

✅ Création automatique du Lead

✅ Calcul automatique du devis

✅ Génération du PDF

✅ Envoi du devis par email

✅ Mise à jour du pipeline

✅ Escalade vers un humain si nécessaire

---

# Stack technique

| Technologie | Rôle |
|-------------|------|
| Next.js App Router | Backend |
| TypeScript | Langage |
| Vercel AI SDK | Agent IA |
| OpenAI / Gemini | LLM |
| Airtable | CRM |
| Resend | Emails |
| Vitest | Tests |

---

# Architecture générale

```
Prospect
    │
    ▼
Chat UI
    │
    ▼
API /api/chat
    │
    ▼
Agent IA
    │
    ├── save_lead
    ├── call_calculer_devis
    ├── generate_pdf
    ├── send_email
    ├── update_status
    └── escalate
```

---

# Installation

## Prérequis

- Node.js 20 LTS recommandé
- npm
- Compte Airtable
- Compte Resend
- Clé OpenAI ou Gemini

## Installation

```bash
git clone <repo>

cd neotravel-agent

npm install
```

Créer ensuite le fichier :

```bash
cp .env.example .env.local
```

---

# Variables d'environnement

```env
OPENAI_API_KEY=

GOOGLE_GENERATIVE_AI_API_KEY=

AIRTABLE_API_KEY=

AIRTABLE_BASE_ID=

RESEND_API_KEY=

EMAIL_FROM=

INTERNAL_ALERT_EMAIL=
```

Au moins une clé LLM est nécessaire.

---

# Lancement

```bash
npm run dev
```

API disponible sur

```
http://localhost:3000/api/chat
```

---

# Test rapide

```bash
curl -X POST http://localhost:3000/api/chat \
-H "Content-Type: application/json" \
-d '{"messages":[{"role":"user","content":"Bonjour"}]}'
```

---

# Tests

Lancer tous les tests :

```bash
npm test
```

Mode watch :

```bash
npm run test:watch
```

---

# Structure du projet

```
app/
└── api/
    └── chat/
        └── route.ts

lib/
├── airtable.ts
├── pricing.ts
├── fallback_parser.ts
├── system_prompt.ts
└── tools/
    ├── save_lead.ts
    ├── call_calculer_devis.ts
    ├── generate_pdf.ts
    ├── send_email.ts
    ├── update_status.ts
    └── escalate.ts

tests/
types/
```

---

# Fonctionnement

L'agent suit toujours le même workflow :

1. Comprendre la demande
2. Extraire les informations
3. Sauvegarder le lead
4. Calculer le devis
5. Générer le PDF
6. Envoyer le mail
7. Mettre à jour le pipeline

---

# Outils disponibles

| Outil | Description |
|--------|-------------|
| save_lead | Création du prospect |
| call_calculer_devis | Calcul du prix |
| generate_pdf | Génération du devis |
| send_email | Envoi email |
| update_status | Mise à jour CRM |
| escalate | Escalade humaine |

---

# Pricing

⚠️ Règle importante :

Le LLM ne calcule jamais un prix.

Le calcul est exclusivement réalisé par :

```
call_calculer_devis
```

Le moteur actuel utilise un stub qui sera remplacé par le moteur de pricing complet.

---

# Pipeline commercial

Le pipeline comporte plusieurs statuts :

- Nouveau
- Incomplet
- Qualifié
- Devis envoyé
- Relance 1
- Relance 2
- Accepté
- Refusé
- Cas complexe
- Clôturé

---

# Développement

## Ajouter un nouvel outil

1. Créer le fichier dans :

```
lib/tools/
```

2. Exporter l'outil.

3. Ajouter l'import dans

```
tools/index.ts
```

---

## Remplacer le moteur de pricing

Lorsque le moteur définitif est disponible :

```ts
import { calculer_devis } from "@/lib/pricing";
```

à la place de :

```ts
calculer_devis_stub()
```

---

# Observabilité

Chaque exécution de l'agent doit produire des logs permettant de tracer :

- les appels outils ;
- les erreurs ;
- le temps de génération ;
- le coût LLM ;
- le coût du devis ;
- les informations de pricing.

---

# Bonnes pratiques

- Ne jamais calculer un prix dans le prompt.
- Toujours utiliser les outils.
- Toujours journaliser les appels.
- Conserver `temperature: 0.2`.
- Utiliser `maxSteps: 8`.

---

# Déploiement

Le projet est prévu pour être déployé sur Vercel.

```bash
git add .

git commit -m "feat"

git push
```

Configurer ensuite les variables d'environnement dans Vercel.

---

# Limitations connues

- moteur de pricing simplifié ;
- distance estimée ;
- PDF basique ;
- absence d'authentification ;
- limite Airtable.

---

# Roadmap

- moteur de pricing complet ;
- calcul réel via API cartographique ;
- support multi-autocars ;
- tableau de bord ;
- authentification ;
- signature électronique.

---

# Documentation

La documentation complète du projet (architecture, moteur de pricing, pipeline commercial, workflow, tests et évolutions) est disponible dans le document de passation du projet. :contentReference[oaicite:1]{index=1}
