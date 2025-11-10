import React, { useState, useEffect, useRef } from 'react';
import MphakathiLogo from './MphakathiLogo';

interface OnboardingProps {
    userName: string;
    vscIsSet: boolean;
    vscSkipped: boolean;
    contactsAreSet: boolean;
    contactsSkipped: boolean;
    pinIsSet: boolean;
    onSetVoiceSafeCode: (phrase: string) => void;
    onManageContacts: () => void;
    onSetPin: (pin: string) => void;
    onSkipContacts: () => void;
    onSkipVsc: () => void;
}

type VscStep = 'idle' | 'recording_initial' | 'recording_confirm' | 'verifying' | 'confirm_save' | 'saving';

const ProgressStep: React.FC<{ number: number; title: string; isActive: boolean; isComplete: boolean }> = ({ number, title, isActive, isComplete }) => {
    const activeClass = isActive ? 'border-yellow-400 text-yellow-400' : 'border-gray-600 text-gray-400';
    const completeClass = isComplete ? 'border-green-500 bg-green-500 text-black' : activeClass;
    
    return (
        <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-all ${completeClass}`}>
                {isComplete ? '✓' : number}
            </div>
            <span className={`ml-2 font-semibold transition-colors ${isActive || isComplete ? 'text-white' : 'text-gray-500'}`}>{title}</span>
        </div>
    );
};

const Onboarding: React.FC<OnboardingProps> = ({
    userName, vscIsSet, vscSkipped, contactsAreSet, pinIsSet, contactsSkipped,
    onSetVoiceSafeCode, onManageContacts, onSetPin, onSkipContacts, onSkipVsc
}) => {
    
    const [vscStep, setVscStep] = useState<VscStep>('idle');
    const [firstPhrase, setFirstPhrase] = useState('');
    const [secondPhrase, setSecondPhrase] = useState('');
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [error, setError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    let currentStep = 1;
    if (vscIsSet || vscSkipped) currentStep = 2;
    if ((vscIsSet || vscSkipped) && (contactsAreSet || contactsSkipped)) currentStep = 3;
    if ((vscIsSet || vscSkipped) && (contactsAreSet || contactsSkipped) && pinIsSet) currentStep = 4;


    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition is not supported on this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        const handleResult = (event: any) => {
            const transcript = Array.from(event.results).map((result: any) => result[0]).map((result: any) => result.transcript).join('');
            setCurrentTranscript(transcript.trim());
        };
        const handleEnd = () => setIsRecording(false);
        recognition.addEventListener('result', handleResult);
        recognition.addEventListener('end', handleEnd);
        return () => {
            recognition.removeEventListener('result', handleResult);
            recognition.removeEventListener('end', handleEnd);
            recognition.abort();
        };
    }, []);

    const startRecording = () => {
        if (recognitionRef.current) {
            setCurrentTranscript('');
            setError('');
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleVscNext = () => {
        if (vscStep === 'idle') {
            setVscStep('recording_initial');
        } else if (vscStep === 'recording_initial') {
            if (currentTranscript.split(' ').length < 2) {
                setError("Phrase is too short. Please use at least 2 words.");
                return;
            }
            setFirstPhrase(currentTranscript);
            setCurrentTranscript('');
            setVscStep('recording_confirm');
        } else if (vscStep === 'recording_confirm') {
            setSecondPhrase(currentTranscript);
            setCurrentTranscript('');
            if (currentTranscript.toLowerCase().trim() === firstPhrase.toLowerCase().trim()) {
                setError('');
                onSetVoiceSafeCode(firstPhrase);
            } else {
                setError(`Phrases didn't match. Please try again.`);
                setVscStep('recording_initial');
                setFirstPhrase('');
                setSecondPhrase('');
            }
        }
    };

    const renderVscSetup = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Set Your Voice Secret Code</h3>
            <p className="text-gray-300 mb-6">
                This phrase will silently activate an emergency alert. Choose something easy to remember but not obvious.
            </p>
            {vscStep === 'recording_initial' && <p className="text-gray-400 mb-4">Step 1: Record your phrase.</p>}
            {vscStep === 'recording_confirm' && <p className="text-gray-400 mb-4">Step 2: Confirm by saying it again: <span className="font-bold text-white">"{firstPhrase}"</span></p>}
            
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
                    <button onClick={startRecording} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2">
                         🎙️ Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors flex items-center gap-2 animate-pulse">
                        ⏹️ Stop Recording
                    </button>
                )}
            </div>
             <button onClick={handleVscNext} disabled={isRecording || !currentTranscript} className="mt-6 w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                {vscStep === 'recording_initial' ? 'Next' : 'Confirm & Save'}
            </button>
            <p className="text-xs text-gray-500 mt-3">Can't do this right now? <button onClick={onSkipVsc} className="font-semibold text-gray-300 hover:underline">Skip for Now</button></p>
        </div>
    );
    
    const renderContactsSetup = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Add Emergency Contacts</h3>
            <p className="text-gray-300 mb-6">
                Add trusted friends or family who will be alerted in an emergency. We recommend adding up to 5 contacts. This is a critical safety step.
            </p>
             <button
                onClick={onManageContacts}
                className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg"
            >
                Add Contacts
            </button>
            <p className="text-xs text-gray-500 mt-3">Can't do this right now? <button onClick={onSkipContacts} className="font-semibold text-gray-300 hover:underline">Skip for Now</button></p>
        </div>
    );

    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const handleSetPin = () => {
        if (!/^\d{4}$/.test(pinInput)) {
            setPinError('PIN must be exactly 4 digits.');
            return;
        }
        onSetPin(pinInput);
        setPinError('');
    };

    const renderPinSetup = () => (
        <div className="text-center">
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Set Your Security PIN</h3>
            <p className="text-gray-300 mb-6">
                 A 4-digit PIN is required to securely deactivate monitoring. This prevents someone else from stopping the app during an emergency.
            </p>
            <input 
                type="password" 
                placeholder="Enter 4-digit PIN" 
                value={pinInput} 
                onChange={e => setPinInput(e.target.value)}
                className="w-full max-w-xs mx-auto bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500 text-center text-3xl tracking-[.5em]"
                maxLength={4}
                pattern="\d{4}"
                inputMode="numeric"
                autoComplete="new-password"
            />
            {pinError && <p className="text-red-400 text-sm mt-2">{pinError}</p>}
            <button
                onClick={handleSetPin}
                className="mt-6 w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg"
            >
                Set PIN & Finish Setup
            </button>
        </div>
    );

    const renderCurrentStep = () => {
        if (!vscIsSet && !vscSkipped) return renderVscSetup();
        if (!contactsAreSet && !contactsSkipped) return renderContactsSetup();
        if (!pinIsSet) return renderPinSetup();
        return <p>All done! Redirecting...</p>;
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
             <header className="text-center mb-8">
                <MphakathiLogo />
                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                    <span className="text-yellow-400">Welcome,</span><span className="text-white"> {userName.split(' ')[0]}!</span>
                </h2>
                <p className="text-gray-400 mt-2">Let's quickly set up your core safety features.</p>
            </header>
            
            <div className="flex justify-around items-center my-8 p-4 bg-gray-800/50 rounded-full">
                <ProgressStep number={1} title="Voice Code" isActive={currentStep === 1} isComplete={vscIsSet} />
                <div className={`flex-1 h-1 mx-2 rounded-full ${vscIsSet || vscSkipped ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <ProgressStep number={2} title="Contacts" isActive={currentStep === 2} isComplete={contactsAreSet} />
                 <div className={`flex-1 h-1 mx-2 rounded-full ${contactsAreSet || contactsSkipped ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <ProgressStep number={3} title="PIN" isActive={currentStep === 3} isComplete={pinIsSet} />
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 min-h-[300px] flex items-center justify-center">
                {renderCurrentStep()}
            </div>
        </div>
    );
};

export default Onboarding;