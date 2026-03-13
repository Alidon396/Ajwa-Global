/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import LeadDashboard from './pages/LeadDashboard';
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
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/leads" element={<LeadDashboard />} />
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
