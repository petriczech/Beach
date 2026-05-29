import type { Attribution, EventType, Match, MatchEvent, TeamSide } from './types';

export interface MatchSession {
  match: Match;
  /** Dočasný zásobník pro REDO (neukládá se). */
  redoStack: MatchEvent[];
}

export type MatchAction =
  | { kind: 'RECORD'; type: EventType; team: TeamSide; player: Attribution }
  | { kind: 'UNDO' }
  | { kind: 'REDO' }
  | { kind: 'LOAD'; match: Match };

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function matchReducer(state: MatchSession, action: MatchAction): MatchSession {
  switch (action.kind) {
    case 'RECORD': {
      const event: MatchEvent = {
        id: newId(),
        ts: Date.now(),
        type: action.type,
        team: action.team,
        player: action.player,
      };
      return {
        match: { ...state.match, events: [...state.match.events, event] },
        redoStack: [], // nová akce zruší možnost redo
      };
    }
    case 'UNDO': {
      if (state.match.events.length === 0) return state;
      const events = state.match.events.slice(0, -1);
      const undone = state.match.events[state.match.events.length - 1];
      return {
        match: { ...state.match, events, finishedAt: undefined },
        redoStack: [...state.redoStack, undone],
      };
    }
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const redo = state.redoStack[state.redoStack.length - 1];
      return {
        match: { ...state.match, events: [...state.match.events, redo] },
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case 'LOAD':
      return { match: action.match, redoStack: [] };
  }
}
