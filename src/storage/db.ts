import { del, get, keys, set } from 'idb-keyval';
import type { Match } from '../domain/types';

const PREFIX = 'match:';

function keyFor(id: string): string {
  return `${PREFIX}${id}`;
}

export async function saveMatch(match: Match): Promise<void> {
  await set(keyFor(match.id), match);
}

export async function loadMatch(id: string): Promise<Match | undefined> {
  return get<Match>(keyFor(id));
}

export async function deleteMatch(id: string): Promise<void> {
  await del(keyFor(id));
}

export async function listMatches(): Promise<Match[]> {
  const allKeys = await keys();
  const matchKeys = allKeys.filter(
    (k): k is string => typeof k === 'string' && k.startsWith(PREFIX),
  );
  const matches = await Promise.all(matchKeys.map((k) => get<Match>(k)));
  return matches
    .filter((m): m is Match => Boolean(m))
    .sort((a, b) => b.createdAt - a.createdAt);
}
