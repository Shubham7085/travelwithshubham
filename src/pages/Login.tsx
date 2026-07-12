import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';
import { auth, googleProvider } from '../firebase/config'; // सही config इम्पोर्ट करें
import { signInWithPopup } from 'firebase/auth'; // Firebase auth से इम्पोर्ट करें

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // यहाँ पॉपअप ट्रिगर होगा
      const result = await signInWithPopup(auth, googleProvider);
      
      // शुभम, यहाँ अपनी सही ईमेल आईडी डालें जिससे आप लॉग इन करना चाहते हैं
      if (result.user.email === 'shubhamnagvanshi84823@gmail.com') { 
        navigate('/admin');
      } else {
        setError('Unauthorized: Only Shubham can access the admin panel.');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <Shield className="w-12 h-12" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Only the portfolio owner (Shubham) has administrative write access.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-left">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn} // यहाँ सही फ़ंक्शन का नाम दें
          disabled={loading}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <LogIn className="w-5 h-5 mr-2" />
          {loading ? 'Connecting...' : 'Sign In with Google'}
        </button>
      </div>
    </div>
  );
}
