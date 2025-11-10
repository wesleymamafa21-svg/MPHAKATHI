import React, { useState, useEffect, useRef } from 'react';
import { VoiceSafeCode, SensitivityLevel } from '../types';

interface VoiceSafeCodeManagerProps {
    isOpen: boolean;
    onClose: () => void;
    voiceSafeCode: VoiceSafeCode | null;
    onSet: (phrase: string) => void;
    onDelete: () => void;
    sensitivity: SensitivityLevel;
    onSensitivityChange: (level: SensitivityLevel) => void;
    cancelWord: string | null;
    onCancelWordChange: (word: string | null) => void;
}

type RecordingStep = 'idle' | 'recording_initial' | 'recording_confirm' | 'verifying' | 'confirm_save' | 'saving' | 'testing';

const VoiceSafeCodeManager: React.FC<VoiceSafeCodeManagerProps> = ({
    isOpen, onClose, voiceSafeCode, onSet, onDelete, sensitivity, onSensitivityChange, cancelWord, onCancelWordChange
}) => {
    const [step, setStep] = useState<RecordingStep>('idle');
    const [firstPhrase, setFirstPhrase] = useState('');
    const [secondPhrase, setSecondPhrase] = useState('');
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [error, setError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech recognition not supported in this browser.");
            setError("Speech recognition is not supported on this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        const handleStart = () => setIsRecording(true);
        const handleEnd = () => setIsRecording(false);
        const handleError = (event: any) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsRecording(false);
        };
        const handleResult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setCurrentTranscript(transcript.trim());
        };

        recognition.addEventListener('start', handleStart);
        recognition.addEventListener('end', handleEnd);
        recognition.addEventListener('error', handleError);
        recognition.addEventListener('result', handleResult);

        return () => {
            recognition.removeEventListener('start', handleStart);
            recognition.removeEventListener('end', handleEnd);
            recognition.removeEventListener('error', handleError);
            recognition.removeEventListener('result', handleResult);
        };
    }, []);


    useEffect(() => {
        if (step === 'verifying' && firstPhrase && secondPhrase) {
            if (firstPhrase.toLowerCase().trim() === secondPhrase.toLowerCase().trim()) {
                setError('');
                setStep('confirm_save');
            } else {
                setError(`Phrases didn't match. Please try again. You said "${firstPhrase}" then "${secondPhrase}".`);
                setStep('recording_initial');
                setFirstPhrase('');
                setSecondPhrase('');
            }
        }
    }, [step, firstPhrase, secondPhrase]);
    
    useEffect(() => {
        if (!isOpen) {
            setStep('idle');
            setFirstPhrase('');
            setSecondPhrase('');
            setError('');
            setCurrentTranscript('');
            setTestResult(null);
            if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
            }
        }
    }, [isOpen, isRecording]);
    
    const handleStartRecording = () => {
        if (recognitionRef.current) {
            try {
                setCurrentTranscript('');
                setError('');
                setTestResult(null);
                recognitionRef.current.start();
            } catch (e: any) {
                 if (e.name === 'InvalidStateError') {
                    // Already started, this can happen. Ignore.
                } else {
                    console.error("Error starting speech recognition:", e);
                    setError("Could not start recording. Please check microphone permissions.");
                }
            }
        } else {
            setError("Speech recognition is not available on this browser.");
        }
    };
    
    const handleStopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleSaveRecording = () => {
        if (step === 'recording_initial') {
            if (currentTranscript.split(' ').length < 2) {
                setError("Phrase is too short. Please use at least 2 words.");
                return;
            }
            setFirstPhrase(currentTranscript);
            setCurrentTranscript('');
            setStep('recording_confirm');
        } else if (step === 'recording_confirm') {
            setSecondPhrase(currentTranscript);
            setCurrentTranscript('');
            setStep('verifying');
        }
    };

    const cancelSetup = () => {
        setStep('idle');
        setFirstPhrase('');
        setSecondPhrase('');
        setError('');
        setCurrentTranscript('');
        setTestResult(null);
        if (isRecording) {
            handleStopRecording();
        }
    };
    
    const handleConfirmSave = () => {
        setStep('saving');
        setTimeout(() => {
            onSet(firstPhrase);
            setStep('idle');
            setFirstPhrase('');
            setSecondPhrase('');
        }, 1500);
    };

    const handleConfirmTest = () => {
        if (!currentTranscript || !voiceSafeCode) return;
        if (currentTranscript.toLowerCase().includes(voiceSafeCode.phrase.toLowerCase())) {
            setTestResult('success');
            setError('');
        } else {
            setTestResult('failure');
            setError(`Did not match. We heard: "${currentTranscript}"`);
        }
    };

    const handleRecordAgain = () => {
        setFirstPhrase('');
        setSecondPhrase('');
        setError('');
        setCurrentTranscript('');
        setStep('recording_initial');
    };

    const renderRecordingStep = () => {
        const isInitialStep = step === 'recording_initial';
        const title = isInitialStep 
            ? "Step 1: Record Your Secret Code" 
            : `Step 2: Confirm: "${firstPhrase}"`;
        const instruction = isInitialStep
            ? "Choose a secret phrase. Press 'Start', speak clearly, then 'Stop'."
            : "Confirm your phrase by recording it a second time.";

        return (
            <div className="text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-6">{instruction}</p>
                
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                
                {(currentTranscript || isRecording) && (
                     <div className="my-4 p-3 bg-gray-700 rounded-md min-h-[76px]">
                        <p className="text-gray-400 text-sm">Detected Phrase:</p>
                        <p className="text-white text-lg italic">
                            {currentTranscript}
                            {isRecording && <span className="inline-block w-1 h-4 bg-yellow-400 ml-1 animate-pulse"></span>}
                        </p>
                    </div>
                )}
               
                <div className="flex justify-center items-center gap-2 md:gap-4 mt-4 flex-wrap">
                    {!isRecording ? (
                        <button onClick={handleStartRecording} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2">
                             🎙️ Start Recording
                        </button>
                    ) : (
                        <button onClick={handleStopRecording} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2 animate-pulse">
                            ⏹️ Stop Recording
                        </button>
                    )}
                    <button onClick={handleSaveRecording} disabled={isRecording || !currentTranscript} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        💾 Save Recording
                    </button>
                </div>
                <button onClick={cancelSetup} className="block mx-auto mt-6 text-sm text-gray-400 hover:text-white">Cancel Setup</button>
            </div>
        );
    };

    const renderContent = () => {
        if (step === 'recording_initial' || step === 'recording_confirm') {
            return renderRecordingStep();
        }

        if (step === 'confirm_save') {
            return (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Confirm Your New Secret Code</h3>
                    <p className="text-gray-300 mb-6">{`We successfully recorded your phrase: "${firstPhrase}". Do you want to save this as your new secret code?`}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleRecordAgain} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors">
                            Record Again
                        </button>
                        <button onClick={handleConfirmSave} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors shadow-lg">
                            Save Secret Code
                        </button>
                    </div>
                </div>
            );
        }

        const stepTitles: Record<string, string> = {
            verifying: "Verifying...",
            saving: "Saving Your Secret Code",
            testing: "Test Your Secret Code"
        };
        const stepInstructions: Record<string, string> = {
            verifying: "Comparing your voiceprints for a match...",
            saving: "Encrypting and storing your voiceprint securely...",
            testing: `Say your secret code: "${voiceSafeCode?.phrase}" now.`
        };

        if (step === 'verifying' || step === 'saving') {
            return (
                 <div className="text-center">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{stepTitles[step]}</h3>
                    <p className="text-gray-300 mb-6">{stepInstructions[step]}</p>
                    <svg className="animate-spin h-10 w-10 text-yellow-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                     <button onClick={cancelSetup} className="block mx-auto mt-6 text-sm text-gray-400 hover:text-white">Cancel Setup</button>
                </div>
            );
        }

        if (step === 'testing') {
            const hasRecordedAndWaitingForCheck = !isRecording && currentTranscript && !testResult;

            return (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{stepTitles.testing}</h3>
                    <p className="text-gray-300 mb-6">{stepInstructions.testing}</p>
                    
                    {error && !isRecording && <p className="text-red-400 text-sm mb-4">{error}</p>}
                    
                    {testResult === 'success' && (
                        <div className="my-4 p-3 bg-green-900/50 border border-green-700 rounded-md">
                            <p className="font-semibold text-green-300">✅ Success! We recognized your secret code.</p>
                        </div>
                    )}
                    {testResult === 'failure' && (
                        <div className="my-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
                            <p className="font-semibold text-red-300">❌ Match Failed. Please try again.</p>
                        </div>
                    )}

                    {(currentTranscript || isRecording) && (
                         <div className="my-4 p-3 bg-gray-700 rounded-md min-h-[76px]">
                            <p className="text-gray-400 text-sm">Heard:</p>
                            <p className="text-white text-lg italic">
                                {currentTranscript}
                                {isRecording && <span className="inline-block w-1 h-4 bg-yellow-400 ml-1 animate-pulse"></span>}
                            </p>
                        </div>
                    )}
                   
                    <div className="flex justify-center items-center gap-2 md:gap-4 mt-4 flex-wrap">
                        {isRecording && (
                            <button onClick={handleStopRecording} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2 animate-pulse">
                                ⏹️ Stop Listening
                            </button>
                        )}
                        {!isRecording && !hasRecordedAndWaitingForCheck && (
                            <button onClick={handleStartRecording} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2">
                                 {testResult ? '🔁 Test Again' : '▶️ Start Listening'}
                            </button>
                        )}
                        {hasRecordedAndWaitingForCheck && (
                             <button onClick={handleConfirmTest} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2">
                                ✅ Confirm & Check Match
                            </button>
                        )}
                    </div>
                     <button onClick={cancelSetup} className="block mx-auto mt-6 text-sm text-gray-400 hover:text-white">Back to Menu</button>
                </div>
            );
        }

        return (
            <div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Voice Secret Code</h2>
                {voiceSafeCode ? (
                    <div className="text-center p-4 bg-green-900/50 border border-green-700 rounded-lg mb-6">
                        <p className="font-semibold text-green-300">✅ Your Voice Secret Code is active.</p>
                        <p className="text-gray-400 italic">Phrase: "{voiceSafeCode.phrase}"</p>
                    </div>
                ) : (
                     <div className="text-center p-4 bg-gray-700/50 border border-gray-600 rounded-lg mb-6">
                        <p className="font-semibold text-gray-300">Your Voice Secret Code is not set.</p>
                    </div>
                )}
                <div className="space-y-4">
                    <button onClick={() => { setStep('recording_initial'); setError(''); }} className="w-full text-left flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        🎙️
                        <div>
                            <span className="font-semibold">{voiceSafeCode ? "Re-record" : "Record"} My Secret Code</span>
                            <p className="text-xs text-gray-400">Set or change your secret activation phrase.</p>
                        </div>
                    </button>
                    <button onClick={() => { setStep('testing'); setError(''); setTestResult(null); }} disabled={!voiceSafeCode} className="w-full text-left flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        🧪
                        <div>
                            <span className="font-semibold">Test My Secret Code</span>
                            <p className="text-xs text-gray-400">Check if the app recognizes your phrase.</p>
                        </div>
                    </button>
                    <button onClick={onDelete} disabled={!voiceSafeCode} className="w-full text-left flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        🗑️
                        <div>
                            <span className="font-semibold">Reset / Delete Secret Code</span>
                            <p className="text-xs text-gray-400">Requires PIN to remove your voiceprint.</p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-gray-200 mb-2">Matching Sensitivity</h4>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {(Object.values(SensitivityLevel)).map(level => (
                            <button key={level} onClick={() => onSensitivityChange(level)} className={`px-4 py-2 rounded-full transition-colors ${sensitivity === level ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-gray-200 mb-2">Safe Word to Cancel Alert</h4>
                    <p className="text-xs text-gray-400 mb-3">Set a word to cancel an SOS countdown if it's a false alarm (e.g., "I'm safe," "Cancel").</p>
                    <input 
                        type="text" 
                        placeholder="Enter cancel word (optional)" 
                        value={cancelWord || ''}
                        onChange={(e) => onCancelWordChange(e.target.value || null)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-yellow-500 text-center"
                    />
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-600 relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                {renderContent()}
            </div>
        </div>
    );
};

export default VoiceSafeCodeManager;