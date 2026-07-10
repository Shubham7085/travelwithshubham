import React from 'react';
import { useParams } from 'react-router-dom';

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" id="trip-details-container">
      <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-[#00E5FF] mb-4">
        Trip Details
      </h1>
      <p className="text-gray-400 max-w-2xl mb-8">
        Detailed adventure logs, curated routes, and collections from this expedition.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md max-w-md">
        <p className="text-white/60 mb-2">Viewing trip with ID: <span className="font-mono text-[#00E5FF]">{id}</span></p>
        <span className="text-xs font-mono text-gray-500">Milestone 2 Configured</span>
      </div>
    </div>
  );
}
