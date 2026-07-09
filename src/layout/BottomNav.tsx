import { NavLink } from 'react-router-dom';
import { Home, Map, Image, User } from 'lucide-react';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/trips', icon: Map, label: 'Trips' },
    { to: '/gallery', icon: Image, label: 'Gallery' },
    { to: '/about', icon: User, label: 'About' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 glass-panel rounded-b-none border-b-0 border-x-0 pb-safe pt-2 px-6 pb-4">
      <div className="flex justify-between items-center">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 transition-colors duration-300",
              isActive ? "text-primary-cyan" : "text-gray-400 hover:text-white"
            )}
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

