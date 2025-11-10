import React from 'react';
import MphakathiLogo from './MphakathiLogo';

interface DonationConfirmationProps {
    onDone: () => void;
}

const DonationConfirmation: React.FC<DonationConfirmationProps> = ({ onDone }) => {
    return (
        <div className="w-full max-w-md flex flex-col items-center justify-center text-center p-6 bg-gray-800/50 rounded-lg border border-yellow-500 shadow-2xl animate-fade-in">
             <div className="mb-6 p-4 bg-gray-900 rounded-full inline-block">
                <MphakathiLogo />
             </div>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
                Thank you for supporting Mphakathi
            </h2>
            <p className="text-lg text-white mb-8">
                — Together, we build safer communities. —
            </p>
            <p className="text-xl font-semibold text-gray-300 mb-8">
                “The Power to Protect”
            </p>
            
            <div className="w-full border-t border-gray-700 my-6"></div>
            
            <p className="text-sm text-gray-400 mb-2">Your donation is securely processed by Mamafa Project Management.</p>

            <button
                onClick={onDone}
                className="w-full mt-6 px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
                Done
            </button>
        </div>
    );
};

export default DonationConfirmation;