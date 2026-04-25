import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* iPhone Frame */}
      <div className="relative bg-[#22223B] rounded-[3.5rem] p-3 shadow-[0_25px_70px_rgba(34,34,59,0.4)]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-7 bg-[#22223B] rounded-b-[1.2rem] z-10"></div>
        
        {/* Screen */}
        <div className="relative bg-white rounded-[3rem] overflow-hidden w-[320px] h-[692px]">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-20 text-[11px] font-semibold text-[#22223B]/80">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                <path d="M0 4.5h2v3H0v-3zm3.5 0h2v3h-2v-3zM7 4.5h2v3H7v-3zm3.5 0h2v3h-2v-3zM14 4.5h2v3h-2v-3z"/>
              </svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                <path d="M1 4.5l7-3.5 7 3.5v6c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1v-6z"/>
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
                <rect x="0" y="1" width="22" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                <rect x="2" y="3" width="18" height="6" rx="1"/>
                <rect x="23" y="4" width="2" height="4" rx="0.5"/>
              </svg>
            </div>
          </div>
          
          {/* Content */}
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}