import React from 'react';
import { SafetyAction } from '../types';

interface SafetyActionSuggestionProps {
    action: SafetyAction | null;
}

const SafetyActionSuggestion: React.FC<SafetyActionSuggestionProps> = ({ action }) => {
    if (!action || !action.headline) {
        return null;
    }

    return (
        <div className="w-full bg-indigo-900/50 rounded-lg p-4 border border-indigo-700 my-4 animate-fade-in">
            <div className="flex items-start">
                 <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 </div>
                <div className="ml-3">
                    <h3 className="text-lg font-semibold text-indigo-300">{action.headline}</h3>
                    <p className="text-gray-300 mt-1">{action.suggestion}</p>
                </div>
            </div>
        </div>
    );
};

export default SafetyActionSuggestion;