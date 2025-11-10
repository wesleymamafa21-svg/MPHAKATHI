import React, { useEffect, useState } from 'react';

interface PaymentProcessingProps {
    amount: number;
    onSuccess: () => void;
    onFailure: () => void;
}

const messages = [
    "Connecting to secure gateway...",
    "Encrypting transaction details...",
    "Submitting payment to the bank...",
    "Waiting for confirmation...",
    "Finalizing donation...",
];

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({ amount, onSuccess, onFailure }) => {
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            messageIndex++;
            if (messageIndex < messages.length) {
                setMessage(messages[messageIndex]);
            }
        }, 1500); // Change message every 1.5 seconds

        const paymentTimeout = setTimeout(() => {
            clearInterval(messageInterval);
            // Simulate a 95% success rate
            if (Math.random() < 0.95) {
                onSuccess();
            } else {
                onFailure();
            }
        }, messages.length * 1500 + 500); // Total time is slightly longer than all messages

        return () => {
            clearInterval(messageInterval);
            clearTimeout(paymentTimeout);
        };
    }, [onSuccess, onFailure]);

    return (
        <div className="w-full max-w-md flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <svg className="animate-spin h-16 w-16 text-yellow-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-3xl font-bold text-white mb-2">Processing Donation</h2>
            <p className="text-2xl text-yellow-400 font-bold mb-6">R{amount}</p>
            <p className="text-lg text-gray-400">{message}</p>
        </div>
    );
};

export default PaymentProcessing;