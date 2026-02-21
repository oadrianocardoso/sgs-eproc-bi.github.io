import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('./pages/StatsPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const UploadPage = React.lazy(() => import('./pages/UploadPage'));

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <React.Suspense fallback={<div className="flex items-center justify-center h-full">Carregando Dashboard...</div>}>
                <DashboardPage />
              </React.Suspense>
            }
          />
          <Route
            path="/search"
            element={
              <React.Suspense fallback={<div className="flex items-center justify-center h-full">Carregando Pesquisa...</div>}>
                <SearchPage />
              </React.Suspense>
            }
          />
          <Route
            path="/upload"
            element={
              <React.Suspense fallback={<div className="flex items-center justify-center h-full">Carregando Upload...</div>}>
                <UploadPage />
              </React.Suspense>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
