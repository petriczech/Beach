import { computeMatchState } from '../domain/scoring';
import { computeStats, type PlayerStats } from '../domain/stats';
import type { Match, PlayerSlot, TeamSide } from '../domain/types';

function triggerDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeName(s: string): string {
  return s.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40) || 'zapas';
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function statRow(name: string, st: PlayerStats): (string | number)[] {
  return [
    name,
    st.aces,
    st.serveErrors,
    st.kills,
    st.attackErrors,
    st.blocks,
    st.receptionErrors,
    st.netTouches,
    st.pointsScored,
    st.errorsCommitted,
  ];
}

export function matchToCsv(match: Match): string {
  const state = computeMatchState(match);
  const stats = computeStats(match);
  const lines: string[] = [];

  const setScores = state.sets
    .map((s) => `${s.home}:${s.away}`)
    .join(' / ');
  lines.push(['Zápas', `${match.teams.home.name} vs ${match.teams.away.name}`].map(csvCell).join(';'));
  lines.push(['Datum', new Date(match.createdAt).toLocaleString('cs-CZ')].map(csvCell).join(';'));
  lines.push(['Sety', `${state.setsWon.home}:${state.setsWon.away}`].map(csvCell).join(';'));
  lines.push(['Skóre setů', setScores].map(csvCell).join(';'));
  lines.push('');

  const header = [
    'Tým',
    'Hráč',
    'Esa',
    'Chyby podání',
    'Útoky',
    'Chyby útoku',
    'Bloky',
    'Chyby příjmu',
    'Pásky',
    'Body',
    'Chyby celkem',
  ];
  lines.push(header.map(csvCell).join(';'));

  (['home', 'away'] as TeamSide[]).forEach((side) => {
    const team = match.teams[side];
    ([1, 2] as PlayerSlot[]).forEach((slot) => {
      const p = team.players[slot - 1];
      lines.push(
        [team.name, ...statRow(p.name, stats[side].perPlayer[slot])]
          .map(csvCell)
          .join(';'),
      );
    });
    lines.push(
      [team.name, ...statRow('Celý tým', stats[side].team)].map(csvCell).join(';'),
    );
  });

  return lines.join('\n');
}

export function exportCsv(match: Match): void {
  const name = `${safeName(match.teams.home.name)}-${safeName(match.teams.away.name)}`;
  // BOM kvůli správné diakritice v Excelu
  triggerDownload(`zapas-${name}.csv`, '﻿' + matchToCsv(match), 'text/csv;charset=utf-8');
}

export function exportJson(match: Match): void {
  const name = `${safeName(match.teams.home.name)}-${safeName(match.teams.away.name)}`;
  triggerDownload(
    `zapas-${name}.json`,
    JSON.stringify(match, null, 2),
    'application/json',
  );
}
