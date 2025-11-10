import React from 'react';
import { EmergencyContact } from '../types';
import EmergencyContactManager from './EmergencyContactManager';

interface ContactManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    emergencyContacts: EmergencyContact[];
    onAddManualContact: (name: string, tel: string) => void;
    onRemoveContact: (tel: string) => void;
    onManageContactsFromDevice: () => void;
    isContactPickerSupported: boolean;
}

const ContactManagerModal: React.FC<ContactManagerModalProps> = ({
    isOpen, onClose, ...props
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg border border-gray-600 relative animate-fade-in-up">
                 <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.3s ease-out forwards;
                    }
                `}</style>
                 <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                 <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Manage Emergency Contacts</h2>
                <EmergencyContactManager {...props} />
                 <button
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors font-bold"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default ContactManagerModal;