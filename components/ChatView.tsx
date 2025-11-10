import React, { useState, useRef, useEffect } from 'react';
import { SafetyInboxThread, SafetyInboxStatus } from '../types';
import AudioPlayer from './AudioPlayer';

interface ChatViewProps {
    thread: SafetyInboxThread;
    onSendMessage: (threadId: string, type: 'text' | 'audio', content: string) => void;
    onBack: () => void;
}

const statusConfig: Record<SafetyInboxStatus, { color: string, text: string }> = {
    [SafetyInboxStatus.ActiveDanger]: { color: 'text-red-400', text: 'Active Danger' },
    [SafetyInboxStatus.Safe]: { color: 'text-green-400', text: 'Safe' },
    [SafetyInboxStatus.NoResponse]: { color: 'text-gray-400', text: 'No Response' },
};


const ChatView: React.FC<ChatViewProps> = ({ thread, onSendMessage, onBack }) => {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const quickReplies = ["Are you safe?", "Where are you?", "Help is on the way.", "I'm safe."];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [thread.messages]);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(thread.id, 'text', message);
            setMessage('');
        }
    };
    
    const handleQuickReply = (text: string) => {
        onSendMessage(thread.id, 'text', text);
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    onSendMessage(thread.id, 'audio', base64String);
                };
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            // TODO: show an alert to the user
        }
    };
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };


    return (
        <div className="w-full max-w-4xl h-full flex flex-col p-4 animate-fade-in">
            {/* Header */}
            <div className="flex-shrink-0 w-full flex items-center justify-between pb-4 border-b border-gray-700">
                <button onClick={onBack} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors flex items-center gap-2">
                    &larr; <span className="hidden sm:inline">Back to Inbox</span>
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">{thread.userName}</h2>
                     <p className={`text-sm font-semibold ${statusConfig[thread.status].color}`}>{statusConfig[thread.status].text}</p>
                </div>
                 <a 
                    href={thread.location ? `https://www.google.com/maps?q=${thread.location.latitude},${thread.location.longitude}` : '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-3 py-1 rounded-full transition-colors ${thread.location ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
                >
                    📍 Map
                </a>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 my-2">
                 {thread.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-yellow-600 text-black rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                           {msg.type === 'text' ? (
                                <p>{msg.content}</p>
                            ) : (
                                <AudioPlayer src={msg.content} />
                            )}
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-800' : 'text-gray-400'} text-right`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 pt-2 border-t border-gray-700">
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                    {quickReplies.map(reply => (
                        <button 
                            key={reply} 
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isRecording ? "Recording voice note..." : "Type your message..."}
                        className="flex-1 bg-gray-900 border border-gray-600 rounded-full p-3 pl-5 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        disabled={isRecording}
                    />
                    {message.length === 0 && !isRecording && (
                        <button 
                            onClick={handleStartRecording}
                            className="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
                            aria-label="Record voice note"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                    {isRecording && (
                         <button 
                            onClick={handleStopRecording}
                            className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors animate-pulse"
                            aria-label="Stop recording"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6" /></svg>
                        </button>
                    )}
                    {message.length > 0 && !isRecording && (
                        <button 
                            onClick={handleSend}
                            className="p-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full shadow-lg transition-transform transform hover:scale-105"
                            aria-label="Send Message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatView;