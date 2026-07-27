import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Explore } from './pages/Explore';
import { News } from './pages/News';
import { Groups } from './pages/Groups';
import { GroupDetail } from './pages/GroupDetail';
import { BetDetail } from './pages/BetDetail';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/explore" element={<Explore />} />
            <Route path="/news" element={<News />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/bets/:id" element={<BetDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          {/* Default Route: Go to Global Public Polymarket Exchange */}
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
