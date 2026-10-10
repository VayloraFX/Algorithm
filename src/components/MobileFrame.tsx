import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="h-[100dvh] w-full bg-[#eae3d5] flex items-center justify-center overflow-hidden">
      {/* Mobile Screen Container: Edge-to-edge on mobile, centered clean mobile column on desktop with warm rich cream backdrop */}
      <div className="w-full sm:max-w-[420px] h-full bg-[#f6f1e8] text-stone-900 sm:border-x sm:border-[#ded5c5] sm:shadow-2xl flex flex-col relative overflow-hidden">
        {/* Main Content Area (Header at top, scrollable content, BottomNav at bottom) */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#f6f1e8]">
          {children}
        </div>
      </div>
    </div>
  );
};
