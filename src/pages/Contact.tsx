import React from 'react';

export default function Contact() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center" id="contact-page-container">
      <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-[#00E5FF] mb-4">
        Get In Touch
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto mb-8">
        Have questions about routes, permissions, photography gears, or collaboration? Leave a message.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md max-w-md mx-auto">
        <p className="text-white/60 mb-2">Social links and contact interface configured.</p>
        <span className="text-xs font-mono text-gray-500">Milestone 2 Configured</span>
      </div>
    </div>
  );
}
