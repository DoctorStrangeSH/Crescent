// Файл: src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AddGameModal from './components/forms/AddGameModal';
import CollectionPage from './components/collection/CollectionPage';
import DashboardPage from './components/dashboard/DashboardPage';
import SeriesDetailPage from './components/series/SeriesDetailPage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
        </Routes>
      </AppLayout>
      <AddGameModal />
    </BrowserRouter>
  );
}

export default App;