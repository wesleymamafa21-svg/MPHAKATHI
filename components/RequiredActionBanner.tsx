import React from 'react';

interface RequiredActionBannerProps {
  isVisible: boolean;
  message: string;
  buttonText: string;
  onAction: () => void;
}

const RequiredActionBanner: React.FC<RequiredActionBannerProps> = ({ isVisible, message, buttonText, onAction }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-11/12 md:max-w-2xl p-4 rounded-lg shadow-2xl text-white font-semibold flex flex-col sm:flex-row items-center justify-between z-50 border-2 bg-yellow-600/95 border-yellow-700`}>
      <div className="flex items-center mb-2 sm:mb-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>{message}</span>
      </div>
      <button onClick={onAction} className="px-4 py-2 bg-yellow-800 hover:bg-yellow-700 text-white font-bold rounded-full transition-colors flex-shrink-0">
          {buttonText}
      </button>
    </div>
  );
};

export default RequiredActionBanner;