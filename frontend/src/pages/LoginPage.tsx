import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, ArrowRight, AlertCircle, Play } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
  onStartDemo: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
  onStartDemo,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0D] flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full bg-[#101218] rounded-xl border border-[#2B303A] p-8 shadow-2xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#1B202A] border border-[#D5AA63]/40 items-center justify-center text-[#D5AA63] mb-3 shadow-[0_0_20px_rgba(213,170,99,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif-noir text-2xl font-bold text-[#F0F0F2]">
            Investigator Terminal
          </h2>
          <p className="text-xs text-[#9BA2AE] font-mono-forensic mt-1">
            ENTER CREDENTIALS TO ACCESS OPEN FILES
          </p>
        </div>

        {/* Demo Fast Access */}
        <div className="mb-6 p-4 rounded-lg bg-[#151922] border border-[#D5AA63]/30 text-center">
          <p className="text-xs text-[#F0F0F2] mb-2 font-medium">
            Immediate Evaluation Access:
          </p>
          <button
            onClick={onStartDemo}
            className="w-full py-2.5 rounded bg-[#D5AA63] hover:bg-[#e2bd7e] text-[#090A0D] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch As Lead Detective (1-Click)</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#2B303A]"></div>
          <span className="flex-shrink mx-4 text-[11px] font-mono-forensic text-[#656C7A]">OR SIGN IN</span>
          <div className="flex-grow border-t border-[#2B303A]"></div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-[#D9535D]/10 border border-[#D9535D]/30 flex items-start space-x-2 text-xs text-[#D9535D]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-forensic text-[#9BA2AE] mb-1.5 uppercase">
              Badge / Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="investigator_noir"
                className="w-full bg-[#151922] border border-[#2B303A] focus:border-[#D5AA63] rounded-lg px-4 py-2.5 pl-10 text-sm text-[#F0F0F2] focus:outline-none transition-colors"
              />
              <UserIcon className="w-4 h-4 text-[#656C7A] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-forensic text-[#9BA2AE] mb-1.5 uppercase">
              Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151922] border border-[#2B303A] focus:border-[#D5AA63] rounded-lg px-4 py-2.5 pl-10 text-sm text-[#F0F0F2] focus:outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-[#656C7A] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#1B202A] hover:bg-[#2B303A] border border-[#2B303A] hover:border-[#D5AA63]/50 text-xs font-bold text-[#F0F0F2] uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer mt-6"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#D5AA63]" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#9BA2AE]">
          Need an investigator account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#D5AA63] hover:underline font-medium"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};
