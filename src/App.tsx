import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AddGameModal from './components/forms/AddGameModal';
import CollectionPage from './components/collection/CollectionPage';
import GameDetailPage from './components/game/GameDetailPage';
import DashboardPage from './components/dashboard/DashboardPage';

function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:gameId" element={<GameDetailPage />} />
        </Routes>
      </AppLayout>
      <AddGameModal />
    </HashRouter>
  );
}

export default App;