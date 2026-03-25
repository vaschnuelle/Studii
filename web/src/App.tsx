import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuthPage } from './pages/AuthPage';
import { FocusPage } from './pages/FocusPage';
import { FriendsPage } from './pages/FriendsPage';
import { HomePage } from './pages/HomePage';

/**
 * Top-level routes for the Studii Phase 1 web shell.
 */
function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
