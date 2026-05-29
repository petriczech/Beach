import type { Attribution, Team } from '../domain/types';
import { cs } from '../i18n/cs';

interface Props {
  team: Team;
  selected: Attribution;
  onSelect: (a: Attribution) => void;
}

export function PlayerSelector({ team, selected, onSelect }: Props) {
  const options: { value: Attribution; label: string }[] = [
    { value: 1, label: team.players[0].name || cs.player1 },
    { value: 2, label: team.players[1].name || cs.player2 },
    { value: 'team', label: cs.team },
  ];
  return (
    <div className="player-selector" role="group" aria-label={cs.selectPlayer}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={`chip ${selected === o.value ? 'chip-active' : ''}`}
          onClick={() => onSelect(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
