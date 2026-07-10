import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Calendar, Camera, Video, ArrowUpRight } from 'lucide-react';
import { Trip } from '../types';

interface FeaturedTripCardProps {
  trip: Trip;
}

export const FeaturedTripCard: React.FC<FeaturedTripCardProps> = ({ trip }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_45px_rgba(0,229,255,0.15)] hover:border-[#00E5FF]/30 transition-all duration-500 h-[480px] flex flex-col justify-end p-6"
    >
      {/* Background Image with Scale Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out brightness-[0.75] group-hover:brightness-[0.65]"
        />
        {/* Dynamic Gradient Shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050816]/50 to-transparent" />
      </div>

      {/* Card Content Overlay */}
      <div className="relative z-10 w-full">
        {/* State Tag */}
        <div className="flex justify-between items-center mb-4">
          <span className="px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-mono uppercase tracking-widest rounded-full">
            {trip.state}
          </span>
          <span className="text-gray-400 text-xs font-mono flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
            {trip.duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-display font-extrabold text-white mb-2 leading-tight tracking-tight group-hover:text-[#00E5FF] transition-colors duration-300">
          {trip.title}
        </h3>

        {/* Location Row */}
        <div className="flex items-center gap-1 text-gray-300 text-sm mb-4">
          <MapPin className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
          <span className="truncate">{trip.location}</span>
        </div>

        {/* Description Snippet */}
        <p className="text-gray-400 text-xs line-clamp-2 mb-6 group-hover:text-gray-300 transition-colors">
          {trip.description}
        </p>

        {/* Counters and Action Link */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono" title="Photos count">
              <Camera className="w-4 h-4 text-gray-500" />
              <span>{trip.photosCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono" title="Videos count">
              <Video className="w-4 h-4 text-gray-500" />
              <span>{trip.videosCount}</span>
            </div>
          </div>

          <Link
            to={`/trips/${trip.id}`}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#00E5FF] group-hover:border-[#00E5FF] group-hover:text-[#050816] flex items-center justify-center transition-all duration-300 text-white"
          >
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedTripCard;
