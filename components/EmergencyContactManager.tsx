import React, { useState } from 'react';
import { EmergencyContact } from '../types';

interface EmergencyContactManagerProps {
    emergencyContacts: EmergencyContact[];
    onAddManualContact: (name: string, tel: string) => void;
    onRemoveContact: (tel: string) => void;
    onManageContactsFromDevice: () => void;
    isContactPickerSupported: boolean;
}

const EmergencyContactManager: React.FC<EmergencyContactManagerProps> = ({
    emergencyContacts, onAddManualContact, onRemoveContact, onManageContactsFromDevice, isContactPickerSupported
}) => {
    const [manualContactName, setManualContactName] = useState('');
    const [manualContactTel, setManualContactTel] = useState('');

    const handleAddClick = () => {
        onAddManualContact(manualContactName, manualContactTel);
        setManualContactName('');
        setManualContactTel('');
    };

    return (
        <div className="w-full">
            {isContactPickerSupported && (
                <button
                    onClick={onManageContactsFromDevice}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors font-bold text-lg mb-4"
                >
                    Add Contacts From Device
                </button>
            )}

            <div className="w-full text-left">
                {!isContactPickerSupported && (
                    <p className="text-center text-sm text-yellow-300 bg-yellow-900/50 p-3 rounded-md mb-4 border border-yellow-700">
                        The Contact Picker API is not supported on this browser. Please add contacts manually.
                    </p>
                )}
                 <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                        type="text" 
                        placeholder="Contact Name" 
                        value={manualContactName} 
                        onChange={e => setManualContactName(e.target.value)} 
                        className="flex-1 bg-gray-900 border border-gray-600 rounded-full p-3 pl-5 text-white" 
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={manualContactTel} 
                        onChange={e => setManualContactTel(e.target.value)} 
                        className="flex-1 bg-gray-900 border border-gray-600 rounded-full p-3 pl-5 text-white" 
                    />
                </div>
                 <button
                    onClick={handleAddClick}
                    disabled={!manualContactName || !manualContactTel || emergencyContacts.length >= 5}
                    className="mt-3 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {emergencyContacts.length >= 5 ? 'Contact List Full (Max 5)' : 'Add Manually'}
                </button>
            </div>

            {emergencyContacts.length > 0 && (
                <div className="mt-6 w-full text-left">
                    <h4 className="font-semibold text-gray-200 mb-2">Your Contacts ({emergencyContacts.length}/5)</h4>
                    <ul className="space-y-2 bg-gray-900/50 p-3 rounded-md max-h-48 overflow-y-auto">
                        {emergencyContacts.map((contact, index) => (
                           <li key={index} className="flex justify-between items-center text-white p-2 bg-gray-700/50 rounded">
                               <div>
                                   <p className="font-semibold">{contact.name.join(', ')}</p>
                                   <p className="text-sm text-gray-400">{contact.tel.join(', ')}</p>
                               </div>
                               <button onClick={() => contact.tel[0] && onRemoveContact(contact.tel[0])} className="text-red-400 hover:text-red-300 text-2xl font-bold flex-shrink-0 ml-2">&times;</button>
                           </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EmergencyContactManager;