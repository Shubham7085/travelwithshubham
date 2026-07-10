import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 px-4 flex flex-col items-center justify-center min-h-[80vh] text-center" id="not-found-page">
      <div className="w-20 h-20 bg-[#00E5FF]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Compass className="w-10 h-10 text-[#00E5FF] animate-[spin_8s_linear_infinite]" />
      </div>

      <h1 className="text-6xl md:text-8xl font-sans font-bold text-white mb-4">404</h1>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">Lost in the Wilderness</h2>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
        The route you are trying to explore doesn't exist on this expedition trail. Let's head back to safe basecamp.
      </p>

      <button
        onClick={() => navigate('/')}
        className="py-3.5 px-6 bg-[#00E5FF] hover:opacity-95 active:scale-[0.98] transition-all text-[#050816] font-semibold rounded-xl flex items-center gap-2 shadow-[0_4px_20px_rgba(0,229,255,0.2)]"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </button>
    </div>
  );
}
