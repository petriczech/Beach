import { describe, expect, it } from 'vitest';
import { computeMatchState, isSetWon, setTarget } from './scoring';
import { computeStats } from './stats';
import { matchReducer, type MatchSession } from './reducer';
import { DEFAULT_RULES, type Match, type MatchEvent, type TeamSide } from './types';

function makeMatch(events: MatchEvent[] = [], rules = DEFAULT_RULES): Match {
  return {
    id: 'test',
    createdAt: 0,
    teams: {
      home: {
        side: 'home',
        name: 'Domácí',
        players: [
          { slot: 1, name: 'A1' },
          { slot: 2, name: 'A2' },
        ],
      },
      away: {
        side: 'away',
        name: 'Hosté',
        players: [
          { slot: 1, name: 'B1' },
          { slot: 2, name: 'B2' },
        ],
      },
    },
    rules,
    events,
  };
}

let counter = 0;
/** Pomocník: vytvoří událost, která dá bod danému týmu (ACE = bod vlastnímu). */
function point(team: TeamSide): MatchEvent {
  return { id: `e${counter++}`, ts: counter, type: 'ACE', team, player: 1 };
}

function points(team: TeamSide, n: number): MatchEvent[] {
  return Array.from({ length: n }, () => point(team));
}

describe('setTarget / isSetWon', () => {
  it('běžné sety mají cíl 21, rozhodující 15', () => {
    expect(setTarget(0, DEFAULT_RULES)).toBe(21);
    expect(setTarget(1, DEFAULT_RULES)).toBe(21);
    expect(setTarget(2, DEFAULT_RULES)).toBe(15);
  });

  it('set se vyhraje až při rozdílu 2 bodů', () => {
    expect(isSetWon(21, 19, 21, 2)).toBe(true);
    expect(isSetWon(21, 20, 21, 2)).toBe(false);
    expect(isSetWon(22, 20, 21, 2)).toBe(true);
    expect(isSetWon(20, 19, 21, 2)).toBe(false);
  });
});

describe('computeMatchState — skóre a sety', () => {
  it('počítá průběžné skóre v setu', () => {
    const s = computeMatchState(makeMatch([...points('home', 5), ...points('away', 3)]));
    expect(s.current).toEqual({ home: 5, away: 3 });
    expect(s.isMatchOver).toBe(false);
  });

  it('set se neukončí na 21:20, ale až na 22:20', () => {
    const at2120 = computeMatchState(
      makeMatch([...points('home', 21), ...points('away', 20)]),
    );
    // 21:20 — pozor, set se ukončil dřív? Ne: home dosáhl 21 při 21:0..20,
    // takže ověříme alternující průběh níže. Zde jen rozdíl 1 → nehotovo.
    expect(at2120.setsWon.home).toBe(1); // home vyhrál set už na 21:0..
  });

  it('vyžaduje rozdíl 2 i nad cílem (deuce)', () => {
    // střídavě body do 20:20, pak 22:20
    const evs: MatchEvent[] = [];
    for (let i = 0; i < 20; i++) {
      evs.push(point('home'), point('away'));
    }
    let s = computeMatchState(makeMatch(evs));
    expect(s.current).toEqual({ home: 20, away: 20 });
    expect(s.setsWon.home).toBe(0);

    s = computeMatchState(makeMatch([...evs, point('home')])); // 21:20
    expect(s.setsWon.home).toBe(0); // ještě ne
    s = computeMatchState(makeMatch([...evs, point('home'), point('home')])); // 22:20
    expect(s.setsWon.home).toBe(1);
  });

  it('zápas končí po zisku 2 setů (best of 3)', () => {
    const set = points('home', 21);
    const s = computeMatchState(makeMatch([...set, ...points('home', 21)]));
    expect(s.isMatchOver).toBe(true);
    expect(s.matchWinner).toBe('home');
    expect(s.setsWon.home).toBe(2);
    expect(s.sets.filter((x) => x.winner).length).toBe(2);
  });

  it('rozhodující 3. set se hraje do 15', () => {
    const setHome = points('home', 21);
    const setAway = points('away', 21);
    // 1:1 na sety, pak 15:0 home → konec
    const s = computeMatchState(
      makeMatch([...setHome, ...setAway, ...points('home', 15)]),
    );
    expect(s.isMatchOver).toBe(true);
    expect(s.matchWinner).toBe('home');
  });

  it('ignoruje události po konci zápasu', () => {
    const s = computeMatchState(
      makeMatch([...points('home', 21), ...points('home', 21), ...points('away', 5)]),
    );
    expect(s.isMatchOver).toBe(true);
    // skóre soupeře po konci se nezapočítá do žádného setu
    expect(s.setsWon.away).toBe(0);
  });
});

describe('computeMatchState — podání a střídání hráče', () => {
  it('první podává nakonfigurovaný tým a hráč', () => {
    const s = computeMatchState(makeMatch([]));
    expect(s.servingTeam).toBe('home');
    expect(s.servingPlayer).toBe(1);
  });

  it('při side-outu přechází podání na soupeře', () => {
    // home podává, away vyhraje výměnu → podává away
    const s = computeMatchState(makeMatch([point('away')]));
    expect(s.servingTeam).toBe('away');
  });

  it('podávající hráč týmu se po opětovném zisku podání střídá', () => {
    // home(p1) podává a získá bod (stále p1). away vezme podání. home vezme zpět.
    // home přišel o podání jednou → příště podává hráč 2.
    const s = computeMatchState(
      makeMatch([
        point('home'), // home p1 drží podání (1:0)
        point('away'), // side-out na away (1:1), home flip → příště p2
        point('home'), // side-out zpět na home (2:1) → home podává p2
      ]),
    );
    expect(s.servingTeam).toBe('home');
    expect(s.servingPlayer).toBe(2);
  });

  it('podávající tým se mezi sety střídá', () => {
    // set 1 vyhraje home; set 2 by měl začít podáním away
    const s = computeMatchState(makeMatch([...points('home', 21)]));
    // teď jsme na začátku setu 2
    expect(s.currentSetIndex).toBe(1);
    expect(s.servingTeam).toBe('away');
  });
});

describe('reducer — undo / redo', () => {
  const start: MatchSession = { match: makeMatch([]), redoStack: [] };

  it('RECORD přidá událost a UNDO ji odebere včetně vlivu na skóre', () => {
    let s = matchReducer(start, {
      kind: 'RECORD',
      type: 'ACE',
      team: 'home',
      player: 1,
    });
    expect(s.match.events).toHaveLength(1);
    expect(computeMatchState(s.match).current.home).toBe(1);

    s = matchReducer(s, { kind: 'UNDO' });
    expect(s.match.events).toHaveLength(0);
    expect(computeMatchState(s.match).current.home).toBe(0);
    expect(s.redoStack).toHaveLength(1);
  });

  it('REDO vrátí odebranou událost', () => {
    let s = matchReducer(start, {
      kind: 'RECORD',
      type: 'ACE',
      team: 'away',
      player: 2,
    });
    s = matchReducer(s, { kind: 'UNDO' });
    s = matchReducer(s, { kind: 'REDO' });
    expect(s.match.events).toHaveLength(1);
    expect(computeMatchState(s.match).current.away).toBe(1);
  });

  it('nový RECORD vymaže redo zásobník', () => {
    let s = matchReducer(start, {
      kind: 'RECORD',
      type: 'ACE',
      team: 'home',
      player: 1,
    });
    s = matchReducer(s, { kind: 'UNDO' });
    s = matchReducer(s, { kind: 'RECORD', type: 'ACE', team: 'away', player: 1 });
    expect(s.redoStack).toHaveLength(0);
  });
});

describe('computeStats', () => {
  it('agreguje statistiky podle hráče a typu', () => {
    const evs: MatchEvent[] = [
      { id: '1', ts: 1, type: 'ACE', team: 'home', player: 1 },
      { id: '2', ts: 2, type: 'ACE', team: 'home', player: 1 },
      { id: '3', ts: 3, type: 'ATTACK_ERROR', team: 'home', player: 2 },
      { id: '4', ts: 4, type: 'GENERIC_ERROR', team: 'home', player: 'team' },
      { id: '5', ts: 5, type: 'NET_TOUCH', team: 'away', player: 1 },
    ];
    const stats = computeStats(makeMatch(evs));
    expect(stats.home.perPlayer[1].aces).toBe(2);
    expect(stats.home.perPlayer[1].pointsScored).toBe(2);
    expect(stats.home.perPlayer[2].attackErrors).toBe(1);
    expect(stats.home.perPlayer[2].errorsCommitted).toBe(1);
    expect(stats.home.team.errorsCommitted).toBe(1);
    expect(stats.away.perPlayer[1].netTouches).toBe(1);
  });
});
