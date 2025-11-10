import React, { useState, useEffect } from 'react';
import { EmergencyContact, SimulatedUser } from '../types';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: EmergencyContact[];
    simulatedUsers: SimulatedUser[];
    onSend: (message: string) => void;
    location: { latitude: number; longitude: number } | null;
    userName: string | null;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contacts, simulatedUsers, onSend, location, userName }) => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            const name = userName || 'Someone';
            const locationInfo = location
                ? `My current location is approximately: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
                : "My location is not available.";
            setMessage(`**EMERGENCY ALERT** ${name} is in a dangerous situation and needs help immediately. ${locationInfo}`);
        }
    }, [isOpen, location, userName]);

    if (!isOpen) {
        return null;
    }
    
    const handleSend = () => {
        if (message.trim()) {
            onSend(message);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg border border-gray-600 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Send Emergency Message</h2>
                
                <div className="bg-gray-900/50 p-3 rounded-md mb-4">
                    <p className="font-semibold text-gray-300">Recipients ({contacts.length + simulatedUsers.length} total):</p>
                    <div className="max-h-32 overflow-y-auto mt-2 pr-2">
                        <p className="text-sm font-bold text-gray-400 mb-1">Nearby Mphakathi Users:</p>
                        <ul className="list-none text-gray-400 space-y-1">
                            {simulatedUsers.map((user) => (
                                <li key={user.id} className="flex items-center gap-2">
                                    <span className="text-lg">{user.avatar}</span>
                                    <span>{user.name}</span>
                                </li>
                            ))}
                        </ul>
                         {contacts.length > 0 && (
                            <>
                                <p className="text-sm font-bold text-gray-400 mt-3 mb-1 pt-2 border-t border-gray-700">Your Emergency Contacts:</p>
                                <ul className="list-none text-gray-400 space-y-1">
                                    {contacts.map((contact, index) => (
                                         <li key={index} className="flex items-center gap-2">
                                            <span className="text-lg">📞</span>
                                            <span>{contact.name.join(', ')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="emergency-message" className="block text-sm font-medium text-gray-300 mb-2">
                        Message (edit if needed):
                    </label>
                    <textarea
                        id="emergency-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    />
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSend}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors shadow-lg"
                    >
                        SEND ALERT
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChatModal;