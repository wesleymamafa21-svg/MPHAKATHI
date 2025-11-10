import React from 'react';
import { TranscriptionEntry, CompletedRecording, SecurityLogEntry } from '../types';
import TranscriptionLog from './TranscriptionLog';
import SecurityLog from './SecurityLog';

interface ProfileProps {
    history: TranscriptionEntry[];
    onClearHistory: () => void;
    onBack: () => void;
    recordings: CompletedRecording[];
    securityLog: SecurityLogEntry[];
    onClearSecurityLog: () => void;
    onClearInbox: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
    history, onClearHistory, onBack, recordings, securityLog, onClearSecurityLog, onClearInbox 
}) => {
    
    const handleDownload = (recording: CompletedRecording) => {
        const url = URL.createObjectURL(recording.blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const timestamp = recording.timestamp.toISOString().replace(/[:.]/g, '-');
        a.download = `Mphakathi-Recording-${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    return (
        <>
        <div className="w-full max-w-4xl flex flex-col items-center p-4 animate-fade-in">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Profile & History</h2>
                <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                    &larr; Back to Main
                </button>
            </div>

            <div className="w-full bg-gray-800/50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Data Management</h3>
                <div className="space-y-3">
                    <button
                        onClick={onClearInbox}
                        className="w-full text-left p-3 bg-red-800/50 hover:bg-red-700/50 rounded-md transition-colors"
                    >
                        Clear Safety Inbox
                    </button>
                    <button
                        onClick={onClearSecurityLog}
                        className="w-full text-left p-3 bg-red-800/50 hover:bg-red-700/50 rounded-md transition-colors"
                    >
                        Clear Security Log
                    </button>
                     <button
                        onClick={onClearHistory}
                        className="w-full text-left p-3 bg-red-800/50 hover:bg-red-700/50 rounded-md transition-colors"
                    >
                        Clear Transcription History & Recordings
                    </button>
                </div>
            </div>


            <div className="w-full mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Security Log</h3>
                <SecurityLog entries={securityLog} />
            </div>

            <div className="w-full bg-gray-800/50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Session Recordings</h3>
                {recordings.length > 0 ? (
                    <ul className="space-y-2">
                        {recordings.map(rec => (
                            <li key={rec.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-md">
                                <p className="text-gray-300">
                                    Recording from {rec.timestamp.toLocaleTimeString()}
                                </p>
                                <button
                                    onClick={() => handleDownload(rec)}
                                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-colors"
                                >
                                    Download
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 italic">No recordings saved in this session. Start a recording session from the main screen.</p>
                )}
            </div>

            <div className="w-full">
                <h3 className="text-xl font-semibold text-white mb-2">Transcription History</h3>
                <TranscriptionLog entries={history} emptyMessage="No history available." />
            </div>
        </div>
        </>
    );
};

export default Profile;