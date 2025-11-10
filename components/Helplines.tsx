import React from 'react';

const helplines = [
    { issue: 'Police emergency', helpline: 'Call any phone', number: '10111' },
    { issue: 'Ambulance (medical emergency)', helpline: 'Call any phone', number: '10177' },
    { issue: 'General mobile emergency', helpline: 'Mobile phone', number: '112' },
    { issue: 'AIDS / HIV helpline', helpline: 'SADAG / Govt health line', number: '0800 012 322' },
    { issue: 'Suicide / mental health crisis', helpline: 'SADAG crisis line', number: '0800 567 567' },
    { issue: 'Substance abuse support', helpline: 'Dept of Social Development', number: '0800 12 13 14' },
    { issue: 'Gender-based violence (GBV)', helpline: 'GBV Command Centre', number: '0800 428 428' },
    { issue: 'Child abuse / line for children', helpline: 'Childline South Africa', number: '0800 055 555' },
];

const Helplines: React.FC = () => {
    return (
        <div className="w-full bg-gray-800/50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">National Helplines</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-2 text-gray-300 font-semibold text-sm">Issue</th>
                            <th className="px-4 py-2 text-gray-300 font-semibold text-sm">Helpline</th>
                            <th className="px-4 py-2 text-gray-300 font-semibold text-sm">Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {helplines.map((line, index) => (
                            <tr key={index} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 text-gray-200">{line.issue}</td>
                                <td className="px-4 py-3 text-gray-400 text-sm">{line.helpline}</td>
                                <td className="px-4 py-3 text-white font-mono">
                                    <a href={`tel:${line.number.replace(/\s/g, '')}`} className="hover:underline hover:text-yellow-400">
                                        {line.number}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Helplines;