import { useState } from 'react';
import { SetupScreen } from './screens/SetupScreen';
import { LiveScreen } from './screens/LiveScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { MatchDetailScreen } from './screens/MatchDetailScreen';
import type { Match } from './domain/types';

type Route =
  | { name: 'setup' }
  | { name: 'live'; match: Match }
  | { name: 'history' }
  | { name: 'detail'; matchId: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'setup' });

  switch (route.name) {
    case 'setup':
      return (
        <SetupScreen
          onStart={(match) => setRoute({ name: 'live', match })}
          onOpenHistory={() => setRoute({ name: 'history' })}
        />
      );
    case 'live':
      return (
        <LiveScreen
          initial={route.match}
          onFinish={(matchId) => setRoute({ name: 'detail', matchId })}
          onExit={() => setRoute({ name: 'history' })}
        />
      );
    case 'history':
      return (
        <HistoryScreen
          onOpen={(matchId) => setRoute({ name: 'detail', matchId })}
          onBack={() => setRoute({ name: 'setup' })}
        />
      );
    case 'detail':
      return (
        <MatchDetailScreen
          matchId={route.matchId}
          onBack={() => setRoute({ name: 'history' })}
        />
      );
  }
}
