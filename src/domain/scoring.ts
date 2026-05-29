import { otherSide, pointToFor } from './taxonomy';
import type {
  Match,
  MatchRules,
  MatchState,
  PlayerSlot,
  SetScore,
  TeamSide,
} from './types';

/** Index posledního možného (rozhodujícího) setu, počítáno od 0. */
export function decidingSetIndex(rules: MatchRules): number {
  return rules.setsToWin * 2 - 2;
}

/** Cílový počet bodů pro daný set. */
export function setTarget(setIndex: number, rules: MatchRules): number {
  return setIndex >= decidingSetIndex(rules) ? rules.pointsDeciding : rules.pointsRegular;
}

export function isSetWon(
  home: number,
  away: number,
  target: number,
  winBy: number,
): boolean {
  return (home >= target || away >= target) && Math.abs(home - away) >= winBy;
}

function flip(p: PlayerSlot): PlayerSlot {
  return p === 1 ? 2 : 1;
}

/** Kdo podává jako první v daném setu (týmy se po setech střídají). */
function firstServingTeam(setIndex: number, rules: MatchRules): TeamSide {
  return setIndex % 2 === 0 ? rules.firstServe.team : otherSide(rules.firstServe.team);
}

/**
 * Odvodí kompletní stav zápasu z log událostí. Čistá funkce — žádný
 * uložený stav. Undo = odebrání události a opětovné zavolání.
 */
export function computeMatchState(match: Match): MatchState {
  const { rules } = match;
  const completed: SetScore[] = [];
  const setsWon = { home: 0, away: 0 };

  let setIndex = 0;
  let current = { home: 0, away: 0 };
  let servingTeam = firstServingTeam(0, rules);
  // Hráč, který v daném týmu podává příště, když tým získá podání.
  const nextServer: Record<TeamSide, PlayerSlot> = {
    home: rules.firstServe.team === 'home' ? rules.firstServe.player : 1,
    away: rules.firstServe.team === 'away' ? rules.firstServe.player : 1,
  };

  let isMatchOver = false;
  let matchWinner: TeamSide | undefined;

  for (const ev of match.events) {
    if (isMatchOver) break;
    const pointTo = pointToFor(ev.type, ev.team);
    if (!pointTo) continue; // anotace bez bodu

    current[pointTo] += 1;

    // Side-out: pokud bod získal nepodávající tým, podání přechází a tým,
    // který o podání přišel, příště střídá podávajícího hráče.
    if (pointTo !== servingTeam) {
      nextServer[servingTeam] = flip(nextServer[servingTeam]);
      servingTeam = pointTo;
    }

    const target = setTarget(setIndex, rules);
    if (isSetWon(current.home, current.away, target, rules.winBy)) {
      const winner: TeamSide = current.home > current.away ? 'home' : 'away';
      completed.push({ home: current.home, away: current.away, winner });
      setsWon[winner] += 1;

      if (setsWon[winner] >= rules.setsToWin) {
        isMatchOver = true;
        matchWinner = winner;
      } else {
        // nový set
        setIndex += 1;
        current = { home: 0, away: 0 };
        servingTeam = firstServingTeam(setIndex, rules);
        nextServer.home = 1;
        nextServer.away = 1;
      }
    }
  }

  const sets: SetScore[] = [...completed];
  if (!isMatchOver) {
    sets.push({ home: current.home, away: current.away });
  }

  const switchEvery =
    setIndex >= decidingSetIndex(rules)
      ? rules.switchEveryDeciding
      : rules.switchEveryRegular;
  const totalInSet = current.home + current.away;
  const sidesSwitched =
    switchEvery > 0 ? Math.floor(totalInSet / switchEvery) % 2 === 1 : false;

  return {
    sets,
    currentSetIndex: setIndex,
    setsWon,
    current,
    servingTeam,
    servingPlayer: nextServer[servingTeam],
    sidesSwitched,
    isMatchOver,
    matchWinner,
  };
}
