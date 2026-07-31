# Purple Tarot 2 Rules Assistant

Une application web responsive pour consulter les règles de Purple Tarot 2 et poser des questions à un LLM via OpenRouter.

## Principe

Le fichier Markdown [`src/content/rules/purple-tarot-2.md`](src/content/rules/purple-tarot-2.md) est l’unique source de vérité. Le modèle ne reçoit que les sections pertinentes retrouvées localement et l’interface affiche les sources sous chaque réponse.

Si OpenRouter est indisponible ou si aucune clé n’est configurée, l’application reste fonctionnelle grâce à un fallback extractif fondé sur le même Markdown.

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Variables d’environnement

```env
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Purple Tarot 2 Rules Assistant
```

`OPENROUTER_API_KEY` reste exclusivement côté serveur. Ne créez jamais de variable `NEXT_PUBLIC_OPENROUTER_API_KEY`.

## Scripts

```bash
npm run dev        # serveur local
npm run test       # tests unitaires
npm run lint       # ESLint
npm run typecheck  # vérification TypeScript
npm run build      # build de production
```

## Modifier les règles

Modifier uniquement :

```text
src/content/rules/purple-tarot-2.md
```

Le parser et l’index de recherche sont reconstruits automatiquement.

## Fonctionnement IA

1. La question est normalisée.
2. Les sections pertinentes sont retrouvées localement.
3. Seules ces sections sont envoyées à OpenRouter.
4. La réponse est contrôlée par des garde-fous anti-hallucination.
5. Les sources sont affichées et restent accessibles en un clic.
6. En cas d’échec, un extrait direct du livret est renvoyé.

## Limites et responsabilité

L’application n’encourage pas la consommation excessive d’alcool. Les pénalités peuvent être remplacées par des alternatives sans alcool.
