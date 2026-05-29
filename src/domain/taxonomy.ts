import type { EventType, TeamSide } from './types';

export function otherSide(team: TeamSide): TeamSide {
  return team === 'home' ? 'away' : 'home';
}

/**
 * Komu padne bod za danou událost. `null` = anotace bez bodu.
 * Toto je jediný zdroj pravdy pro bodování — UI jen emituje {type, team, player}.
 */
export function pointToFor(type: EventType, team: TeamSide): TeamSide | null {
  switch (type) {
    // Bod tomu, kdo akci provedl.
    case 'ACE':
    case 'ATTACK_KILL':
    case 'BLOCK':
      return team;
    // Chyba/faul → bod soupeři.
    case 'SERVE_ERROR':
    case 'ATTACK_ERROR':
    case 'BLOCK_ERROR':
    case 'RECEPTION_ERROR':
    case 'NET_TOUCH':
    case 'GENERIC_ERROR':
    case 'OPP_POINT':
      return otherSide(team);
    // Anotace bez bodu.
    case 'SERVE_TARGET_1':
    case 'SERVE_TARGET_2':
    case 'DIG':
    case 'LET_SERVE':
      return null;
  }
}

export interface EventDef {
  type: EventType;
  /** Krátký popisek na tlačítko. */
  label: string;
  /** Skupina pro uspořádání v UI. */
  group: 'serve' | 'attack' | 'defense' | 'error' | 'other';
  /** Zda událost obvykle připisujeme konkrétnímu hráči. */
  playerSpecific: boolean;
}

/** Definice akcí v pořadí pro zobrazení. Texty viz i18n/cs.ts (zde záloha CS). */
export const EVENT_DEFS: EventDef[] = [
  { type: 'ACE', label: 'Eso', group: 'serve', playerSpecific: true },
  { type: 'SERVE_ERROR', label: 'Chyba podání', group: 'serve', playerSpecific: true },
  { type: 'ATTACK_KILL', label: 'Útok bod', group: 'attack', playerSpecific: true },
  { type: 'ATTACK_ERROR', label: 'Chyba útoku', group: 'attack', playerSpecific: true },
  { type: 'BLOCK', label: 'Blok bod', group: 'defense', playerSpecific: true },
  { type: 'BLOCK_ERROR', label: 'Chyba bloku', group: 'defense', playerSpecific: true },
  {
    type: 'RECEPTION_ERROR',
    label: 'Chyba příjmu',
    group: 'defense',
    playerSpecific: true,
  },
  { type: 'NET_TOUCH', label: 'Páska / síť', group: 'error', playerSpecific: true },
  { type: 'GENERIC_ERROR', label: 'Chyba', group: 'error', playerSpecific: true },
];

export function eventLabel(type: EventType): string {
  return EVENT_DEFS.find((d) => d.type === type)?.label ?? type;
}
