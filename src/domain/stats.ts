import { pointToFor } from './taxonomy';
import type { Attribution, Match, PlayerSlot, TeamSide } from './types';

export interface PlayerStats {
  aces: number;
  serveErrors: number;
  kills: number;
  attackErrors: number;
  blocks: number;
  blockErrors: number;
  receptionErrors: number;
  netTouches: number;
  digs: number;
  /** Body, které tato akce přinesla vlastnímu týmu. */
  pointsScored: number;
  /** Chyby, které daly bod soupeři. */
  errorsCommitted: number;
}

export interface TeamStats {
  /** Statistiky pro hráče 1 a 2. */
  perPlayer: Record<PlayerSlot, PlayerStats>;
  /** Akce připsané celému týmu ('team'). */
  team: PlayerStats;
}

export type MatchStats = Record<TeamSide, TeamStats>;

function emptyStats(): PlayerStats {
  return {
    aces: 0,
    serveErrors: 0,
    kills: 0,
    attackErrors: 0,
    blocks: 0,
    blockErrors: 0,
    receptionErrors: 0,
    netTouches: 0,
    digs: 0,
    pointsScored: 0,
    errorsCommitted: 0,
  };
}

function emptyTeamStats(): TeamStats {
  return { perPlayer: { 1: emptyStats(), 2: emptyStats() }, team: emptyStats() };
}

function bucketFor(ts: TeamStats, player: Attribution): PlayerStats {
  return player === 'team' ? ts.team : ts.perPlayer[player];
}

/** Spočítá statistiky obou týmů jediným průchodem log událostí. */
export function computeStats(match: Match): MatchStats {
  const result: MatchStats = { home: emptyTeamStats(), away: emptyTeamStats() };

  for (const ev of match.events) {
    const bucket = bucketFor(result[ev.team], ev.player);

    switch (ev.type) {
      case 'ACE':
        bucket.aces += 1;
        break;
      case 'SERVE_ERROR':
        bucket.serveErrors += 1;
        break;
      case 'ATTACK_KILL':
        bucket.kills += 1;
        break;
      case 'ATTACK_ERROR':
        bucket.attackErrors += 1;
        break;
      case 'BLOCK':
        bucket.blocks += 1;
        break;
      case 'BLOCK_ERROR':
        bucket.blockErrors += 1;
        break;
      case 'RECEPTION_ERROR':
        bucket.receptionErrors += 1;
        break;
      case 'NET_TOUCH':
        bucket.netTouches += 1;
        break;
      case 'DIG':
        bucket.digs += 1;
        break;
      default:
        break;
    }

    const pointTo = pointToFor(ev.type, ev.team);
    if (pointTo === ev.team) bucket.pointsScored += 1;
    else if (pointTo) bucket.errorsCommitted += 1;
  }

  return result;
}
