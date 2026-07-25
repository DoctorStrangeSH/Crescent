// Файл: src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AddGameModal from './components/forms/AddGameModal';
import CollectionPage from './components/collection/CollectionPage';
import DashboardPage from './components/dashboard/DashboardPage';
import SeriesDetailPage from './components/series/SeriesDetailPage';
import SharedPage from './components/pages/SharedPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичная страница — без лаута */}
        <Route path="/shared" element={<SharedPage />} />

        {/* Основное приложение */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
      <AddGameModal />
    </BrowserRouter>
  );
}

export default App;