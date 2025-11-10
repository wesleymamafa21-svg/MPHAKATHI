import React from 'react';
import { SafetyInboxThread, SafetyInboxStatus } from '../types';

interface SafetyInboxProps {
    threads: SafetyInboxThread[];
    onOpenChat: (threadId: string) => void;
    onResolve: (threadId: string) => void;
    onBack: () => void;
}

const statusConfig: Record<SafetyInboxStatus, { color: string, icon: string, text: string }> = {
    [SafetyInboxStatus.ActiveDanger]: { color: 'bg-red-500', icon: '🚨', text: 'Active Danger' },
    [SafetyInboxStatus.Safe]: { color: 'bg-green-500', icon: '✅', text: 'Safe' },
    [SafetyInboxStatus.NoResponse]: { color: 'bg-gray-500', icon: '❓', text: 'No Response' },
};

const SafetyInbox: React.FC<SafetyInboxProps> = ({ threads, onOpenChat, onResolve, onBack }) => {

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="w-full max-w-4xl h-full flex flex-col p-4 animate-fade-in">
            <div className="w-full flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-3xl font-bold">📥 Safety Inbox</h2>
                <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
                    &larr; Back to Main
                </button>
            </div>
            
            {threads.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <h3 className="text-2xl font-semibold text-gray-300">Your Inbox is Clear</h3>
                    <p>Distress alerts from nearby users will appear here.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {threads.map(thread => {
                        const config = statusConfig[thread.status];
                        const lastMessage = thread.messages[thread.messages.length - 1];
                        return (
                            <div key={thread.id} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-yellow-500 transition-colors cursor-pointer" onClick={() => onOpenChat(thread.id)}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-3xl flex-shrink-0">{thread.avatar}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${config.color}`}>{config.text}</span>
                                                <h3 className="font-bold text-white">{thread.userName}</h3>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1 truncate">
                                                <span className="font-semibold">{lastMessage.sender === 'user' ? 'You:' : ''}</span> {lastMessage.type === 'audio' ? '🎤 Voice Note' : lastMessage.content}
                                            </p>
                                        </div>
                                    </div>
                                     <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-500">{getRelativeTime(thread.timestamp)}</p>
                                        {thread.status !== SafetyInboxStatus.Safe && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onResolve(thread.id); }}
                                                className="mt-2 text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded-full transition-colors"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SafetyInbox;