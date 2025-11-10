import React from 'react';

interface SafetyTipProps {
    tip: string;
    onNewTip: () => void;
}

const SafetyTip: React.FC<SafetyTipProps> = ({ tip, onNewTip }) => {
    return (
        <div className="w-full bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-yellow-400">Safety Tip</h3>
                <button 
                    onClick={onNewTip}
                    className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
                >
                    New Tip
                </button>
            </div>
            <p className="text-gray-300 italic">"{tip}"</p>
        </div>
    );
};

export default SafetyTip;