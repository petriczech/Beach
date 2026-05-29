import { useEffect, useState } from 'react';
import { Scoreboard } from '../components/Scoreboard';
import { ServerIndicator } from '../components/ServerIndicator';
import { PlayerSelector } from '../components/PlayerSelector';
import { ActionGrid } from '../components/ActionGrid';
import { ConfirmModal } from '../components/ConfirmModal';
import { useMatch } from '../hooks/useMatch';
import { eventLabel } from '../domain/taxonomy';
import { cs } from '../i18n/cs';
import type { Attribution, EventType, Match, TeamSide } from '../domain/types';

interface Props {
  initial: Match;
  onFinish: (matchId: string) => void;
  onExit: () => void;
}

function attributionLabel(match: Match, team: TeamSide, player: Attribution): string {
  if (player === 'team') return cs.team;
  return match.teams[team].players[player - 1].name;
}

export function LiveScreen({ initial, onFinish, onExit }: Props) {
  const { match, state, canUndo, canRedo, record, undo, redo, flush } =
    useMatch(initial);
  const [selHome, setSelHome] = useState<Attribution>(1);
  const [selAway, setSelAway] = useState<Attribution>(1);
  const [toast, setToast] = useState<string | null>(null);
  const [askEnd, setAskEnd] = useState(false);
  const [endHandled, setEndHandled] = useState(false);

  // Po skončení zápasu jednou ulož finishedAt a nabídni přechod na detail.
  useEffect(() => {
    if (state.isMatchOver && !endHandled) {
      setEndHandled(true);
      void flush({ finishedAt: Date.now() });
    }
  }, [state.isMatchOver, endHandled, flush]);

  function handleAction(team: TeamSide, type: EventType) {
    if (state.isMatchOver) return;
    const player = team === 'home' ? selHome : selAway;
    record({ kind: 'RECORD', type, team, player });
    setToast(`${eventLabel(type)} — ${attributionLabel(match, team, player)}`);
    window.setTimeout(() => setToast(null), 1600);
  }

  function teamPanel(side: TeamSide) {
    const team = match.teams[side];
    const sel = side === 'home' ? selHome : selAway;
    const setSel = side === 'home' ? setSelHome : setSelAway;
    const isServing = state.servingTeam === side && !state.isMatchOver;
    return (
      <section className={`team-panel ${isServing ? 'team-serving' : ''}`}>
        <div className="team-panel-head">
          <span className="team-panel-name">{team.name}</span>
          <span className="team-panel-score">
            {side === 'home' ? state.current.home : state.current.away}
          </span>
        </div>
        <PlayerSelector team={team} selected={sel} onSelect={setSel} />
        <ActionGrid
          onAction={(type) => handleAction(side, type)}
          disabled={state.isMatchOver}
        />
      </section>
    );
  }

  return (
    <div className="screen live">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={onExit}>
          ‹ {cs.back}
        </button>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={redo} disabled={!canRedo}>
            ↻ {cs.redo}
          </button>
          <button className="btn btn-undo" onClick={undo} disabled={!canUndo}>
            ↺ {cs.undo}
          </button>
        </div>
      </header>

      <Scoreboard match={match} state={state} />
      <ServerIndicator match={match} state={state} />

      <main className="live-body">
        {teamPanel('home')}
        {teamPanel('away')}
      </main>

      <footer className="live-footer">
        <button className="btn btn-ghost" onClick={() => setAskEnd(true)}>
          {cs.endMatch}
        </button>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      {state.isMatchOver && (
        <ConfirmModal
          title={cs.matchOver}
          message={`${cs.winner}: ${
            state.matchWinner ? match.teams[state.matchWinner].name : ''
          } (${state.setsWon.home}:${state.setsWon.away})`}
          confirmLabel={cs.matchDetailTitle}
          cancelLabel={cs.history}
          onConfirm={() => onFinish(match.id)}
          onCancel={onExit}
        />
      )}

      {askEnd && !state.isMatchOver && (
        <ConfirmModal
          title={cs.endMatch}
          message={cs.endMatchConfirm}
          onConfirm={async () => {
            await flush({ finishedAt: Date.now() });
            onFinish(match.id);
          }}
          onCancel={() => setAskEnd(false)}
        />
      )}
    </div>
  );
}
