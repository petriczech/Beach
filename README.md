# Beach Zápis 🏐

Webová aplikace (PWA) na **záznam plážového volejbalového zápasu (2v2)** přímo u kurtu
na telefonu nebo tabletu. Velká tlačítka, automatické skóre, statistiky hráčů, funguje
**offline** a data zůstávají v zařízení.

## Co umí

- **Záznam akcí** velkými tlačítky: eso, chyba podání, útok, chyba útoku, blok, chyba
  bloku, chyba příjmu, **páska/síť** a obecná chyba.
- **Připsání hráči 1, hráči 2 nebo celému týmu** jedním ťuknutím.
- **Automatické skóre a sety** podle pravidel plážového volejbalu (sety do 21, rozhodující
  do 15, rozdíl 2, best of 3), včetně indikátoru **kdo podává** a střídání podání.
- **Zpět / Vpřed (undo/redo)** — neomylná oprava překlepů u kurtu.
- **Statistiky hráčů** po zápase (esa, chyby, útoky, bloky, body, chyby celkem).
- **Historie zápasů** uložená lokálně v prohlížeči (IndexedDB).
- **Export do CSV a JSON.**
- **PWA** — instalovatelná na plochu, funguje offline.

## Architektura

Jediným zdrojem pravdy je **append-only log událostí** (`Match.events`). Skóre, stav
zápasu i statistiky se z něj vždy **odvozují** čistými funkcemi — díky tomu je undo
triviální (odeber událost a přepočítej) a export je plně round-trippable.

```
src/
  domain/      typy, taxonomie akcí, scoring engine, statistiky, reducer (+ testy)
  storage/     IndexedDB (idb-keyval) a export CSV/JSON
  hooks/       useMatch (živý zápas + perzistence), useMatches (historie)
  screens/     Setup, Live, History, MatchDetail
  components/   Scoreboard, ServerIndicator, PlayerSelector, ActionGrid, StatsTable, …
  i18n/        české texty
```

## Vývoj

```bash
npm install
npm run dev        # vývojový server
npm run test       # testy scoring enginu (Vitest)
npm run lint
npm run build      # produkční build do dist/
npm run preview    # náhled produkčního buildu (zde funguje service worker)
```

### Ověření PWA / offline

```bash
npm run build && npm run preview
```

V prohlížeči otevři DevTools → Application → Service Worker, zapni **Offline** a ověř,
že se aplikace i uložený zápas načtou bez sítě.

## Nasazení

`npm run build` vytvoří statický `dist/`, který lze hostovat kdekoli (GitHub Pages,
Netlify, Cloudflare Pages). Při nasazení do podadresáře uprav `base` ve `vite.config.ts`.
