import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Search, 
  MapPin, 
  ChevronRight, 
  ArrowRight, 
  Camera, 
  Video as VideoIcon, 
  Calendar,
  Mountain,
  Snowflake,
  Car,
  Flame,
  Landmark,
  Palmtree,
  Waves,
  Trees,
  Mail,
  ArrowUp,
  Sparkles,
  Info
} from 'lucide-react';

import { getTrips, getPhotos, getStats } from '../firebase/services';
import { INITIAL_TRIPS, INITIAL_PHOTOS, INITIAL_STATS } from '../data';
import { Trip, Photo, Stats } from '../types';

import Counter from '../components/Counter';
import ScrollReveal from '../components/ScrollReveal';
import FeaturedTripCard from '../components/FeaturedTripCard';
import CategoryCard from '../components/CategoryCard';

// Highly aesthetic pre-defined featured items to guarantee Manali, Gangtok, Darjeeling and Meghalaya
const FEATURED_DESTINATION_TRIPS: Trip[] = [
  {
    id: 'manali-solang-2026',
    title: 'Solitude of Manali & Rohtang Pass',
    description: 'Chasing crisp pine forest air, snow-covered Solang slopes, whispering Beas riverbanks, and high altitude panoramic views of Rohtang Pass.',
    location: 'Manali, Himachal Pradesh',
    duration: '6 Days',
    startDate: '2026-04-10',
    coverImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    photosCount: 22,
    videosCount: 5,
    state: 'Himachal Pradesh',
    distance: 550,
    tags: ['Snow', 'Pine Forests', 'Rivers', 'Himachal']
  },
  {
    id: 'sikkim-gangtok-2025',
    title: 'High Passes of Sikkim & Gangtok',
    description: 'Chasing clouds across Eastern India. From the vibrant streets of Gangtok to the dramatic, winding roads of Nathu La Pass and Gurudongmar Lake.',
    location: 'Gangtok & Gurudongmar, Sikkim',
    duration: '9 Days',
    startDate: '2025-05-04',
    coverImage: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    photosCount: 32,
    videosCount: 8,
    state: 'Sikkim',
    distance: 950,
    tags: ['High Altitude', 'Lakes', 'Border Land', 'Buddhist']
  },
  {
    id: 'darjeeling-tea-gardens-2024',
    title: 'Vintage Darjeeling Slopes',
    description: 'Chasing the iconic Himalayan Toy Train through mist-covered tea gardens and catching the sunrise over Mount Kanchenjunga from Tiger Hill.',
    location: 'Darjeeling, West Bengal',
    duration: '5 Days',
    startDate: '2024-12-05',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    photosCount: 20,
    videosCount: 4,
    state: 'West Bengal',
    distance: 400,
    tags: ['Tea Gardens', 'Heritage Train', 'Sunrise', 'Cozy']
  },
  {
    id: 'meghalaya-abode-of-clouds-2025',
    title: 'Meghalaya: Abode of Clouds',
    description: 'Hiking through the wettest place on Earth. Exploring the ancient Living Root Bridges of Cherrapunji and swimming in the crystal clear glass waters of Umngot River.',
    location: 'Shillong & Cherrapunji, Meghalaya',
    duration: '7 Days',
    startDate: '2025-08-11',
    coverImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    photosCount: 28,
    videosCount: 5,
    state: 'Meghalaya',
    distance: 600,
    tags: ['Monsoon', 'Root Bridges', 'Waterfalls', 'Caves']
  }
];

export default function Home() {
  const navigate = useNavigate();
  
  // Data State
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  // Search and filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load Firestore data safely
  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedTrips, fetchedPhotos, fetchedStats] = await Promise.all([
          getTrips(),
          getPhotos(),
          getStats()
        ]);
        
        if (fetchedTrips && fetchedTrips.length > 0) {
          // Merge custom trips into base to keep it dynamic while guaranteeing our requested featured list
          setTrips(fetchedTrips);
        }
        if (fetchedPhotos && fetchedPhotos.length > 0) setPhotos(fetchedPhotos);
        if (fetchedStats) setStats(fetchedStats);
      } catch (error) {
        console.warn("Using local fallback data in offline or unseeded mode:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle instant live search filtering
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    
    // Combine loaded trips + featured list for a comprehensive search lookup
    const allKnownTrips = [...trips, ...FEATURED_DESTINATION_TRIPS];
    const uniqueTrips = allKnownTrips.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const filtered = uniqueTrips.filter(
      trip => 
        trip.title.toLowerCase().includes(query) ||
        trip.location.toLowerCase().includes(query) ||
        trip.state.toLowerCase().includes(query) ||
        trip.tags.some(tag => tag.toLowerCase().includes(query))
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, trips]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trips?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (tag: string) => {
    setSearchQuery(tag);
    navigate(`/trips?search=${encodeURIComponent(tag)}`);
  };

  // Scroll to Top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Static Categories matching icons dynamically
  const categories = [
    { title: 'Mountains', icon: 'Mountain' as const, count: 5 },
    { title: 'Snow', icon: 'Snowflake' as const, count: 3 },
    { title: 'Road Trips', icon: 'Car' as const, count: 4 },
    { title: 'Adventure', icon: 'Flame' as const, count: 6 },
    { title: 'Temple', icon: 'Landmark' as const, count: 2 },
    { title: 'Beach', icon: 'Palmtree' as const, count: 3 },
    { title: 'Waterfalls', icon: 'Waves' as const, count: 4 },
    { title: 'Forest', icon: 'Trees' as const, count: 3 },
  ];

  return (
    <div className="bg-[#050816] min-h-screen relative overflow-hidden" id="homepage-root">
      
      {/* SECTION 1: FULLSCREEN CINEMATIC HERO (100vh) */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden" id="hero-section">
        {/* Background Ken Burns Zoom Animation */}
        <div className="absolute inset-0 z-0 select-none">
          {/* Multiple layers of overlay to optimize text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-[#050816] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050816_90%)] z-10" />
          
          <motion.img
            src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=90"
            alt="Cinematic Himalayan Mountain Peaks Backdrop"
            referrerPolicy="no-referrer"
            initial={{ scale: 1.15, filter: 'brightness(0.35)' }}
            animate={{ scale: 1.02, filter: 'brightness(0.45)' }}
            transition={{ duration: 18, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse' }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ambient background glowing particles/fogs */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#00E5FF]/5 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#00B0FF]/5 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Hero Content with Large Elegant Typography */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center items-center gap-2 mb-6"
          >
            <span className="w-8 h-[1.5px] bg-[#00E5FF]" />
            <span className="text-[#00E5FF] font-mono text-xs md:text-sm tracking-[0.35em] uppercase font-bold">
              Explore India
            </span>
            <span className="w-8 h-[1.5px] bg-[#00E5FF]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-[7.5rem] lg:text-[8.5rem] xl:text-[9.5rem] font-display font-black tracking-tighter leading-[0.85] text-white uppercase select-none mb-8"
          >
            One Journey <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00B0FF] to-[#00E5FF] drop-shadow-[0_0_25px_rgba(0,229,255,0.45)] bg-[size:200%] animate-gradient">
              At A Time
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.7 }}
            className="text-gray-300 text-sm sm:text-base md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed font-sans font-light"
          >
            Travel memories, adventures, mountains, waterfalls, hidden places and unforgettable experiences across India. Curated by Shubham.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link
              to="/trips"
              className="w-full sm:w-auto px-10 py-4.5 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-[#050816] font-extrabold rounded-2xl hover:opacity-95 hover:scale-[1.04] active:scale-[0.98] transition-all shadow-[0_5px_30px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider"
            >
              <Compass className="w-5 h-5 animate-spin-slow" />
              Explore My Journeys
            </Link>
            <Link
              to="/gallery"
              className="w-full sm:w-auto px-10 py-4.5 bg-white/5 border border-white/10 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2.5 backdrop-blur-xl shadow-lg text-sm uppercase tracking-wider"
            >
              <Camera className="w-5 h-5 text-gray-400" />
              View Gallery
            </Link>
          </motion.div>
        </div>

        {/* Animated Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
          <span className="text-[9px] font-mono uppercase text-gray-500 tracking-[0.3em] mb-2 animate-pulse">
            Scroll To Discover
          </span>
          <div className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_8px_#00E5FF]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: LUXURY GLASS SEARCH BAR */}
      <section className="relative z-30 px-4 -mt-14 max-w-4xl mx-auto" id="search-section">
        <ScrollReveal direction="up" delay={0.1}>
          <form
            onSubmit={handleSearchSubmit}
            className="p-3 bg-[#050816]/75 border border-white/10 rounded-[24px] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.08)] flex flex-col md:flex-row items-center gap-3 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 px-4 py-3 w-full border-b border-white/5 md:border-b-0">
              <Search className="w-5 h-5 text-[#00E5FF] flex-shrink-0 animate-pulse" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trip name, state (e.g. Sikkim, Spiti), location, tags..."
                className="bg-transparent text-white placeholder-gray-400 text-sm md:text-base outline-none w-full font-sans"
              />
            </div>
            
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-[#050816] font-bold rounded-xl text-sm flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 duration-200 shadow-md uppercase tracking-wider"
            >
              Find Adventures
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Search Suggestions & Results Popup */}
          <AnimatePresence>
            {(showSuggestions || searchQuery) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-3 p-4 bg-[#050816]/95 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-2xl z-50 overflow-hidden mx-4"
              >
                {searchResults.length > 0 ? (
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-2">Live Matching Trips</span>
                    <div className="space-y-2">
                      {searchResults.map((trip) => (
                        <Link 
                          key={trip.id} 
                          to={`/trips/${trip.id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <img src={trip.coverImage} alt={trip.title} className="w-10 h-10 object-cover rounded-lg" />
                            <div>
                              <span className="font-semibold text-white text-sm block">{trip.title}</span>
                              <span className="text-gray-400 text-xs flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#00E5FF]" /> {trip.location}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No exact matching expeditions. Press enter to browse search layout.
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-2">Popular Expeditions</span>
                    <div className="flex flex-wrap gap-2">
                      {['Spiti', 'Kashmir', 'Sikkim', 'Meghalaya', 'Goa', 'Tawang'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleSuggestionClick(tag)}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/20 border border-white/10 text-gray-300 hover:text-[#00E5FF] rounded-lg text-xs font-medium font-mono transition-all"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollReveal>
      </section>

      {/* SECTION 3: TRAVEL STATISTICS */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative" id="statistics-section">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest block mb-2 font-bold">Exploration Metrics</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white">Shubham's Travel Odyssey</h2>
            <div className="w-12 h-1 bg-[#00E5FF] mx-auto mt-4 rounded-full shadow-[0_0_10px_#00E5FF]" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center group hover:border-[#00E5FF]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300">
              <span className="text-3xl block mb-2">🏔</span>
              <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">Trips Done</p>
              <div className="text-2xl md:text-3xl font-bold">
                <Counter value={stats.trips} suffix="+" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center group hover:border-[#00E5FF]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300">
              <span className="text-3xl block mb-2">📍</span>
              <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">States</p>
              <div className="text-2xl md:text-3xl font-bold">
                <Counter value={stats.states} suffix="/28" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center group hover:border-[#00E5FF]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300">
              <span className="text-3xl block mb-2">📸</span>
              <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">Photos</p>
              <div className="text-2xl md:text-3xl font-bold">
                <Counter value={stats.photos} suffix="+" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center group hover:border-[#00E5FF]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300">
              <span className="text-3xl block mb-2">🎥</span>
              <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">Videos</p>
              <div className="text-2xl md:text-3xl font-bold">
                <Counter value={stats.videos} suffix="+" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center group hover:border-[#00E5FF]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300">
              <span className="text-3xl block mb-2">🚆</span>
              <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">Distance</p>
              <div className="text-2xl md:text-3xl font-bold">
                <Counter value={stats.distance} suffix=" km" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-center group hover:border-[#00E5FF]/30 hover:shadow-[0_0_20px_rgba(0,229,255,0.05)] transition-all duration-300">
              <span className="text-3xl block mb-2">🗓</span>
              <p className="text-gray-400 text-[10px] font-mono uppercase tracking-wider mb-1">Exploring</p>
              <div className="text-2xl md:text-3xl font-bold">
                <Counter value={stats.yearsExploring} suffix=" Yrs" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 4: FEATURED DESTINATIONS (Guarantees Manali, Gangtok, Darjeeling, Meghalaya) */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative" id="featured-destinations">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest block mb-2 font-bold">Luxury Collection</span>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white">Featured Destinations</h2>
            </div>
            <Link 
              to="/trips" 
              className="text-gray-400 hover:text-[#00E5FF] text-sm font-semibold flex items-center gap-1.5 transition-colors mt-4 md:mt-0 group"
            >
              See All Expeditions 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trips Grid showing the exact Manali, Gangtok, Darjeeling and Meghalaya items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_DESTINATION_TRIPS.map((trip) => (
              <FeaturedTripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 5: EXPLORE CATEGORIES */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative" id="explore-categories">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest block mb-2 font-bold">Expedition Types</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white">Chasing the Geography</h2>
            <div className="w-12 h-1 bg-[#00E5FF] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <CategoryCard
                key={idx}
                iconName={cat.icon}
                title={cat.title}
                count={cat.count}
                onClick={() => handleSuggestionClick(cat.title)}
              />
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 6: LATEST MEMORIES */}
      <section className="py-24 bg-white/[0.01] border-y border-white/5 relative" id="latest-memories">
        <ScrollReveal direction="up">
          <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest block mb-2 font-bold">Unedited Snapshots</span>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white">Latest Memories</h2>
            </div>
            <Link 
              to="/gallery" 
              className="text-gray-400 hover:text-[#00E5FF] text-sm font-semibold flex items-center gap-1.5 transition-colors mt-4 md:mt-0 group"
            >
              Enter Full Photo Gallery 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Horizontal Scroller */}
          <div className="w-full overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-white/10">
            <div className="flex gap-6 px-6 min-w-max">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  whileHover={{ y: -6 }}
                  className="w-80 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md p-4 group cursor-pointer"
                  onClick={() => navigate('/gallery')}
                >
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-4">
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/55 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/5">
                      <MapPin className="w-3 h-3 text-[#00E5FF]" />
                      {photo.location.split(',')[0]}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block mb-1">
                      {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'June 2026'}
                    </span>
                    <p className="text-white text-sm font-medium line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 7: ABOUT ME */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative" id="about-me">
        <ScrollReveal direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Visual Column */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="absolute inset-0 bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative p-3 bg-white/5 border border-white/10 rounded-full w-72 h-72 md:w-96 md:h-96 flex items-center justify-center overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80" 
                  alt="Shubham Portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-700 brightness-95"
                />
                
                {/* Floating dynamic tags */}
                <div className="absolute bottom-6 bg-black/65 border border-white/10 backdrop-blur-md py-2 px-4 rounded-xl z-20 shadow-lg text-center flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-white tracking-wider uppercase font-semibold">Active Wanderer</span>
                </div>
              </div>
            </div>

            {/* Typography Column */}
            <div>
              <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest block mb-2 font-bold">Behind the Lens</span>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mb-6">Hello, I'm Shubham</h2>
              
              <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                <p>
                  I travel across India to capture beautiful landscapes, unforgettable moments and hidden destinations. Every journey tells a story, and this website is where I preserve those memories.
                </p>
                <p>
                  From the frozen high passes of Sela and Kunzum to the warm golden sands of offbeat Goa beaches, and the lush tea plantations of Gangtok and Darjeeling—my mission is to document India’s diverse geographical heritage in its purest visual form.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/20 border border-white/10 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all group"
                >
                  Know More About Me
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#00E5FF]" />
                </Link>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 8: NEWEST ENHANCED DETAILED FOOTER */}
      <footer className="border-t border-white/10 bg-black/40 relative z-10" id="detailed-footer">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Col 1: Brand details */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#00B0FF] flex items-center justify-center text-[#050816] font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold tracking-tight text-white text-lg">
                Travel With Shubham
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Explore India, One Journey At A Time. Experience luxury visual storytelling, offbeat hiking pathways, and raw landscapes captured across the Indian subcontinent.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="text-xs font-mono text-gray-500">ADMIN CERTIFIED:</span>
              <span className="text-xs text-[#00E5FF] font-mono select-all">shubhamnagvanshi84823@gmail.com</span>
            </div>
          </div>

          {/* Col 2: Navigation directories */}
          <div>
            <h4 className="text-white font-mono text-xs uppercase tracking-widest font-semibold mb-4">Trails Map</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="text-gray-400 hover:text-[#00E5FF] transition-colors">Home Base</Link></li>
              <li><Link to="/trips" className="text-gray-400 hover:text-[#00E5FF] transition-colors">Active Journeys</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-[#00E5FF] transition-colors">Pinterest Gallery</Link></li>
              <li><Link to="/videos" className="text-gray-400 hover:text-[#00E5FF] transition-colors">Immersive Videos</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-[#00E5FF] transition-colors">The Wanderer</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#00E5FF] transition-colors">Direct Signal</Link></li>
            </ul>
          </div>

          {/* Col 3: Interactive Signal Trigger */}
          <div>
            <h4 className="text-white font-mono text-xs uppercase tracking-widest font-semibold mb-4">Stay Synchronized</h4>
            <p className="text-gray-400 text-xs mb-3 leading-relaxed">
              Sign up for offbeat travel recommendations, detailed itinerary routes, and visual releases.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing, Shubham will sync with you!"); }} className="flex gap-1.5">
              <input 
                type="email" 
                required 
                placeholder="Enter email..." 
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#00E5FF]/40 w-full" 
              />
              <button type="submit" className="bg-[#00E5FF] hover:bg-[#00B0FF] text-[#050816] rounded-lg p-1.5 active:scale-95 transition-all">
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright segment */}
        <div className="border-t border-white/5 py-6 px-6 max-w-7xl mx-auto flex items-center justify-between text-[11px] text-gray-500">
          <span>© {new Date().getFullYear()} Travel With Shubham. India Exploration Records.</span>
          <button 
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00E5FF]/20 hover:text-[#00E5FF] transition-all flex items-center gap-1.5 group"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </footer>

    </div>
  );
}
