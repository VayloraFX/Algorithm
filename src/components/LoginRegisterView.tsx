import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface LoginRegisterViewProps {
  onLoginSuccess: (userEmail: string) => void;
  getAllUsers: () => Record<string, any>;
  onRegisterUser: (email: string, name: string, pass: string) => boolean;
  onAuthenticate: (email: string, pass: string) => boolean;
}

export const LoginRegisterView: React.FC<LoginRegisterViewProps> = ({
  onLoginSuccess,
  onRegisterUser,
  onAuthenticate,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Password must be at least 4 characters.');
        return;
      }
      const success = onRegisterUser(email.trim().toLowerCase(), name.trim(), password);
      if (success) {
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(email.trim().toLowerCase());
        }, 800);
      } else {
        setErrorMsg('An account with this email already exists. Please sign in.');
      }
    } else {
      const success = onAuthenticate(email.trim().toLowerCase(), password);
      if (success) {
        setSuccessMsg('Login successful! Loading dashboard...');
        setTimeout(() => {
          onLoginSuccess(email.trim().toLowerCase());
        }, 600);
      } else {
        setErrorMsg('Invalid email or password. Please check your credentials or register.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f1e8] text-slate-900 flex flex-col justify-center items-center px-4 py-8">
      {/* Flat Clean Container */}
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 shadow-xs rounded-xl space-y-6">
        
        {/* Header Branding with Dashboard Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#181A20] border border-amber-500/40 flex items-center justify-center text-[#F0B90B] font-black text-xs shadow-md">
            <Zap className="w-6 h-6 text-[#F0B90B] fill-[#F0B90B]" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            {isRegister ? 'Create G-sqaud Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            {isRegister ? 'Register for secure bot trading suite' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Flat Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-center border-b-2 transition-colors ${
              !isRegister ? 'border-[#F0B90B] text-slate-900 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-center border-b-2 transition-colors ${
              isRegister ? 'border-[#F0B90B] text-slate-900 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F0B90B]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F0B90B]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F0B90B]"
              />
            </div>
          </div>

          {/* Dashboard Button Style (Amber/Gold with dark text, matching Start Bot) */}
          <button
            type="submit"
            className="w-full mt-3 py-3 px-4 bg-[#F0B90B] hover:bg-[#e0ab08] text-[#181A20] font-black text-xs rounded-xl shadow-md shadow-[#F0B90B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4 text-[#181A20]" />
          </button>
        </form>


      </div>
    </div>
  );
};
