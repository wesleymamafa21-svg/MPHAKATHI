import React, { useState, useEffect } from 'react';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (pin: string) => void;
    error: string;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSubmit, error }) => {
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPin(''); // Reset on open
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(pin);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm border border-gray-600">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Enter PIN to Deactivate</h2>
                <p className="text-gray-300 mb-6">
                    A 4-digit PIN is required to deactivate the session for security.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white text-center text-2xl tracking-[.5em] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        autoFocus
                        maxLength={4}
                        placeholder="••••"
                        pattern="\d{4}"
                        inputMode="numeric"
                    />
                    {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors shadow-lg"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PinModal;