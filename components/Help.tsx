import React from 'react';
import { EmergencyContact } from '../types';
import Helplines from './Helplines';
import SafetyTip from './SafetyTip';

interface HelpProps {
    emergencyContacts: EmergencyContact[];
    onManageContacts: () => void;
    onSendTestAlert: () => void;
    onBack: () => void;
    safetyTip: string;
    onNewTip: () => void;
}

const Help: React.FC<HelpProps> = ({ 
    emergencyContacts, onManageContacts, onSendTestAlert, onBack, safetyTip, onNewTip
}) => {
    return (
        <div className="w-full max-w-4xl flex flex-col items-center p-4 animate-fade-in">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Help & Contacts</h2>
                <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                    &larr; Back to Main
                </button>
            </div>

            <div className="w-full bg-gray-800/50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Emergency Contacts</h3>
                 {emergencyContacts.length > 0 ? (
                    <div className="mb-4">
                        {emergencyContacts.length < 5 && (
                            <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-center text-yellow-300 mb-4">
                                For best results, please add at least 5 emergency contacts.
                            </div>
                        )}
                        <p className="text-gray-300 mb-2">Your trusted contacts ({emergencyContacts.length}):</p>
                        <ul className="list-disc list-inside bg-gray-900/50 p-3 rounded-md">
                            {emergencyContacts.map((contact, index) => (
                               <li key={index} className="text-white">{contact.name.join(', ')}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400 italic mb-4">No emergency contacts selected. Add at least 5 contacts to quickly send alerts.</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={onManageContacts}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-yellow-500 hover:text-black rounded-full transition-colors font-semibold"
                    >
                        {emergencyContacts.length > 0 ? 'Manage Contacts' : 'Add Contacts'}
                    </button>
                     <button
                        onClick={onSendTestAlert}
                        disabled={emergencyContacts.length === 0}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send Test Alert
                    </button>
                </div>
                 <p className="text-xs text-gray-500 mt-3 text-center">Please ensure your contacts' numbers are correct and they are aware they are on your emergency list.</p>
            </div>

            <Helplines />

            <div className="w-full mt-6">
                <SafetyTip tip={safetyTip} onNewTip={onNewTip} />
            </div>
        </div>
    );
};

export default Help;