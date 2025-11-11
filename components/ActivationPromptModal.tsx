import React from 'react';

interface ActivationPromptModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onDecline: () => void;
}

const ActivationPromptModal: React.FC<ActivationPromptModalProps> = ({ isOpen, onConfirm, onDecline }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-600 animate-fade-in-up">
                 <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.3s ease-out forwards;
                    }
                `}</style>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Activate Mphakathi?</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                    Enable listening mode to monitor for signs of distress. You can deactivate at any time.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <button
                        onClick={onDecline}
                        className="px-8 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-full transition-colors"
                    >
                        No
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors shadow-lg"
                    >
                        Yes, Activate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivationPromptModal;
