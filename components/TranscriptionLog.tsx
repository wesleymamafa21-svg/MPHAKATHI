import React, { useRef, useEffect } from 'react';
import { TranscriptionEntry, Emotion } from '../types';

interface TranscriptionLogProps {
  entries: TranscriptionEntry[];
  liveTranscript?: string;
  emptyMessage?: string;
}

const emotionColorMapping: Record<Emotion, string> = {
    [Emotion.Neutral]: 'border-green-600',
    [Emotion.Calm]: 'border-green-500',
    [Emotion.Happy]: 'border-green-500',
    [Emotion.Sad]: 'border-yellow-500',
    [Emotion.Stressed]: 'border-yellow-500',
    [Emotion.Fearful]: 'border-yellow-500',
    [Emotion.Angry]: 'border-red-500',
    [Emotion.Danger]: 'border-red-600',
};


const TranscriptionLog: React.FC<TranscriptionLogProps> = ({ entries, liveTranscript, emptyMessage = "Start listening to see transcription here..." }) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries, liveTranscript]);

    return (
        <div className="w-full h-40 md:h-48 bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
            {entries.length === 0 && !liveTranscript ? (
                 <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-500">
                    <p>{emptyMessage}</p>
                 </div>
            ) : (
                <>
                    {entries.map((entry) => (
                        <div key={entry.id} className={`mb-3 p-3 rounded-md bg-white dark:bg-gray-800 border-l-4 ${emotionColorMapping[entry.emotionState?.emotion || Emotion.Neutral]}`}>
                            <p className="text-gray-800 dark:text-gray-300">{entry.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
                               {entry.timestamp.toLocaleTimeString()} - {entry.emotionState ? `${entry.emotionState.emotion} (${entry.emotionState.intensity}) Conf: ${(entry.emotionState.confidence * 100).toFixed(0)}%` : 'Analyzing...'}
                            </p>
                        </div>
                    ))}
                    {liveTranscript && (
                        <div className="mb-3 p-3 rounded-md bg-white dark:bg-gray-800 border-l-4 border-blue-500 opacity-75">
                            <p className="text-gray-800 dark:text-gray-300">{liveTranscript}<span className="inline-block w-1 h-4 bg-yellow-400 ml-1 animate-pulse"></span></p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
                                Listening...
                            </p>
                        </div>
                    )}
                </>
            )}
            <div ref={logEndRef} />
        </div>
    );
};

export default TranscriptionLog;