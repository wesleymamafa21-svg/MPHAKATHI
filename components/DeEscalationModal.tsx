import React, { useEffect, useRef, useState } from 'react';

interface DeEscalationModalProps {
    isOpen: boolean;
    onCancelAlert: () => void;
    onKeepMonitoring: () => void;
    onSendAnyway: () => void;
}

const TIMEOUT_SECONDS = 10;

const DeEscalationModal: React.FC<DeEscalationModalProps> = ({ isOpen, onCancelAlert, onKeepMonitoring, onSendAnyway }) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCountdown(TIMEOUT_SECONDS);

            // Default action after timeout is to keep monitoring
            timeoutRef.current = setTimeout(() => {
                onKeepMonitoring();
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
    }, [isOpen, onKeepMonitoring]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-600">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Situation Update</h2>
                <p className="text-gray-300 mb-6">
                    It seems things have calmed down. Would you like me to cancel the SOS alert?
                </p>
                <p className="text-sm text-center text-gray-400 mb-6">
                    (Automatically continuing to monitor in {countdown} seconds)
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={onCancelAlert}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors shadow-lg order-2 sm:order-1"
                    >
                        Cancel Alert
                    </button>
                    <button
                        onClick={onKeepMonitoring}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors order-3 sm:order-2"
                    >
                        Keep Monitoring
                    </button>
                    <button
                        onClick={onSendAnyway}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors shadow-lg order-1 sm:order-3"
                    >
                        Send Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeEscalationModal;