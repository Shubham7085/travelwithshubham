import { motion } from 'framer-motion';
import { cn } from '../../utils/cn'; // Standard clsx + tailwind-merge utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const PremiumButton = ({ variant = 'primary', children, className, ...props }: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-8 py-4 rounded-[20px] font-heading font-medium transition-all duration-300",
        variant === 'primary' 
          ? "bg-primary-cyan text-dark-bg glow-effect hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
          : "glass-panel text-white hover:bg-white/[0.08]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
