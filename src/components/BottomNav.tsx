import React from 'react';
import { Bot, History, Sliders } from 'lucide-react';
import { sound } from '../utils/sound.ts';

export type NavTab = 'bot' | 'trades' | 'settings';

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
      label: 'Bot Cockpit',
      icon: <Bot className="w-5 h-5" />,
      badge: botRunning ? (
        <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#0ECB81] ring-2 ring-white animate-pulse" />
      ) : null,
    },
    {
      id: 'trades',
      label: 'Trades Log',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Sliders className="w-5 h-5" />,
    },
  ];

  return (
    <nav className={`sticky bottom-0 z-40 bg-[#faf8f4]/95 backdrop-blur-md ${
      activeTab === 'bot' ? 'border-t border-slate-800' : 'border-t border-[#e6decb]'
    } px-4 py-2 flex items-center justify-around shrink-0 shadow-xs select-none`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              sound.playTap();
              onChangeTab(tab.id);
            }}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#181A20] font-black'
                : 'text-stone-400 hover:text-stone-700 font-medium'
            }`}
          >
            {tab.badge}
            <div className={`transition-transform duration-150 ${isActive ? 'scale-110 text-[#181A20]' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-black' : ''}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
