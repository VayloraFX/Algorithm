import React from 'react';
import { Bot, User, Sliders, Headphones } from 'lucide-react';
import { sound } from '../utils/sound.ts';

export type NavTab = 'bot' | 'profile' | 'settings' | 'support';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  botRunning: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  botRunning,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'bot',
      label: 'Cockpit',
      icon: <Bot className="w-5 h-5" />,
      badge: botRunning ? (
        <span className="absolute top-1 right-1/2 translate-x-3 w-2 h-2 rounded-full bg-[#0ECB81] ring-2 ring-white animate-pulse" />
      ) : null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      id: 'support',
      label: 'Support',
      icon: <Headphones className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-[#faf8f4] border-t border-[#e6decb] px-2 py-1.5 flex items-center justify-around shrink-0 shadow-sm select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              sound.playTap();
              onChangeTab(tab.id);
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-5 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'text-[#181A20] font-black'
                : 'text-stone-400 hover:text-stone-700 font-medium'
            }`}
          >
            {tab.badge}
            <div className={`transition-transform duration-150 ${isActive ? 'scale-110 text-[#F0B90B] fill-[#F0B90B]' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-slate-900' : 'text-slate-500'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-[#F0B90B] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
