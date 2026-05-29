import { useCallback, useEffect, useState } from 'react';
import { deleteMatch as dbDelete, listMatches } from '../storage/db';
import type { Match } from '../domain/types';

/** Načítá a spravuje seznam uložených zápasů pro obrazovku historie. */
export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setMatches(await listMatches());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await dbDelete(id);
      await refresh();
    },
    [refresh],
  );

  return { matches, loading, refresh, remove };
}
