import React, { useEffect, useRef, useState } from 'react';

interface ContinueListeningModalProps {
    isOpen: boolean;
    onConfirmSafe: () => void;
    onStop: () => void;
}

const TIMEOUT_SECONDS = 30;

const ContinueListeningModal: React.FC<ContinueListeningModalProps> = ({ isOpen, onConfirmSafe, onStop }) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCountdown(TIMEOUT_SECONDS);

            timeoutRef.current = setTimeout(() => {
                onConfirmSafe();
            }, TIMEOUT_SECONDS * 1000);

            countdownIntervalRef.current = setInterval(() => {
                setCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);

        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isOpen, onConfirmSafe]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-600">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Safety Check-in</h2>
                <p className="text-gray-300 mb-6">
                    Just checking in. Please confirm you are safe. This will dismiss automatically in {countdown} seconds.
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onStop}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
                    >
                        Deactivate
                    </button>
                    <button
                        onClick={onConfirmSafe}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors shadow-lg"
                    >
                        I'm Safe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContinueListeningModal;