import React, { useState } from 'react';
import { AccountProfile, TradeRecord } from '../types.ts';
import { User, ShieldCheck, Zap, CheckCircle2, Calendar, Lock, Key, Smartphone, LogOut, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound.ts';
import confetti from 'canvas-confetti';

interface ProfileViewProps {
  account: AccountProfile;
  trades: TradeRecord[];
  onResetBalance: () => void;
  onUpdateAccount: (updates: Partial<AccountProfile>) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  account,
  trades,
  onResetBalance,
  onUpdateAccount,
  onLogout,
}) => {
  const [antiPhishingCode] = useState('GS-7792-SECURE');

  const todayStr = new Date().toISOString().split('T')[0];
  const isSubscriptionValidToday = account.subscriptionActive && account.subscriptionDate === todayStr;

  const handleSubscribe = () => {
    sound.playTap();
    if (account.balance < 8) {
      alert('Insufficient balance ($8.00 required for daily bot subscription). Please reset balance or add funds.');
      return;
    }
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#F0B90B', '#0ECB81', '#3B82F6', '#F6465D'],
    });
    onUpdateAccount({
      subscriptionActive: true,
      subscriptionDate: todayStr,
      balance: account.balance - 8.00,
    });
  };

  const handleLogOutClick = () => {
    sound.playTap();
    if (window.confirm('Are you sure you want to sign out? Your session and account data are saved safely.')) {
      onLogout();
    }
  };

  return (
    <div className="px-4 py-3 space-y-4 pb-16 min-h-full">
      {/* User Header Profile Card with Name, Email, Join Date */}
      <div className="bg-gradient-to-br from-[#181A20] to-[#2B313A] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <User className="w-40 h-40 text-[#F0B90B]" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-[#F0B90B] text-[#181A20] flex items-center justify-center font-black text-2xl shadow-inner">
              {account.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{account.name}</h2>
                <span className="bg-[#0ECB81]/20 text-[#0ECB81] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">{account.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Joined App Date</div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#F0B90B]" />
              {account.joinDate}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">API Latency</div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse"></span>
              {account.pingMs} ms (Secure)
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bot Subscription Card ($8 Fee) */}
      <div className={`rounded-2xl border p-4 shadow-xs space-y-3.5 ${
        isSubscriptionValidToday 
          ? 'bg-[#0ECB81]/10 border-[#0ECB81]/40' 
          : 'bg-white border-[#e6decb]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isSubscriptionValidToday ? 'bg-[#0ECB81] text-white' : 'bg-[#F0B90B]/20 text-[#181A20]'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">G-squad Daily Pass ($8.00)</h3>
              <p className="text-[11px] text-slate-500">
                {isSubscriptionValidToday 
                  ? 'Active for today (' + todayStr + '). Trading unlocked!' 
                  : 'Required $8 daily subscription to start bot'}
              </p>
            </div>
          </div>
          <div>
            {isSubscriptionValidToday ? (
              <span className="bg-[#0ECB81] text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" /> SUBSCRIBED
              </span>
            ) : (
              <span className="bg-[#F6465D]/15 text-[#F6465D] text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                🔒 $8.00 DUE
              </span>
            )}
          </div>
        </div>

        {!isSubscriptionValidToday ? (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-medium leading-relaxed">
              Bot trading requires an $8.00 daily pass payment. Passes reset every 24 hours at calendar day change.
            </p>
            <button
              onClick={handleSubscribe}
              className="w-full py-2.5 bg-[#F0B90B] hover:bg-[#e0ab08] text-[#181A20] text-xs font-black rounded-xl shadow-md shadow-[#F0B90B]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-[#181A20]" />
              Pay $8.00 & Subscribe For Today
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <span className="font-medium">Valid until midnight ({todayStr})</span>
            <span className="font-bold text-emerald-700">Bot Unlocked</span>
          </div>
        )}
      </div>

      {/* Security & System Protection Card */}
      <div className="bg-white rounded-2xl border border-[#e6decb] p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Security & Account Protection</h3>
            <p className="text-[11px] text-slate-500">Advanced encryption and session security</p>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#F0B90B]" />
              <div>
                <span className="font-bold text-slate-900 block">Anti-Phishing Code</span>
                <span className="text-[10px] text-slate-500">Verified official communication code</span>
              </div>
            </div>
            <span className="font-mono bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200 font-bold text-[11px]">
              {antiPhishingCode}
            </span>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#0ECB81]" />
              <div>
                <span className="font-bold text-slate-900 block">2FA Hardware Security</span>
                <span className="text-[10px] text-slate-500">Biometric & token validation active</span>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black text-[10px]">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* Log Out Account Button */}
      <div className="pt-2">
        <button
          onClick={handleLogOutClick}
          className="w-full py-3 bg-[#F6465D]/10 hover:bg-[#F6465D]/20 border border-[#F6465D]/30 text-[#F6465D] font-black text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          Sign Out / Switch User Account
        </button>
      </div>
    </div>
  );
};
