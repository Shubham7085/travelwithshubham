import React from 'react';

export default function About() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" id="about-page-container">
      <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-[#00E5FF] mb-4">
        About Shubham
      </h1>
      <p className="text-gray-400 max-w-2xl mb-8">
        Learn more about my exploration goals, cameras, and why I travel.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center max-w-md">
        <p className="text-white/60 mb-2">Profile and biography segment is configured.</p>
        <span className="text-xs font-mono text-gray-500">Milestone 2 Configured</span>
      </div>
    </div>
  );
}
