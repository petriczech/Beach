import type { TeamStats } from '../domain/stats';
import type { Team } from '../domain/types';
import { cs } from '../i18n/cs';

interface Props {
  team: Team;
  stats: TeamStats;
}

export function StatsTable({ team, stats }: Props) {
  const rows = [
    { name: team.players[0].name || cs.player1, s: stats.perPlayer[1] },
    { name: team.players[1].name || cs.player2, s: stats.perPlayer[2] },
    { name: cs.team, s: stats.team },
  ];
  return (
    <div className="stats-block">
      <h3>{team.name}</h3>
      <div className="stats-scroll">
        <table className="stats-table">
          <thead>
            <tr>
              <th>{cs.statPlayer}</th>
              <th>{cs.statAces}</th>
              <th>{cs.statServeErrors}</th>
              <th>{cs.statKills}</th>
              <th>{cs.statAttackErrors}</th>
              <th>{cs.statBlocks}</th>
              <th>{cs.statReceptionErrors}</th>
              <th>{cs.statNetTouches}</th>
              <th>{cs.statPoints}</th>
              <th>{cs.statErrors}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="stats-name">{r.name}</td>
                <td>{r.s.aces}</td>
                <td>{r.s.serveErrors}</td>
                <td>{r.s.kills}</td>
                <td>{r.s.attackErrors}</td>
                <td>{r.s.blocks}</td>
                <td>{r.s.receptionErrors}</td>
                <td>{r.s.netTouches}</td>
                <td className="stats-strong">{r.s.pointsScored}</td>
                <td>{r.s.errorsCommitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
