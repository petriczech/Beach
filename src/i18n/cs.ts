// Všechny texty UI na jednom místě.
export const cs = {
  appName: 'Beach Zápis',
  tagline: 'Záznam plážového volejbalového zápasu',

  // Navigace / obecné
  back: 'Zpět',
  cancel: 'Zrušit',
  confirm: 'Potvrdit',
  delete: 'Smazat',
  close: 'Zavřít',
  newMatch: 'Nový zápas',
  history: 'Historie',

  // Setup
  setupTitle: 'Nastavení zápasu',
  teamHome: 'Domácí tým',
  teamAway: 'Soupeř',
  teamNamePlaceholder: 'Název týmu',
  player1: 'Hráč 1',
  player2: 'Hráč 2',
  playerNamePlaceholder: 'Jméno hráče',
  rules: 'Pravidla',
  pointsRegular: 'Bodů na set',
  pointsDeciding: 'Bodů v rozhodujícím setu',
  firstServe: 'První podání',
  whoServesFirst: 'Kdo podává první',
  startMatch: 'Začít zápas',

  // Live
  set: 'Set',
  sets: 'Sety',
  serves: 'Podává',
  team: 'Celý tým',
  undo: 'Zpět',
  redo: 'Vpřed',
  endMatch: 'Ukončit zápas',
  selectPlayer: 'Vyber hráče',

  // Akce (potvrzení)
  recorded: 'Zaznamenáno',

  // Konec setu / zápasu
  setWon: 'Set vyhrán',
  matchOver: 'Konec zápasu',
  winner: 'Vítěz',
  endMatchConfirm: 'Opravdu ukončit a uložit zápas?',

  // Historie
  historyTitle: 'Historie zápasů',
  noMatches: 'Zatím žádné zápasy.',
  inProgress: 'Probíhá',
  deleteMatchConfirm: 'Smazat tento zápas?',

  // Detail
  matchDetailTitle: 'Detail zápasu',
  perSetScore: 'Skóre po setech',
  playerStats: 'Statistiky hráčů',
  exportCsv: 'Export CSV',
  exportJson: 'Export JSON',

  // Statistiky — záhlaví
  statPlayer: 'Hráč',
  statAces: 'Esa',
  statServeErrors: 'Chyby podání',
  statKills: 'Útoky',
  statAttackErrors: 'Chyby útoku',
  statBlocks: 'Bloky',
  statReceptionErrors: 'Chyby příjmu',
  statNetTouches: 'Pásky',
  statPoints: 'Body',
  statErrors: 'Chyby celkem',
} as const;
