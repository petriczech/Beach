import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  matchReducer,
  type MatchAction,
  type MatchSession,
} from '../domain/reducer';
import { computeMatchState } from '../domain/scoring';
import { computeStats } from '../domain/stats';
import { saveMatch } from '../storage/db';
import type { Match } from '../domain/types';

/**
 * Spravuje živý zápas přes reducer a po každé změně ho (debounced) ukládá
 * do IndexedDB, aby přežil zamčení/refresh telefonu.
 */
export function useMatch(initial: Match) {
  const [session, dispatch] = useReducer(matchReducer, {
    match: initial,
    redoStack: [],
  } as MatchSession);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveMatch(session.match);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [session.match]);

  const state = useMemo(() => computeMatchState(session.match), [session.match]);
  const stats = useMemo(() => computeStats(session.match), [session.match]);

  const record = useCallback(
    (action: Extract<MatchAction, { kind: 'RECORD' }>) => dispatch(action),
    [],
  );
  const undo = useCallback(() => dispatch({ kind: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ kind: 'REDO' }), []);

  /** Uloží okamžitě (např. při ukončení zápasu). */
  const flush = useCallback(
    async (patch?: Partial<Match>) => {
      const toSave = patch ? { ...session.match, ...patch } : session.match;
      await saveMatch(toSave);
      return toSave;
    },
    [session.match],
  );

  return {
    match: session.match,
    state,
    stats,
    canUndo: session.match.events.length > 0,
    canRedo: session.redoStack.length > 0,
    record,
    undo,
    redo,
    flush,
  };
}
