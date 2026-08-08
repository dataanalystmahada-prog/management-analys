/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeContext';
import { Layout } from './components/Layout';
import Bismillah from './pages/Bismillah';
import Alhamdulillah from './pages/Alhamdulillah';
import Settings from './pages/Settings';
import { AnalyticsLayout } from './components/analytics/AnalyticsLayout';
import Overview from './pages/analisis/Overview';
import LeadAnalysis from './pages/analisis/bismillah/LeadAnalysis';
import ConversionAnalysis from './pages/analisis/bismillah/ConversionAnalysis';
import SalesPerformance from './pages/analisis/bismillah/SalesPerformance';
import SourceAnalysis from './pages/analisis/bismillah/SourceAnalysis';
import ProductAnalysis from './pages/analisis/bismillah/ProductAnalysis';
import FollowUpAnalysis from './pages/analisis/bismillah/FollowUpAnalysis';

import SalesAnalysis from './pages/analisis/alhamdulillah/SalesAnalysis';
import AlhamProductAnalysis from './pages/analisis/alhamdulillah/ProductAnalysis';
import CustomerAnalysis from './pages/analisis/alhamdulillah/CustomerAnalysis';
import SalesPerformanceAlham from './pages/analisis/alhamdulillah/SalesPerformance';
import ProductionAnalysis from './pages/analisis/alhamdulillah/ProductionAnalysis';
import OrderAnalysis from './pages/analisis/alhamdulillah/OrderAnalysis';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/analisis/overview" replace />} />
            <Route path="bismillah" element={<Bismillah />} />
            <Route path="alhamdulillah" element={<Alhamdulillah />} />

            <Route path="analisis" element={<AnalyticsLayout />}>
              <Route path="overview" element={<Overview />} />

              <Route path="bismillah/lead" element={<LeadAnalysis />} />
              <Route path="bismillah/conversion" element={<ConversionAnalysis />} />
              <Route path="bismillah/sales" element={<SalesPerformance />} />
              <Route path="bismillah/source" element={<SourceAnalysis />} />
              <Route path="bismillah/product" element={<ProductAnalysis />} />
              <Route path="bismillah/followup" element={<FollowUpAnalysis />} />

              <Route path="alhamdulillah/sales" element={<SalesAnalysis />} />
              <Route path="alhamdulillah/product" element={<AlhamProductAnalysis />} />
              <Route path="alhamdulillah/customer" element={<CustomerAnalysis />} />
              <Route path="alhamdulillah/performance" element={<SalesPerformanceAlham />} />
              <Route path="alhamdulillah/production" element={<ProductionAnalysis />} />
              <Route path="alhamdulillah/order" element={<OrderAnalysis />} />
            </Route>

            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
