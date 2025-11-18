import React from 'react';

const resources = [
    {
        name: 'SADAG (South African Depression and Anxiety Group)',
        description: 'Offers counselling, support, and resources for mental health issues including depression, anxiety, and trauma.',
        url: 'http://www.sadag.org/',
    },
    {
        name: 'LifeLine Southern Africa',
        description: 'Provides free and confidential counselling services for emotional crisis and personal growth.',
        url: 'https://lifelinesa.co.za/',
    },
    {
        name: 'TEARS Foundation',
        description: 'Provides access to crisis intervention, advocacy, and counselling for survivors of rape and sexual abuse.',
        url: 'https://tears.co.za/',
    },
    {
        name: 'POWA (People Opposing Women Abuse)',
        description: 'A feminist organization offering counselling, legal support, and shelter for women experiencing gender-based violence.',
        url: 'https://www.powa.co.za/',
    },
];

const ExternalResources: React.FC = () => {
    return (
        <div className="w-full bg-gray-800/50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">External Support Resources</h3>
            <p className="text-sm text-gray-400 mb-4">
                The following links lead to external websites and are not affiliated with Mphakathi. Please seek professional help if you are in crisis.
            </p>
            <div className="space-y-4">
                {resources.map((resource, index) => (
                    <a 
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-900/50 p-4 rounded-lg hover:bg-gray-700/50 hover:border-yellow-500 border border-transparent transition-all"
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-white">{resource.name}</h4>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{resource.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ExternalResources;
