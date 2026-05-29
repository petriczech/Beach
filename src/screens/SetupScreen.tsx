import { useState } from 'react';
import { cs } from '../i18n/cs';
import {
  DEFAULT_RULES,
  type Match,
  type PlayerSlot,
  type TeamSide,
} from '../domain/types';

interface Props {
  onStart: (match: Match) => void;
  onOpenHistory: () => void;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function SetupScreen({ onStart, onOpenHistory }: Props) {
  const [homeName, setHomeName] = useState('Domácí');
  const [awayName, setAwayName] = useState('Hosté');
  const [home1, setHome1] = useState('');
  const [home2, setHome2] = useState('');
  const [away1, setAway1] = useState('');
  const [away2, setAway2] = useState('');
  const [pointsRegular, setPointsRegular] = useState(DEFAULT_RULES.pointsRegular);
  const [pointsDeciding, setPointsDeciding] = useState(DEFAULT_RULES.pointsDeciding);
  const [serveTeam, setServeTeam] = useState<TeamSide>('home');
  const [servePlayer, setServePlayer] = useState<PlayerSlot>(1);
  const [showRules, setShowRules] = useState(false);

  function start() {
    const match: Match = {
      id: newId(),
      createdAt: Date.now(),
      teams: {
        home: {
          side: 'home',
          name: homeName.trim() || 'Domácí',
          players: [
            { slot: 1, name: home1.trim() || `${cs.player1}` },
            { slot: 2, name: home2.trim() || `${cs.player2}` },
          ],
        },
        away: {
          side: 'away',
          name: awayName.trim() || 'Hosté',
          players: [
            { slot: 1, name: away1.trim() || `${cs.player1}` },
            { slot: 2, name: away2.trim() || `${cs.player2}` },
          ],
        },
      },
      rules: {
        ...DEFAULT_RULES,
        pointsRegular,
        pointsDeciding,
        firstServe: { team: serveTeam, player: servePlayer },
      },
      events: [],
    };
    onStart(match);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <h1>{cs.appName}</h1>
        <button className="btn btn-ghost" onClick={onOpenHistory}>
          {cs.history}
        </button>
      </header>

      <main className="setup">
        <section className="card">
          <label className="field">
            <span>{cs.teamHome}</span>
            <input value={homeName} onChange={(e) => setHomeName(e.target.value)} />
          </label>
          <div className="field-row">
            <input
              placeholder={cs.player1}
              value={home1}
              onChange={(e) => setHome1(e.target.value)}
            />
            <input
              placeholder={cs.player2}
              value={home2}
              onChange={(e) => setHome2(e.target.value)}
            />
          </div>
        </section>

        <section className="card">
          <label className="field">
            <span>{cs.teamAway}</span>
            <input value={awayName} onChange={(e) => setAwayName(e.target.value)} />
          </label>
          <div className="field-row">
            <input
              placeholder={cs.player1}
              value={away1}
              onChange={(e) => setAway1(e.target.value)}
            />
            <input
              placeholder={cs.player2}
              value={away2}
              onChange={(e) => setAway2(e.target.value)}
            />
          </div>
        </section>

        <section className="card">
          <label className="field">
            <span>{cs.whoServesFirst}</span>
            <div className="player-selector">
              <button
                className={`chip ${serveTeam === 'home' ? 'chip-active' : ''}`}
                onClick={() => setServeTeam('home')}
              >
                {homeName}
              </button>
              <button
                className={`chip ${serveTeam === 'away' ? 'chip-active' : ''}`}
                onClick={() => setServeTeam('away')}
              >
                {awayName}
              </button>
            </div>
          </label>
          <div className="player-selector">
            <button
              className={`chip ${servePlayer === 1 ? 'chip-active' : ''}`}
              onClick={() => setServePlayer(1)}
            >
              {cs.player1}
            </button>
            <button
              className={`chip ${servePlayer === 2 ? 'chip-active' : ''}`}
              onClick={() => setServePlayer(2)}
            >
              {cs.player2}
            </button>
          </div>
        </section>

        <section className="card">
          <button
            className="btn btn-ghost collapse-toggle"
            onClick={() => setShowRules((v) => !v)}
          >
            {cs.rules} {showRules ? '▲' : '▼'}
          </button>
          {showRules && (
            <div className="field-row">
              <label className="field">
                <span>{cs.pointsRegular}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={pointsRegular}
                  onChange={(e) => setPointsRegular(Number(e.target.value) || 0)}
                />
              </label>
              <label className="field">
                <span>{cs.pointsDeciding}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={pointsDeciding}
                  onChange={(e) => setPointsDeciding(Number(e.target.value) || 0)}
                />
              </label>
            </div>
          )}
        </section>

        <button className="btn btn-primary btn-large" onClick={start}>
          {cs.startMatch}
        </button>
      </main>
    </div>
  );
}
