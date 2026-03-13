/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import KitchenDashboard from './pages/KitchenDashboard';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AIChat from './components/AIChat';
import ErrorBoundary from './components/ErrorBoundary';
import { UserProvider } from './contexts/UserContext';

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Layout>
          <AIChat />
        </Router>
      </UserProvider>
    </ErrorBoundary>
  );
}
