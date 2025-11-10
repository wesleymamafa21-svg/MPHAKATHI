import React from 'react';
import { Alert, AlertLevel } from '../types';

interface AlertBannerProps {
  alert: Alert | null;
  onDismiss: () => void;
}

const alertConfig: Record<AlertLevel, { bg: string; icon: React.ReactNode }> = {
  [AlertLevel.None]: { bg: '', icon: <></> },
  [AlertLevel.Warning]: { 
    bg: 'bg-yellow-500/90 border-yellow-600', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  },
  [AlertLevel.Critical]: { 
    bg: 'bg-red-600/90 border-red-700', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  [AlertLevel.Success]: { 
    bg: 'bg-green-600/90 border-green-700', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
};

const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  if (!alert || alert.level === AlertLevel.None) {
    return null;
  }

  const config = alertConfig[alert.level];

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-11/12 md:w-auto max-w-lg p-4 rounded-lg shadow-2xl text-white font-semibold flex items-center z-50 border-2 ${config.bg}`}>
      {config.icon}
      <span>{alert.message}</span>
      <button onClick={onDismiss} className="ml-auto text-xl font-bold">&times;</button>
    </div>
  );
};

export default AlertBanner;