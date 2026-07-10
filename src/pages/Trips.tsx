import React from 'react';

export default function Trips() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" id="trips-page-container">
      <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-[#00E5FF] mb-4">
        My Journeys
      </h1>
      <p className="text-gray-400 max-w-2xl mb-8">
        Browse and follow my travels through mountains, deserts, and beaches of India.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center max-w-md">
        <p className="text-white/60 mb-2">Trips overview dashboard will list all travels in high resolution.</p>
        <span className="text-xs font-mono text-gray-500">Milestone 2 Configured</span>
      </div>
    </div>
  );
}
