import type { Match, MatchState } from '../domain/types';
import { cs } from '../i18n/cs';

interface Props {
  match: Match;
  state: MatchState;
}

export function Scoreboard({ match, state }: Props) {
  const completed = state.sets.filter((s) => s.winner);
  return (
    <div className="scoreboard">
      <div className="scoreboard-sets">
        {cs.set} {state.currentSetIndex + 1} · {cs.sets} {state.setsWon.home}:
        {state.setsWon.away}
        {completed.length > 0 && (
          <span className="scoreboard-history">
            {' '}
            ({completed.map((s) => `${s.home}:${s.away}`).join(', ')})
          </span>
        )}
      </div>
      <div className="scoreboard-main">
        <div className="scoreboard-team">
          <div className="scoreboard-name">{match.teams.home.name}</div>
          <div className="scoreboard-points">{state.current.home}</div>
        </div>
        <div className="scoreboard-sep">:</div>
        <div className="scoreboard-team">
          <div className="scoreboard-name">{match.teams.away.name}</div>
          <div className="scoreboard-points">{state.current.away}</div>
        </div>
      </div>
    </div>
  );
}
