import React, { useState } from 'react';
import MamafaLogo from './MamafaLogo';

interface DonateProps {
    onDonate: (amount: number) => void;
    onBack: () => void;
}

const SecurityBadge: React.FC<{ icon: React.ReactNode; text: string; }> = ({ icon, text }) => (
    <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-xs font-semibold">{text}</span>
    </div>
);

const Donate: React.FC<DonateProps> = ({ onDonate, onBack }) => {
    const [amount, setAmount] = useState<number | string>(20);
    const [copied, setCopied] = useState(false);
    const accountNumber = '63176343168';
    const presetAmounts = [10, 20, 30, 50];

    const handleCopy = () => {
        navigator.clipboard.writeText(accountNumber).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDonateClick = () => {
        const numericAmount = Number(amount);
        if (numericAmount > 0) {
            onDonate(numericAmount);
        }
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center p-4 animate-fade-in">
             <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Support Us</h2>
                <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                    &larr; Back to Main
                </button>
            </div>
            <div className="w-full bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">Support Our Mission</h3>
                <p className="text-gray-300 mb-4 text-center">
                    Your contribution helps us maintain and improve Mphakathi, strengthening community safety for everyone.
                </p>
                <p className="text-xs text-gray-400 text-center italic mb-6">
                    “All donations directly support the Mphakathi GBV Safety App, community safety awareness, and women’s protection initiatives.”
                </p>

                <div className="mb-6">
                    <p className="text-gray-400 mb-4 text-center">Select an amount or enter a custom one:</p>
                    <div className="flex justify-center gap-2 mb-4">
                        {presetAmounts.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset)}
                                className={`px-4 py-2 font-bold rounded-full transition-colors text-sm md:text-base ${
                                    amount === preset
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                            >
                                R{preset}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-gray-400 font-bold text-xl">R</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Custom"
                            className="w-32 bg-gray-900 border border-gray-600 rounded-md p-2 text-white text-center text-xl focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    <div className="flex justify-center items-center gap-4 my-4">
                        <SecurityBadge 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>}
                            text="SSL SECURE"
                        />
                        <SecurityBadge 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2H4z" /></svg>}
                            text="PCI COMPLIANT"
                        />
                        <SecurityBadge 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 18.5c5.05 0 9.255-3.328 10.745-7.936.255-.792.255-1.611 0-2.403A11.954 11.954 0 0010 1.5c-5.05 0-9.255 3.328-10.745 7.936a1.001 1.001 0 000 1.128zM10 16c-3.866 0-7-2.686-7-6s3.134-6 7-6 7 2.686 7 6-3.134 6-7 6zm0-10a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>}
                            text="VERIFIED"
                        />
                    </div>
                    <button
                        onClick={handleDonateClick}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors font-bold"
                    >
                        Donate Now
                    </button>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                    <p className="text-gray-300 mb-4 text-center font-semibold">Or make a direct deposit:</p>
                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-center">
                            <MamafaLogo imgClassName="h-20 w-auto" />
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-x-2">
                            <span className="text-gray-400">Account Holder:</span>
                            <span className="font-semibold text-white text-right">MAMAFA PROJECT MANAGEMENT</span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-x-2">
                            <span className="text-gray-400">Account Number:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white font-mono">{accountNumber}</span>
                                <button onClick={handleCopy} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition-colors flex-shrink-0">
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-x-2">
                            <span className="text-gray-400">Branch Code:</span>
                            <span className="font-semibold text-white font-mono">251905</span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-x-2">
                            <span className="text-gray-400">Swift Code:</span>
                            <span className="font-semibold text-white font-mono">FIRNZAJJ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donate;
