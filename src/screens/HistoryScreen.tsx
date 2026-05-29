import { useState } from 'react';
import { useMatches } from '../hooks/useMatches';
import { computeMatchState } from '../domain/scoring';
import { ConfirmModal } from '../components/ConfirmModal';
import { cs } from '../i18n/cs';
import type { Match } from '../domain/types';

interface Props {
  onOpen: (matchId: string) => void;
  onBack: () => void;
}

function summary(match: Match): string {
  const st = computeMatchState(match);
  const setScores = st.sets
    .filter((s) => s.winner)
    .map((s) => `${s.home}:${s.away}`)
    .join(', ');
  const sets = `${st.setsWon.home}:${st.setsWon.away}`;
  if (!match.finishedAt && !st.isMatchOver) {
    return `${cs.inProgress} — ${st.current.home}:${st.current.away}`;
  }
  return `${sets}${setScores ? ` (${setScores})` : ''}`;
}

export function HistoryScreen({ onOpen, onBack }: Props) {
  const { matches, loading, remove } = useMatches();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div className="screen">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={onBack}>
          ‹ {cs.back}
        </button>
        <h1>{cs.historyTitle}</h1>
        <span />
      </header>

      <main className="history">
        {loading && <p className="muted">…</p>}
        {!loading && matches.length === 0 && <p className="muted">{cs.noMatches}</p>}
        <ul className="match-list">
          {matches.map((m) => (
            <li key={m.id} className="match-item">
              <button className="match-item-main" onClick={() => onOpen(m.id)}>
                <span className="match-item-teams">
                  {m.teams.home.name} vs {m.teams.away.name}
                </span>
                <span className="match-item-meta">
                  {new Date(m.createdAt).toLocaleDateString('cs-CZ')} · {summary(m)}
                </span>
              </button>
              <button
                className="btn btn-danger-ghost"
                aria-label={cs.delete}
                onClick={() => setToDelete(m.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </main>

      {toDelete && (
        <ConfirmModal
          title={cs.delete}
          message={cs.deleteMatchConfirm}
          confirmLabel={cs.delete}
          onConfirm={async () => {
            await remove(toDelete);
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
