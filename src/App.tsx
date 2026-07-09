import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layout/MainLayout';
import Loader from './components/common/Loader';

// Lazy loading for performance and code-splitting
const Home = lazy(() => import('./pages/Home'));
const Trips = lazy(() => import('./pages/Trips'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/gallery" element={<Gallery />} />
        </Route>
        {/* Admin requires separate layout/protection */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
