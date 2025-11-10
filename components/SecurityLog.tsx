import React from 'react';
import { SecurityLogEntry } from '../types';

interface SecurityLogProps {
  entries: SecurityLogEntry[];
}

const triggerConfig = {
    'Voice Secret Code': { icon: '🤫', color: 'border-purple-500' },
    'Loud Sound': { icon: '💥', color: 'border-red-500' },
    'Danger Keyword': { icon: '🗣️', color: 'border-yellow-500' },
    'Scream Detected': { icon: '😱', color: 'border-rose-500' },
    'Crying Detected': { icon: '😭', color: 'border-blue-500' },
}

const SecurityLog: React.FC<SecurityLogProps> = ({ entries }) => {
    return (
        <div className="w-full h-48 bg-gray-900/50 rounded-lg p-4 overflow-y-auto border border-gray-700 shadow-inner">
            {entries.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No security events logged.</p>
                 </div>
            ) : (
                <>
                    {entries.map((entry) => {
                        const config = triggerConfig[entry.triggerType];
                        return (
                            <div key={entry.id} className={`mb-3 p-3 rounded-md bg-gray-800 border-l-4 ${config.color}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-200">{config.icon} {entry.triggerType} Activated</p>
                                        <p className="text-sm text-gray-400 mt-1">{entry.details}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                       {entry.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
};

export default SecurityLog;