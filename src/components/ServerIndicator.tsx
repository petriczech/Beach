import type { Match, MatchState } from '../domain/types';
import { cs } from '../i18n/cs';

interface Props {
  match: Match;
  state: MatchState;
}

export function ServerIndicator({ match, state }: Props) {
  const team = match.teams[state.servingTeam];
  const player = team.players[state.servingPlayer - 1];
  return (
    <div className="server-indicator">
      <span className="server-dot" aria-hidden="true">
        ●
      </span>{' '}
      {cs.serves}: <strong>{team.name}</strong> — {player.name}
    </div>
  );
}
