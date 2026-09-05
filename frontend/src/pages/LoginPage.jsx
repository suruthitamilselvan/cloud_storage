import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Cloud } from 'lucide-react';
import { authService } from '../services/authService';
import GoogleAuthModal from '../components/GoogleAuthModal';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@cloudvault.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '274119040770-tkig5mkv9aodrh7ojq3nm1kcnnuituph.apps.googleusercontent.com';

    const initGis = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              setLoading(true);
              try {
                await authService.googleOAuthLogin(response.credential);
                navigate('/');
              } catch (err) {
                setError('Google sign-in authentication failed. Please try again.');
              } finally {
                setLoading(false);
              }
            },
            auto_select: false,
          });

          const container = document.getElementById('googleSignInBtnContainer');
          if (container) {
            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              width: '380',
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        } catch (e) {
          console.error('Google GIS init error', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGis();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountSelected = async (googleEmail, googleName) => {
    setIsGoogleModalOpen(false);
    setLoading(true);
    setError('');

    try {
      await authService.googleLogin(googleEmail, googleName);
      navigate('/');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleModalOpen(true);
        }
      });
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex flex-col md:flex-row font-sans select-none">
      {/* LEFT EDITORIAL SCENIC HERO SIDE (50% SPLIT) */}
      <div className="md:w-1/2 min-h-[420px] md:min-h-screen relative p-8 md:p-14 flex flex-col justify-between overflow-hidden bg-slate-900 text-white">
        {/* Background Image with 15-20% reduced dark overlay for natural mountain detail */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 scale-105 transform transition-transform duration-1000"
          style={{
            backgroundImage: `url('/header_misty_mountain.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-slate-950/15" />

        {/* Top Wordmark with Cloud Icon (No dot after CloudVault) */}
        <div className="relative z-10 flex items-center gap-2.5">
          <Cloud className="w-5 h-5 text-white" />
          <span className="font-serif text-2xl font-bold tracking-tight text-white">CloudVault</span>
        </div>

        {/* Main Editorial Text (Reduced by 10-15%) */}
        <div className="relative z-10 max-w-md my-auto py-8">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-tight mb-4 text-white">
            Your ideas belong somewhere better.
          </h1>
          <p className="text-xs md:text-sm text-slate-200 font-light leading-relaxed">
            Securely organize, access and share the files that matter.
          </p>
        </div>

        {/* Bottom Editorial Labels */}
        <div className="relative z-10 pt-5 border-t border-white/20 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-slate-300">
          <span>A SAFER PLACE</span>
          <span>FOR A BRIGHTER TOMORROW</span>
        </div>
      </div>

      {/* RIGHT SIGN IN FORM SIDE (50% SPLIT, WARM WHITE / IVORY, VERTICALLY BALANCED UPWARD) */}
      <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-start md:justify-center items-center bg-[#FFFFFF] pt-10 md:pt-12">
        <div className="w-full max-w-[400px]">
          {/* Header Tags */}
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-slate-400 font-semibold mb-6">
            <span>SECURE</span>
            <span>·</span>
            <span>ORGANIZE</span>
            <span>·</span>
            <span>SHARE</span>
          </div>

          <div className="mb-6">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase block mb-1">WELCOME BACK</span>
            <h2 className="text-3xl font-serif font-normal text-[#111827] tracking-tight">Sign in</h2>
            <p className="text-xs text-slate-500 mt-1">Access your CloudVault account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[50px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A] transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg pl-10 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Deep Editorial Blue Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* OR Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-slate-400 font-normal">or continue with</span>
            </div>

            {/* Official Google Identity Services GIS Button Container */}
            <div id="googleSignInBtnContainer" className="w-full flex justify-center overflow-hidden rounded-lg min-h-[44px]"></div>
          </form>

          <p className="text-xs text-center text-slate-500 mt-8">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#1E3A8A] hover:underline font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Google Account Selector / OAuth Sign In Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
}
