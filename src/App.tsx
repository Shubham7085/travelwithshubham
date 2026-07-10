import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './firebase/context';
import { 
  Home as HomeIcon, 
  Compass, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  User as UserIcon, 
  Mail, 
  Settings, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

// Page Imports
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Navigation layout wrapper
function PageLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: HomeIcon },
    { label: 'Trips', path: '/trips', icon: Compass },
    { label: 'Gallery', path: '/gallery', icon: ImageIcon },
    { label: 'Videos', path: '/videos', icon: VideoIcon },
    { label: 'About', path: '/about', icon: UserIcon },
    { label: 'Contact', path: '/contact', icon: Mail },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-[#050816] text-gray-100 flex flex-col selection:bg-[#00E5FF]/30 selection:text-white">
      {/* 1. Desktop Top Header (Hidden on mobile if desired, styled elegantly) */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-16 md:h-20 flex items-center px-4 md:px-8 justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#00B0FF] flex items-center justify-center text-[#050816] font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold tracking-tight text-white block text-sm md:text-base leading-none">
              Travel With Shubham
            </span>
            <span className="text-[10px] font-mono text-[#00E5FF] tracking-widest uppercase">
              INDIA PORTFOLIO
            </span>
          </div>
        </Link>

        {/* Desktop navbar links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
                  isActive 
                    ? 'text-[#00E5FF] bg-white/5 border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.15)] font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          <Link
            to={user && isAdmin ? '/admin' : '/login'}
            className={`p-2.5 rounded-xl transition-all duration-300 ml-2 border ${
              currentPath === '/admin' || currentPath === '/login'
                ? 'text-[#00E5FF] bg-white/5 border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
            }`}
            title="Admin Panel"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </nav>

        {/* Small screen menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to={user && isAdmin ? '/admin' : '/login'}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              currentPath === '/admin' || currentPath === '/login' ? 'text-[#00E5FF]' : 'text-gray-400'
            }`}
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-gray-400 hover:text-white rounded-xl bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Side Panel overlay for mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-[#050816]/95 border-l border-white/10 z-50 p-6 flex flex-col justify-between backdrop-blur-xl md:hidden"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="font-bold font-display text-white">Menu</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? 'text-[#00E5FF] bg-white/5 font-semibold' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-white/5 pt-4 text-center">
                <span className="text-[10px] font-mono text-gray-500 tracking-widest">
                  SHUBHAM PORTFOLIO v1.0
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Content Container */}
      <main className="flex-grow pt-16 md:pt-20 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Touch-Friendly Bottom Floating Navigation for Mobile Users */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden flex justify-center">
        <nav className="flex items-center justify-around w-full max-w-sm px-3 py-2 bg-[#050816]/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(0,229,255,0.12)]">
          {navItems.slice(0, 4).map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-[#00E5FF]' : 'text-gray-400 active:scale-95'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute inset-0 bg-[#00E5FF]/10 rounded-xl border border-[#00E5FF]/20 -z-10 shadow-[0_0_12px_rgba(0,229,255,0.1)]"
                  />
                )}
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium tracking-tight leading-none">{item.label}</span>
              </Link>
            );
          })}
          
          <Link
            to={user && isAdmin ? '/admin' : '/login'}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-xl transition-all duration-300 relative ${
              currentPath === '/admin' || currentPath === '/login' ? 'text-[#00E5FF]' : 'text-gray-400 active:scale-95'
            }`}
          >
            {(currentPath === '/admin' || currentPath === '/login') && (
              <motion.div
                layoutId="active-nav-glow"
                className="absolute inset-0 bg-[#00E5FF]/10 rounded-xl border border-[#00E5FF]/20 -z-10 shadow-[0_0_12px_rgba(0,229,255,0.1)]"
              />
            )}
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-medium tracking-tight leading-none">Admin</span>
          </Link>
        </nav>
      </div>

      {/* 5. Minimal Elegant Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-gray-500 font-sans mt-auto">
        <p className="mb-2">© {new Date().getFullYear()} Travel With Shubham. All rights reserved.</p>
        <p className="text-[10px] font-mono tracking-widest text-[#00E5FF]/60 uppercase">
          Explore India, One Journey At A Time.
        </p>
      </footer>
    </div>
  );
}

function MainRoutes() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
