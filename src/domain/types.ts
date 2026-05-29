// Doménový model aplikace. Jediným zdrojem pravdy je seznam událostí
// (`Match.events`); skóre i statistiky se z něj vždy odvozují.

export type TeamSide = 'home' | 'away';

/** Slot hráče v týmu — plážový volejbal má dva hráče. */
export type PlayerSlot = 1 | 2;

/** Komu se akce připisuje: konkrétnímu hráči, nebo celému týmu. */
export type Attribution = PlayerSlot | 'team';

export interface Player {
  slot: PlayerSlot;
  name: string;
}

export interface Team {
  side: TeamSide;
  name: string;
  players: [Player, Player];
}

export interface MatchRules {
  /** Bodů na set v běžných setech (1–2). */
  pointsRegular: number;
  /** Bodů na set v rozhodujícím setu. */
  pointsDeciding: number;
  /** Počet rozhodujících setů — kdo dřív, vyhrál. (best of 3 → 2) */
  setsToWin: number;
  /** Minimální rozdíl pro vítězství setu. */
  winBy: number;
  /** Střídání stran každých N bodů v běžných setech. */
  switchEveryRegular: number;
  /** Střídání stran každých N bodů v rozhodujícím setu. */
  switchEveryDeciding: number;
  /** Kdo a který hráč podává jako první v 1. setu. */
  firstServe: { team: TeamSide; player: PlayerSlot };
}

/** Typy zaznamenatelných herních akcí. */
export type EventType =
  | 'ACE' // eso — bod podávajícímu
  | 'SERVE_ERROR' // chyba podání — bod soupeři
  | 'SERVE_TARGET_1' // podání na hráče 1 (anotace, bez bodu)
  | 'SERVE_TARGET_2' // podání na hráče 2 (anotace, bez bodu)
  | 'ATTACK_KILL' // úspěšný útok — bod útočícímu
  | 'ATTACK_ERROR' // chyba útoku — bod soupeři
  | 'BLOCK' // blok bod — bod blokujícímu
  | 'BLOCK_ERROR' // chyba bloku — bod soupeři
  | 'RECEPTION_ERROR' // chyba příjmu — bod soupeři
  | 'DIG' // vybráno v obraně (anotace, bez bodu)
  | 'NET_TOUCH' // dotek sítě / páska (faul) — bod soupeři
  | 'LET_SERVE' // páska při podání, míč v poli (anotace, bez bodu)
  | 'GENERIC_ERROR' // obecná chyba (typicky celý tým) — bod soupeři
  | 'OPP_POINT'; // bod soupeře bez bližšího určení

export interface MatchEvent {
  id: string;
  ts: number;
  type: EventType;
  /** Tým, kterému se akce připisuje. */
  team: TeamSide;
  /** Hráč 1/2, nebo celý tým. */
  player: Attribution;
}

export interface Match {
  id: string;
  createdAt: number;
  finishedAt?: number;
  teams: { home: Team; away: Team };
  rules: MatchRules;
  /** Append-only log. Undo = odebrání poslední události. */
  events: MatchEvent[];
}

// ---------- Odvozené typy (neukládají se) ----------

export interface SetScore {
  home: number;
  away: number;
  winner?: TeamSide;
}

export interface MatchState {
  /** Dokončené i právě probíhající sety. */
  sets: SetScore[];
  currentSetIndex: number;
  setsWon: { home: number; away: number };
  /** Aktuální skóre v probíhajícím setu. */
  current: { home: number; away: number };
  servingTeam: TeamSide;
  servingPlayer: PlayerSlot;
  /** Zda jsou strany prohozené oproti výchozímu rozestavení. */
  sidesSwitched: boolean;
  isMatchOver: boolean;
  matchWinner?: TeamSide;
}

export const DEFAULT_RULES: MatchRules = {
  pointsRegular: 21,
  pointsDeciding: 15,
  setsToWin: 2,
  winBy: 2,
  switchEveryRegular: 7,
  switchEveryDeciding: 5,
  firstServe: { team: 'home', player: 1 },
};
