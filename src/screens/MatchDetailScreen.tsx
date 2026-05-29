import { useEffect, useState } from 'react';
import { loadMatch } from '../storage/db';
import { computeMatchState } from '../domain/scoring';
import { computeStats } from '../domain/stats';
import { exportCsv, exportJson } from '../storage/export';
import { StatsTable } from '../components/StatsTable';
import { cs } from '../i18n/cs';
import type { Match } from '../domain/types';

interface Props {
  matchId: string;
  onBack: () => void;
}

export function MatchDetailScreen({ matchId, onBack }: Props) {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    void loadMatch(matchId).then((m) => setMatch(m ?? null));
  }, [matchId]);

  if (!match) {
    return (
      <div className="screen">
        <header className="topbar">
          <button className="btn btn-ghost" onClick={onBack}>
            ‹ {cs.back}
          </button>
          <h1>{cs.matchDetailTitle}</h1>
          <span />
        </header>
        <main className="detail">
          <p className="muted">…</p>
        </main>
      </div>
    );
  }

  const state = computeMatchState(match);
  const stats = computeStats(match);

  return (
    <div className="screen">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={onBack}>
          ‹ {cs.back}
        </button>
        <h1>{cs.matchDetailTitle}</h1>
        <span />
      </header>

      <main className="detail">
        <section className="card detail-summary">
          <div className="detail-teams">
            {match.teams.home.name} vs {match.teams.away.name}
          </div>
          <div className="detail-sets">
            {cs.sets} {state.setsWon.home}:{state.setsWon.away}
          </div>
          <div className="detail-setscores">
            {state.sets
              .filter((s) => s.winner)
              .map((s, i) => (
                <span key={i} className="set-pill">
                  {s.home}:{s.away}
                </span>
              ))}
          </div>
          {state.matchWinner && (
            <div className="detail-winner">
              🏆 {cs.winner}: {match.teams[state.matchWinner].name}
            </div>
          )}
        </section>

        <h2>{cs.playerStats}</h2>
        <StatsTable team={match.teams.home} stats={stats.home} />
        <StatsTable team={match.teams.away} stats={stats.away} />

        <div className="export-row">
          <button className="btn btn-primary" onClick={() => exportCsv(match)}>
            {cs.exportCsv}
          </button>
          <button className="btn btn-ghost" onClick={() => exportJson(match)}>
            {cs.exportJson}
          </button>
        </div>
      </main>
    </div>
  );
}
