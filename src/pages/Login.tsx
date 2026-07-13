import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/context';
import { LogIn, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { user, isAdmin, loginWithGoogle, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 flex items-center justify-center min-h-[80vh]" id="login-page-container">
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 md:p-12 backdrop-blur-md max-w-md w-full text-center shadow-[0_8px_32px_rgba(0,229,255,0.05)]">
        <div className="w-16 h-16 bg-[#00E5FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-[#00E5FF]" />
        </div>

        <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white mb-2">
          Admin Portal
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Only the portfolio owner (Shubham) has administrative write access.
        </p>

        {loading ? (
          <div className="flex items-center justify-center space-x-2 text-gray-400 font-mono text-xs">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-ping" />
            <span>Verifying Credentials...</span>
          </div>
        ) : !user ? (
          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] hover:opacity-90 active:scale-[0.98] transition-all text-[#050816] font-semibold rounded-2xl flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(0,229,255,0.2)]"
          >
            <LogIn className="w-5 h-5" />
            Sign In with Google
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left">
              <p className="text-xs text-red-400 font-mono mb-1">Access Denied</p>
              <p className="text-sm text-gray-300">
                You are authenticated as <span className="text-[#00E5FF] font-semibold">{user.email}</span>. Only the portfolio owner has access.
              </p>
            </div>
            
            <button
              onClick={() => logout()}
              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-white border border-white/10 font-semibold rounded-2xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out / Switch Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
