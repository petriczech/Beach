import { EVENT_DEFS } from '../domain/taxonomy';
import type { EventType } from '../domain/types';

interface Props {
  onAction: (type: EventType) => void;
  disabled?: boolean;
}

/** Mřížka velkých tlačítek herních akcí. Barva podle skupiny. */
export function ActionGrid({ onAction, disabled }: Props) {
  return (
    <div className="action-grid">
      {EVENT_DEFS.map((def) => (
        <button
          key={def.type}
          className={`action-btn action-${def.group}`}
          onClick={() => onAction(def.type)}
          disabled={disabled}
        >
          {def.label}
        </button>
      ))}
    </div>
  );
}
