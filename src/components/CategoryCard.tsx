import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  iconName: keyof typeof LucideIcons;
  title: string;
  count: number;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ iconName, title, count, onClick }) => {
  // Dynamically resolve icon from lucide-react safely
  const IconComponent = (LucideIcons[iconName] as React.ComponentType<{ className?: string }>) || LucideIcons.Compass;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="cursor-pointer group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-lg hover:border-[#00E5FF]/40 hover:shadow-[0_8px_24px_rgba(0,229,255,0.1)] transition-all duration-300"
    >
      {/* Background glow trail */}
      <div className="absolute -right-10 -top-10 w-24 h-24 bg-gradient-to-br from-[#00E5FF]/10 to-[#00B0FF]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E5FF]/10 to-[#00B0FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] group-hover:from-[#00E5FF] group-hover:to-[#00B0FF] group-hover:text-[#050816] transition-all duration-500 shadow-md">
          <IconComponent className="w-6 h-6 transition-transform duration-500 group-hover:rotate-6" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-white group-hover:text-[#00E5FF] transition-colors duration-300">
            {title}
          </h4>
          <span className="text-xs text-gray-400 font-mono">
            {count} Destinations
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
