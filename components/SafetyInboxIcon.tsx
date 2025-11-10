import React from 'react';

interface SafetyInboxIconProps {
    unreadCount: number;
    onClick: () => void;
}

const SafetyInboxIcon: React.FC<SafetyInboxIconProps> = ({ unreadCount, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            aria-label={`Open Safety Inbox. ${unreadCount} new alerts.`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {unreadCount}
                </span>
            )}
        </button>
    );
};

export default SafetyInboxIcon;