import React from 'react';

interface TipBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  tip: string;
}

const TipBanner: React.FC<TipBannerProps> = ({ isVisible, onDismiss, tip }) => {
  if (!isVisible || !tip) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-11/12 md:w-auto max-w-lg p-4 rounded-lg shadow-2xl text-white font-semibold flex items-center z-50 border-2 bg-blue-600/90 border-blue-700 animate-fade-in-down`}>
      <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      <span><strong>Safety Tip:</strong> {tip}</span>
      <button onClick={onDismiss} className="ml-4 text-xl font-bold flex-shrink-0">&times;</button>
    </div>
  );
};

export default TipBanner;