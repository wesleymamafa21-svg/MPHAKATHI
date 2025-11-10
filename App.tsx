import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GeminiBlob, Chat } from '@google/genai';
import { User, Emotion, EmotionState, Alert, AlertLevel, TranscriptionEntry, Gender, EmergencyContact, SimulatedUser, CompletedRecording, CalmAssistStyle, SensitivityLevel, VoiceSafeCode, SecurityLogEntry, CheckInInterval, ReminderInterval, SafetyInboxThread, SafetyInboxStatus, SafetyInboxMessage, AcousticAnalysis, SafetyAction, ChatMessage } from './types';
import { analyzeEmotion, getSafetyTip, analyzeAcousticDistress, getSafetyActions, initializeChat } from './services/geminiService';
import EmotionIndicator from './components/EmotionIndicator';
import AlertBanner from './components/AlertBanner';
import TranscriptionLog from './components/TranscriptionLog';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Help from './components/Help';
import Donate from './components/SupportMission';
import SOSModal from './components/SOSModal';
import PinModal from './components/PinModal';
import ContinueListeningModal from './components/ContinueListeningModal';
import DeEscalationModal from './components/DeEscalationModal';
import CalmAssistModal from './components/CalmAssistModal';
import PaymentProcessing from './components/PaymentProcessing';
import DonationConfirmation from './components/DonationConfirmation';
import VoiceSafeCodeManager from './components/VoiceSafeCodeManager';
import SafetyInboxIcon from './components/SafetyInboxIcon';
import SafetyInbox from './components/SafetyInbox';
import ChatView from './components/ChatView';
import GeminiChat from './components/GeminiChat';
import MamafaLogo from './components/MamafaLogo';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import TipBanner from './components/TipBanner';
import ContactManagerModal from './components/ContactManagerModal';
import RequiredActionBanner from './components/RequiredActionBanner';
import SafetyActionSuggestion from './components/SafetyActionSuggestion';
import MphakathiLogo from './components/MphakathiLogo';


// Helper functions for audio encoding as per Gemini docs
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data for playback
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface LiveSession {
  close: () => void;
  sendRealtimeInput: (input: { media: GeminiBlob }) => void;
}

const VscReminderBanner: React.FC<{
  isVisible: boolean;
  onDismiss: () => void;
  phrase: string;
}> = ({ isVisible, onDismiss, phrase }) => {
  if (!isVisible || !phrase) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 md:w-auto max-w-lg p-4 rounded-lg shadow-2xl text-white font-semibold flex items-center z-50 border-2 bg-blue-600/90 border-blue-700`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>Reminder: Your Voice Secret Code is "<strong>{phrase}</strong>"</span>
      <button onClick={onDismiss} className="ml-auto text-xl font-bold">&times;</button>
    </div>
  );
};


const AUTO_SOS_THRESHOLD = 80;
const AUTO_SOS_TIMER_SECONDS = 15;
const RECORDING_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const CALM_ASSIST_THRESHOLD = 60;
const CALM_ASSIST_COOLDOWN_MS = 60 * 1000;


const RecordingConsentModal: React.FC<{
    isOpen: boolean;
    onConsent: (allow: boolean) => void;
    onClose: () => void;
}> = ({ isOpen, onConsent, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-600">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Record Audio?</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    You can optionally save a recording of this session to your device. Recordings are saved in 30-minute segments and can be downloaded from your profile.
                </p>
                <div className="flex justify-end gap-4 flex-wrap">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-full transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onConsent(false)}
                        className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-full transition-colors"
                    >
                        Activate Only
                    </button>
                    <button
                        onClick={() => onConsent(true)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors shadow-lg"
                    >
                        Record & Activate
                    </button>
                </div>
            </div>
        </div>
    );
};

type View = 'main' | 'profile' | 'settings' | 'help' | 'donate' | 'payment-processing' | 'donation-confirmation' | 'inbox' | 'chat' | 'gemini-chat';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('mphakathi_theme') as 'light' | 'dark') || 'dark';
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Ready to activate');
    const [emotionState, setEmotionState] = useState<EmotionState>({ emotion: Emotion.Neutral, intensity: 0, confidence: 0 });
    const [acousticAnalysis, setAcousticAnalysis] = useState<AcousticAnalysis | null>(null);
    const [alert, setAlert] = useState<Alert | null>(null);
    const [transcriptionLog, setTranscriptionLog] = useState<TranscriptionEntry[]>([]);
    const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
    const [safetyTip, setSafetyTip] = useState<string>('');
    const [view, setView] = useState<View>('main');
    const [autoSosCountdown, setAutoSosCountdown] = useState<number | null>(null);
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
    const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
    const [simulatedUsers, setSimulatedUsers] = useState<SimulatedUser[]>([]);
    const [liveTranscript, setLiveTranscript] = useState<string>('');
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [completedRecordings, setCompletedRecordings] = useState<CompletedRecording[]>([]);
    const [pin, setPin] = useState<string | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinAction, setPinAction] = useState<(() => void) | null>(null);
    const [pinError, setPinError] = useState('');
    const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
    const [isDeEscalationModalOpen, setIsDeEscalationModalOpen] = useState(false);
    const [isCalmAssistModalOpen, setIsCalmAssistModalOpen] = useState(false);
    const [calmAssistStyle, setCalmAssistStyle] = useState<CalmAssistStyle>(CalmAssistStyle.Soothing);
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [donationAmount, setDonationAmount] = useState<number>(0);
    const [sensitivity, setSensitivity] = useState<SensitivityLevel>(SensitivityLevel.Medium);
    const [isVscReminderVisible, setIsVscReminderVisible] = useState(false);
    const [isTipBannerVisible, setIsTipBannerVisible] = useState(false);
    // Voice Secret Code State
    const [voiceSafeCode, setVoiceSafeCode] = useState<VoiceSafeCode | null>(null);
    const [cancelSafeWord, setCancelSafeWord] = useState<string | null>(null);
    const [voiceSafeCodeSensitivity, setVoiceSafeCodeSensitivity] = useState<SensitivityLevel>(SensitivityLevel.Medium);
    const [securityLog, setSecurityLog] = useState<SecurityLogEntry[]>([]);
    const [voiceSafeCodeMatch, setVoiceSafeCodeMatch] = useState<{ probability: number } | null>(null);
    const [isVoiceCodeModalOpen, setIsVoiceCodeModalOpen] = useState(false);
    // Safety Inbox State
    const [safetyInbox, setSafetyInbox] = useState<SafetyInboxThread[]>([]);
    const [unreadInboxCount, setUnreadInboxCount] = useState(0);
    const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
    const [moderateConfidenceTrigger, setModerateConfidenceTrigger] = useState<{ confidence: number, triggerType: string } | null>(null);
    // Contact Management State
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isContactPickerSupported, setIsContactPickerSupported] = useState(false);
    const [contactsSkipped, setContactsSkipped] = useState(false);
    const [vscSkipped, setVscSkipped] = useState(false);
    const [safetyAction, setSafetyAction] = useState<SafetyAction | null>(null);
    // Chatbot State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatbotResponding, setIsChatbotResponding] = useState(false);
    // FIX: Define state for check-in and reminder intervals.
    const [checkInInterval, setCheckInInterval] = useState<CheckInInterval>(CheckInInterval.FifteenMinutes);
    const [reminderInterval, setReminderInterval] = useState<ReminderInterval>(ReminderInterval.OneHour);


    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const notificationAudioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const currentTranscriptionRef = useRef('');
    const autoSosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const checkinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const vscReminderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const deEscalationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const calmAssistCooldownRef = useRef(false);
    const emotionStateRef = useRef(emotionState);
    emotionStateRef.current = emotionState;
    const silentActivationInProgress = useRef(false);
    const moderateConfidenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tipBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const chatSessionRef = useRef<Chat | null>(null);


    const isListeningRef = useRef(isListening);
    isListeningRef.current = isListening;

    useEffect(() => {
        const root = window.document.documentElement;
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');

        if (theme === 'dark') {
            root.classList.add('dark');
            themeColorMeta?.setAttribute('content', '#111827');
        } else {
            root.classList.remove('dark');
            themeColorMeta?.setAttribute('content', '#ffffff');
        }
        localStorage.setItem('mphakathi_theme', theme);
    }, [theme]);

    const fetchSafetyTip = useCallback(async (user: User) => {
        if (!user.gender) return;
        setSafetyTip('Fetching new tip...');
        const tip = await getSafetyTip(user.gender, user.isSurvivor);
        setSafetyTip(tip);
    }, []);

    // Effect to check for Contact Picker API support
    useEffect(() => {
        if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
            setIsContactPickerSupported(true);
        }
    }, []);

    // Effect to handle PWA installation prompt
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Effect for periodic safety tip pop-ups
    useEffect(() => {
        if (!currentUser?.gender) return;

        const showTipBanner = () => {
            fetchSafetyTip(currentUser); // Fetch a new tip
            setIsTipBannerVisible(true);
            
            if (tipBannerTimerRef.current) clearTimeout(tipBannerTimerRef.current);
            tipBannerTimerRef.current = setTimeout(() => {
                setIsTipBannerVisible(false);
            }, 15000); // Show for 15 seconds
        };

        // Show first tip shortly after login
        const initialTimeout = setTimeout(showTipBanner, 10000); // 10 seconds after login
        
        // Then show periodically
        const tipInterval = setInterval(showTipBanner, 3 * 60 * 1000); // Every 3 minutes

        return () => {
            clearInterval(tipInterval);
            clearTimeout(initialTimeout);
            if (tipBannerTimerRef.current) clearTimeout(tipBannerTimerRef.current);
        };
    }, [currentUser, fetchSafetyTip]);

    // Generate simulated users on initial load
    useEffect(() => {
        const names = ['Alex R.', 'Jordan M.', 'Taylor S.', 'Casey L.', 'Morgan P.', 'Riley T.', 'Jamie K.', 'Skyler B.'];
        const avatars = ['👤', '🧑', '👩', '🤖', '🥸', '😎', '🤓', '🤠'];
        const users = Array.from({ length: 7 }, () => ({
            id: `user_${crypto.randomUUID()}`,
            name: names[Math.floor(Math.random() * names.length)],
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
        }));
        setSimulatedUsers(users);
    }, []);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            // Automatic login is disabled. User state is now set exclusively through the Auth component.

            const savedPin = localStorage.getItem('mphakathi_pin');
            if (savedPin) setPin(savedPin);
            
            const parseWithDate = (key: string, value: any) => {
                const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
                if (typeof value === 'string' && isoDateRegex.test(value)) {
                    return new Date(value);
                }
                return value;
            };

            const savedHistory = localStorage.getItem('mphakathi_transcriptionHistory');
            if (savedHistory) setTranscriptionLog(JSON.parse(savedHistory, parseWithDate));
            
            const savedContacts = localStorage.getItem('mphakathi_emergencyContacts');
            if (savedContacts) setEmergencyContacts(JSON.parse(savedContacts));

            const savedCalmStyle = localStorage.getItem('mphakathi_calmAssistStyle');
            if (savedCalmStyle) setCalmAssistStyle(JSON.parse(savedCalmStyle));

            const savedSensitivity = localStorage.getItem('mphakathi_sensitivity');
            if (savedSensitivity) setSensitivity(JSON.parse(savedSensitivity));

            // Load Voice Secret Code settings
            const savedVsc = localStorage.getItem('mphakathi_vsc');
            if (savedVsc) setVoiceSafeCode(JSON.parse(savedVsc));
            
            const savedCancelWord = localStorage.getItem('mphakathi_vsc_cancel');
            if (savedCancelWord) setCancelSafeWord(JSON.parse(savedCancelWord));

            const savedVscSensitivity = localStorage.getItem('mphakathi_vsc_sensitivity');
            if (savedVscSensitivity) setVoiceSafeCodeSensitivity(JSON.parse(savedVscSensitivity));

            const savedSecurityLog = localStorage.getItem('mphakathi_securityLog');
            if (savedSecurityLog) setSecurityLog(JSON.parse(savedSecurityLog, parseWithDate));
            
            const savedCheckIn = localStorage.getItem('mphakathi_checkInInterval');
            if (savedCheckIn) setCheckInInterval(JSON.parse(savedCheckIn));
            
            const savedReminder = localStorage.getItem('mphakathi_reminderInterval');
            if (savedReminder) setReminderInterval(JSON.parse(savedReminder));
            
            const savedInbox = localStorage.getItem('mphakathi_inbox');
            if (savedInbox) setSafetyInbox(JSON.parse(savedInbox, parseWithDate));
            
            const savedUnreadCount = localStorage.getItem('mphakathi_unread_inbox');
            if (savedUnreadCount) setUnreadInboxCount(JSON.parse(savedUnreadCount));

            const savedContactsSkipped = localStorage.getItem('mphakathi_contacts_skipped');
            if (savedContactsSkipped) setContactsSkipped(JSON.parse(savedContactsSkipped));

            const savedVscSkipped = localStorage.getItem('mphakathi_vsc_skipped');
            if (savedVscSkipped) setVscSkipped(JSON.parse(savedVscSkipped));


        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        try {
            if (currentUser) {
                localStorage.setItem('mphakathi_user', JSON.stringify(currentUser));
            }
            localStorage.setItem('mphakathi_transcriptionHistory', JSON.stringify(transcriptionLog));
            localStorage.setItem('mphakathi_calmAssistStyle', JSON.stringify(calmAssistStyle));
            localStorage.setItem('mphakathi_sensitivity', JSON.stringify(sensitivity));
            localStorage.setItem('mphakathi_vsc', JSON.stringify(voiceSafeCode));
            localStorage.setItem('mphakathi_vsc_cancel', JSON.stringify(cancelSafeWord));
            localStorage.setItem('mphakathi_vsc_sensitivity', JSON.stringify(voiceSafeCodeSensitivity));
            localStorage.setItem('mphakathi_securityLog', JSON.stringify(securityLog));
            localStorage.setItem('mphakathi_checkInInterval', JSON.stringify(checkInInterval));
            localStorage.setItem('mphakathi_reminderInterval', JSON.stringify(reminderInterval));
            localStorage.setItem('mphakathi_inbox', JSON.stringify(safetyInbox));
            localStorage.setItem('mphakathi_unread_inbox', JSON.stringify(unreadInboxCount));
            localStorage.setItem('mphakathi_contacts_skipped', JSON.stringify(contactsSkipped));
            localStorage.setItem('mphakathi_vsc_skipped', JSON.stringify(vscSkipped));
        } catch (error) {
             console.error("Failed to save settings to localStorage", error);
        }
    }, [currentUser, transcriptionLog, calmAssistStyle, sensitivity, voiceSafeCode, cancelSafeWord, voiceSafeCodeSensitivity, securityLog, checkInInterval, reminderInterval, safetyInbox, unreadInboxCount, contactsSkipped, vscSkipped]);


    const createBlob = (data: Float32Array): GeminiBlob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    };
    
    const intervalToMs = useCallback((interval: CheckInInterval | ReminderInterval): number | null => {
        switch (interval) {
            case CheckInInterval.FifteenMinutes: return 15 * 60 * 1000;
            case CheckInInterval.ThirtyMinutes: return 30 * 60 * 1000;
            case CheckInInterval.OneHour:
            case ReminderInterval.OneHour: return 60 * 60 * 1000;
            case ReminderInterval.TwoHours: return 2 * 60 * 1000;
            case ReminderInterval.FourHours: return 4 * 60 * 1000;
            case CheckInInterval.Never:
            case ReminderInterval.Never:
            default: return null;
        }
    }, []);
    
    const playNotificationSound = useCallback(() => {
        if (!notificationAudioContextRef.current) {
            notificationAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioCtx = notificationAudioContextRef.current;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        
        setTimeout(() => {
             oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        }, 100);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    }, []);

    const sendEmergencyAlerts = useCallback((trigger: string, isSilent: boolean = false) => {
        // --- 1. Alert Emergency Contacts ---
        if (emergencyContacts.length === 0) {
            setAlert({ level: AlertLevel.Critical, message: `DANGER! No emergency contacts set. Please add them in your profile.` });
        } else {
            const locationInfo = location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : "GPS coordinates unavailable";
            const time = new Date().toLocaleString();
            const name = currentUser?.fullName || 'The user of this device';
            const message = `🚨 Mphakathi Emergency Alert 🚨
Distress sound (${trigger}) detected from ${name}.
Location (shared for safety): ${locationInfo}
Time: ${time}
Mphakathi Network has been notified.
– Mphakathi App`;
            
            console.log("--- SENDING EMERGENCY ALERTS ---");
            console.log("Message:", message);
            console.log("To Contacts:", emergencyContacts);
            console.log("---------------------------------");
            
            const alertLevel = isSilent ? AlertLevel.Warning : AlertLevel.Critical;
            const alertMessage = location 
                ? `Emergency alert with your location sent to ${emergencyContacts.length} contacts.`
                : `Emergency alert sent to ${emergencyContacts.length} contacts. (Location not available)`;
            setAlert({ level: alertLevel, message: alertMessage });
        }

        // --- 2. Simulate Receiving a Distress Alert for the Inbox ---
        const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
        if (!randomUser) return;
        
        const newThread: SafetyInboxThread = {
            id: crypto.randomUUID(),
            userName: randomUser.name,
            avatar: randomUser.avatar,
            location: {
                latitude: (location?.latitude ?? 0) + (Math.random() - 0.5) * 0.05,
                longitude: (location?.longitude ?? 0) + (Math.random() - 0.5) * 0.05,
            },
            timestamp: new Date(),
            status: SafetyInboxStatus.ActiveDanger,
            messages: [{
                id: crypto.randomUUID(),
                sender: 'contact',
                type: 'text',
                content: `⚠️ A distress sound has been detected near your area.`,
                timestamp: new Date(),
            }]
        };

        setSafetyInbox(prev => [newThread, ...prev]);
        setUnreadInboxCount(prev => prev + 1);
        playNotificationSound();
        if ('vibrate' in navigator) navigator.vibrate(200);
        // This alert is separate and more specific to the inbox feature
        setTimeout(() => {
            setAlert({level: AlertLevel.Warning, message: `⚠️ New distress alert from ${randomUser.name} in your Safety Inbox.`});
        }, 1000);

    }, [emergencyContacts, location, currentUser, simulatedUsers, playNotificationSound]);


    const resetSosState = useCallback(() => {
        if (autoSosTimerRef.current) {
            clearTimeout(autoSosTimerRef.current);
            autoSosTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (deEscalationTimerRef.current) {
            clearTimeout(deEscalationTimerRef.current);
            deEscalationTimerRef.current = null;
        }
        setAutoSosCountdown(null);
        setIsDeEscalationModalOpen(false);
    }, []);
    
    const handleNewTurn = useCallback(async (text: string) => {
        const newEntry: TranscriptionEntry = {
            id: crypto.randomUUID(),
            text,
            timestamp: new Date(),
            emotionState: null
        };
      
        if (voiceSafeCode && text.toLowerCase().includes(voiceSafeCode.phrase.toLowerCase())) {
            setVoiceSafeCodeMatch({ probability: 0.9 });
            // Don't analyze emotion if safe code is spoken, prioritize action
            return; 
        }

        if (cancelSafeWord && autoSosCountdown !== null && text.toLowerCase().includes(cancelSafeWord.toLowerCase())) {
            setAlert({ level: AlertLevel.Warning, message: "SOS Alert cancelled by safe word." });
            resetSosState();
            return;
        }

        // Run both analyses in parallel
        const [analysisResult, acousticResult] = await Promise.all([
            analyzeEmotion(text),
            analyzeAcousticDistress(text)
        ]);

        setTranscriptionLog(prev => [...prev, {...newEntry, emotionState: analysisResult}]);
        setEmotionState(analysisResult);
        setAcousticAnalysis(acousticResult);

        if (analysisResult && acousticResult) {
            const action = await getSafetyActions(analysisResult, acousticResult);
            setSafetyAction(action);
        }

    }, [voiceSafeCode, cancelSafeWord, autoSosCountdown, resetSosState]);
    
    const handleEmergencyTrigger = useCallback((triggerType: string, confidence: number) => {
        if (autoSosTimerRef.current) return;
        
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

        const newLogEntry: SecurityLogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            triggerType: triggerType,
            details: `Location: ${location?.latitude?.toFixed(4) || 'N/A'}, ${location?.longitude?.toFixed(4) || 'N/A'}`,
            confidence: confidence,
        };
        setSecurityLog(prev => [newLogEntry, ...prev]);

        sendEmergencyAlerts(triggerType);

        setAutoSosCountdown(AUTO_SOS_TIMER_SECONDS);
        countdownIntervalRef.current = setInterval(() => setAutoSosCountdown(prev => (prev ? prev - 1 : 0)), 1000);
        autoSosTimerRef.current = setTimeout(() => {
            sendEmergencyAlerts(triggerType); // Resend for confirmation
            resetSosState();
        }, AUTO_SOS_TIMER_SECONDS * 1000);

        // Start a short 15-second recording
        if (mediaStreamRef.current) {
            const stream = mediaStreamRef.current;
            const emergencyRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const chunks: Blob[] = [];
            emergencyRecorder.ondataavailable = (e) => chunks.push(e.data);
            emergencyRecorder.onstop = () => {
                 const blob = new Blob(chunks, { type: 'audio/webm' });
                 if (blob.size > 0) {
                     setCompletedRecordings(prev => [...prev, {
                         id: `emergency_${crypto.randomUUID()}`,
                         blob,
                         timestamp: new Date()
                     }]);
                     setAlert({ level: AlertLevel.Warning, message: 'A 15-second emergency clip has been saved.' });
                 }
            };
            emergencyRecorder.start();
            setTimeout(() => {
                if (emergencyRecorder.state === 'recording') {
                    emergencyRecorder.stop();
                }
            }, 15000); // Record for 15 seconds
        }


    }, [resetSosState, location, sendEmergencyAlerts]);

    const triggerSilentEmergencyMode = useCallback((confidence: number) => {
        if (silentActivationInProgress.current) return;
        silentActivationInProgress.current = true;
        
        if ('vibrate' in navigator) navigator.vibrate(200);

        const trigger = 'Voice Secret Code';
        const newLogEntry: SecurityLogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            triggerType: trigger,
            details: `Location: ${location?.latitude?.toFixed(4) || 'N/A'}, ${location?.longitude?.toFixed(4) || 'N/A'}`,
            confidence: confidence,
        };
        setSecurityLog(prev => [newLogEntry, ...prev]);

        sendEmergencyAlerts(trigger, true);
        
        if (mediaStreamRef.current) {
            const stream = mediaStreamRef.current;
            const silentRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const chunks: Blob[] = [];
            silentRecorder.ondataavailable = (e) => chunks.push(e.data);
            silentRecorder.onstop = () => {
                 const blob = new Blob(chunks, { type: 'audio/webm' });
                 if (blob.size > 0) {
                     setCompletedRecordings(prev => [...prev, {
                         id: `silent_emergency_${crypto.randomUUID()}`,
                         blob,
                         timestamp: new Date()
                     }]);
                 }
            };
            silentRecorder.start();
            setTimeout(() => {
                if (silentRecorder.state === 'recording') {
                    silentRecorder.stop();
                }
            }, 15000);
        } else {
            console.warn("Could not start silent recording: media stream not available.");
        }
        
        setVoiceSafeCodeMatch(null); // Reset trigger
        setTimeout(() => {
            silentActivationInProgress.current = false;
        }, 10000); // Cooldown to prevent immediate re-triggering

    }, [location, sendEmergencyAlerts]);

    const forceStopListening = useCallback((closeSession = true) => {
        if (!isListeningRef.current && !closeSession) return;
        resetSosState();
        if (checkinIntervalRef.current) clearInterval(checkinIntervalRef.current);
        if (vscReminderIntervalRef.current) clearInterval(vscReminderIntervalRef.current);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        if (closeSession && sessionPromiseRef.current) sessionPromiseRef.current.then(session => session.close());
        processorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => {});
        sessionPromiseRef.current = null;
        processorRef.current = null;
        mediaStreamSourceRef.current = null;
        currentTranscriptionRef.current = '';
        setLiveTranscript('');
        setIsListening(false);
        setStatusMessage('Ready to activate');
    }, [resetSosState]);

    const startSession = useCallback(async (shouldRecord: boolean) => {
        if (!process.env.API_KEY) {
            setStatusMessage("Error: API_KEY is not configured.");
            return;
        }
        if (isListeningRef.current) return;
        if (shouldRecord && !window.MediaRecorder) {
            setAlert({ level: AlertLevel.Warning, message: "Audio recording is not supported on this browser. Continuing without recording." });
            shouldRecord = false;
        }

        // Reset chat session to get updated location
        chatSessionRef.current = null; 

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                setLocation(coords);
                if (!chatSessionRef.current) {
                    chatSessionRef.current = initializeChat(coords);
                }
            },
            () => {
                setStatusMessage("Warning: Location access denied. Reporting will be limited.");
                if (!chatSessionRef.current) {
                    chatSessionRef.current = initializeChat(null);
                }
            }
        );
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setIsListening(true);
            setStatusMessage('Connecting...');

            if (shouldRecord) {
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
                mediaRecorderRef.current.onstop = handleRecordingStop;
                mediaRecorderRef.current.start();
                recordingTimerRef.current = setInterval(cycleRecording, RECORDING_INTERVAL_MS);
            }

            if (checkinIntervalRef.current) clearInterval(checkinIntervalRef.current);
            const checkInMs = intervalToMs(checkInInterval);
            if (checkInMs) {
                checkinIntervalRef.current = setInterval(() => setIsContinueModalOpen(true), checkInMs);
            }

            if (vscReminderIntervalRef.current) clearInterval(vscReminderIntervalRef.current);
            const reminderMs = intervalToMs(reminderInterval);
            if (reminderMs && voiceSafeCode) {
                vscReminderIntervalRef.current = setInterval(() => setIsVscReminderVisible(true), reminderMs);
            }


            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatusMessage('Listening...');
                        currentTranscriptionRef.current = '';
                        setLiveTranscript('');
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        processorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        mediaStreamSourceRef.current.connect(processorRef.current);
                        processorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentTranscriptionRef.current += message.serverContent.inputTranscription.text;
                            setLiveTranscript(currentTranscriptionRef.current);
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullTranscription = currentTranscriptionRef.current.trim();
                            if(fullTranscription) handleNewTurn(fullTranscription);
                            currentTranscriptionRef.current = '';
                            setLiveTranscript('');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatusMessage('Error occurred. Please try again.');
                        forceStopListening();
                    },
                    onclose: (e: CloseEvent) => {
                         setStatusMessage('Session closed.');
                         forceStopListening(false);
                    },
                },
                config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (error) {
            console.error('Failed to get media devices.', error);
            setStatusMessage('Microphone access denied.');
            setIsListening(false);
        }
    }, [handleNewTurn, forceStopListening, intervalToMs, checkInInterval, reminderInterval, voiceSafeCode]);

    // Multi-Detection Fusion Logic
    useEffect(() => {
        if (moderateConfidenceTimerRef.current) {
            clearTimeout(moderateConfidenceTimerRef.current);
            moderateConfidenceTimerRef.current = null;
        }

        // Confidence from text-based emotion analysis
        const langConfidence = (emotionState.emotion === Emotion.Danger) ? emotionState.confidence : 0;
        
        // Confidence from acoustic analysis (via text)
        const acousticConfidence = acousticAnalysis ? acousticAnalysis.detection_confidence : 0;
        const acousticTriggerStatus = acousticAnalysis ? acousticAnalysis.trigger_status : 'none';
        const acousticDistressType = acousticAnalysis ? acousticAnalysis.distress_type : 'none';

        // Confidence from Voice Secret Code match
        const safeCodeConfidence = voiceSafeCodeMatch ? voiceSafeCodeMatch.probability : 0;

        const sensitivityMultipliers = {
            [SensitivityLevel.Low]: 0.8,
            [SensitivityLevel.Medium]: 1.0,
            [SensitivityLevel.High]: 1.2,
        };
        
        const adjustedAcousticConfidence = acousticConfidence * sensitivityMultipliers[sensitivity];
        const adjustedSafeCodeConfidence = safeCodeConfidence * sensitivityMultipliers[voiceSafeCodeSensitivity];
        
        // Determine the primary trigger
        const confidenceLevels = [
            { value: langConfidence, type: 'Danger Keyword' as const },
            { value: adjustedAcousticConfidence, type: (acousticDistressType !== 'none' ? `Acoustic: ${acousticDistressType}` : 'Acoustic Event') },
            { value: adjustedSafeCodeConfidence, type: 'Voice Secret Code' as const },
        ];
        
        const { value: overallConfidence, type: triggerType } = confidenceLevels.reduce((max, current) => current.value > max.value ? current : max, { value: -1, type: 'Danger Keyword' as const });

        const isCalm = emotionState.intensity < 40 && ![Emotion.Danger, Emotion.Angry, Emotion.Fearful].includes(emotionState.emotion) && emotionState.confidence < 0.5 && acousticTriggerStatus === 'none';

        // HIGH CONFIDENCE
        if (overallConfidence >= 0.85 || acousticTriggerStatus === 'high') {
            setModerateConfidenceTrigger(null);
            
            if (triggerType === 'Voice Secret Code') {
                 if (!isListeningRef.current) {
                    setStatusMessage('Voice Secret Code detected. Activating Mphakathi...');
                    startSession(true).then(() => {
                        triggerSilentEmergencyMode(overallConfidence);
                    });
                } else {
                    triggerSilentEmergencyMode(overallConfidence);
                }
                return;
            }

            setIsCalmAssistModalOpen(false);
            if (deEscalationTimerRef.current) clearTimeout(deEscalationTimerRef.current);
            if (isDeEscalationModalOpen) setIsDeEscalationModalOpen(false);
            
            handleEmergencyTrigger(triggerType, overallConfidence);

        // MODERATE CONFIDENCE
        } else if (overallConfidence >= 0.70 || acousticTriggerStatus === 'medium') {
            if (!moderateConfidenceTrigger) {
                setModerateConfidenceTrigger({ confidence: overallConfidence, triggerType });
                moderateConfidenceTimerRef.current = setTimeout(() => {
                    const latestEmotionState = emotionStateRef.current;
                    const latestLangConfidence = latestEmotionState.emotion === Emotion.Danger ? latestEmotionState.confidence : 0;
                    
                    if (latestLangConfidence >= 0.70) {
                         handleEmergencyTrigger('Danger Keyword', latestLangConfidence);
                    }
                    setModerateConfidenceTrigger(null);
                }, 3000);
            }
        } else {
            // LOW CONFIDENCE
            setModerateConfidenceTrigger(null);
        }

        if (isCalm && autoSosTimerRef.current) {
            if (!deEscalationTimerRef.current) {
                deEscalationTimerRef.current = setTimeout(() => {
                    const latestEmotion = emotionStateRef.current;
                    const isStillCalm = latestEmotion.intensity < 40 && ![Emotion.Danger, Emotion.Angry, Emotion.Fearful].includes(latestEmotion.emotion);
                    if (isStillCalm) {
                        if (autoSosTimerRef.current) clearTimeout(autoSosTimerRef.current);
                        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                        autoSosTimerRef.current = null;
                        countdownIntervalRef.current = null;
                        setIsDeEscalationModalOpen(true);
                    }
                    deEscalationTimerRef.current = null;
                }, 20 * 1000);
            }
        } else if (!isCalm && deEscalationTimerRef.current) {
            clearTimeout(deEscalationTimerRef.current);
            deEscalationTimerRef.current = null;
        }
        
    }, [emotionState, acousticAnalysis, voiceSafeCodeMatch, voiceSafeCodeSensitivity, sensitivity, isDeEscalationModalOpen, handleEmergencyTrigger, triggerSilentEmergencyMode, startSession, moderateConfidenceTrigger]);

    // Effect for Calm Assist
    useEffect(() => {
        const isDistressed = (
            emotionState.emotion === Emotion.Angry ||
            emotionState.emotion === Emotion.Stressed ||
            emotionState.emotion === Emotion.Fearful
        ) && emotionState.intensity >= CALM_ASSIST_THRESHOLD;

        if (isDistressed && !isCalmAssistModalOpen && !calmAssistCooldownRef.current && autoSosCountdown === null) {
            setIsCalmAssistModalOpen(true);
            calmAssistCooldownRef.current = true;
            setTimeout(() => { calmAssistCooldownRef.current = false; }, CALM_ASSIST_COOLDOWN_MS);
        }

    }, [emotionState, isCalmAssistModalOpen, autoSosCountdown]);


    const handleRecordingStop = () => {
        if (recordedChunksRef.current.length === 0) return;
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) {
            setCompletedRecordings(prev => [...prev, { id: crypto.randomUUID(), blob, timestamp: new Date() }]);
            setAlert({level: AlertLevel.Warning, message: 'A 30-minute audio segment has been saved.'});
        }
        recordedChunksRef.current = [];
    };

    const cycleRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.start();
        }
    };

    
    const stopListening = useCallback(() => {
        if (!pin) {
            setAlert({ level: AlertLevel.Warning, message: 'Please set a PIN in your profile to deactivate.' });
            setView('settings');
            return;
        }
        setPinAction(() => forceStopListening);
        setIsPinModalOpen(true);
        setPinError('');
    }, [pin, forceStopListening]);

    useEffect(() => {
        return () => { forceStopListening(); };
    }, [forceStopListening]);

    const handleUserUpdate = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        if (updatedUser.gender) {
            fetchSafetyTip(updatedUser);
        } else {
            setSafetyTip('');
        }
    };
    
    const handleSetPin = (newPin: string) => {
        setPin(newPin);
        localStorage.setItem('mphakathi_pin', newPin);
        setAlert({ level: AlertLevel.Warning, message: 'Security PIN has been updated.' });
    };

    const clearHistory = () => {
        setTranscriptionLog([]);
        setCompletedRecordings([]);
        localStorage.removeItem('mphakathi_transcriptionHistory');
    };

    const handleManageContactsFromDevice = async () => {
        if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
            try {
                const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: true });
                if (contacts.length > 0) {
                    const limitedContacts = contacts.slice(0, 5);
                    setEmergencyContacts(limitedContacts);
                    localStorage.setItem('mphakathi_emergencyContacts', JSON.stringify(limitedContacts));
                    setAlert({level: AlertLevel.Warning, message: `${limitedContacts.length} emergency contacts saved.`});
                    setContactsSkipped(false);
                }
            } catch (ex) {
                setAlert({level: AlertLevel.Warning, message: "Failed to access contacts."});
            }
        } else {
            setAlert({level: AlertLevel.Warning, message: "Contact Picker API not supported on this browser."});
        }
    };

    const handleAddManualContact = (name: string, tel: string) => {
        if (!name.trim() || !tel.trim()) {
            setAlert({ level: AlertLevel.Warning, message: 'Name and phone number cannot be empty.' });
            return;
        }
        const newContact: EmergencyContact = {
            name: [name],
            tel: [tel],
        };
        const updatedContacts = [...emergencyContacts, newContact].slice(0, 5); // Limit to 5
        setEmergencyContacts(updatedContacts);
        localStorage.setItem('mphakathi_emergencyContacts', JSON.stringify(updatedContacts));
        setAlert({ level: AlertLevel.Warning, message: `${name} has been added.` });
        setContactsSkipped(false);
    };

    const handleRemoveContact = (telToRemove: string) => {
        const contactToRemove = emergencyContacts.find(c => c.tel[0] === telToRemove);
        const updatedContacts = emergencyContacts.filter(c => c.tel[0] !== telToRemove);
        setEmergencyContacts(updatedContacts);
        localStorage.setItem('mphakathi_emergencyContacts', JSON.stringify(updatedContacts));
        if (contactToRemove) {
            setAlert({ level: AlertLevel.Warning, message: `${contactToRemove.name[0]} removed.` });
        }
    };

    const handleSendTestAlert = () => {
        if (emergencyContacts.length === 0) {
            setAlert({ level: AlertLevel.Warning, message: 'Please add at least one emergency contact first.' });
            return;
        }

        const name = currentUser?.fullName || 'The user';
        const locationInfo = location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : "not available";

        const testMessage = ` Mphakathi Test Alert 
This is a test from ${name}. 
Their current location is: ${locationInfo}. 
If you received this, the system is working.
– Mphakathi App`;

        console.log("--- SENDING TEST ALERT ---");
        console.log("Message:", testMessage);
        console.log("To Contacts:", emergencyContacts);
        console.log("--------------------------");
        
        const alertMessage = location 
            ? `A test alert with your location has been simulated for your ${emergencyContacts.length} contacts. Please confirm with them.`
            : `A test alert has been simulated for your ${emergencyContacts.length} contacts. Location was not available.`;
        
        setAlert({ level: AlertLevel.Warning, message: alertMessage });
    };

    const handleSendMessage = (message: string) => {
         const recipientCount = emergencyContacts.length + simulatedUsers.length;
         setAlert({ level: AlertLevel.Critical, message: `Alert sent to ${recipientCount} recipients.` });
         setIsSOSModalOpen(false);
         console.log('--- EMERGENCY MESSAGE SENT ---', { message, emergencyContacts, simulatedUsers });
    };

    const handleConsent = (allowRecording: boolean) => {
        setShowConsentModal(false);
        startSession(allowRecording);
    };

    const handleDonation = (amount: number) => {
        setDonationAmount(amount);
        setView('payment-processing');
    };

    const handlePaymentSuccess = () => setView('donation-confirmation');

    const handlePaymentFailure = () => {
        setAlert({ level: AlertLevel.Warning, message: 'Your donation could not be processed. Please try again.' });
        setView('donate');
    };

    const handleDeEscalationCancel = () => {
        setPinAction(() => () => {
            setAlert({ level: AlertLevel.Warning, message: 'SOS Alert has been cancelled.' });
            resetSosState();
        });
        setIsPinModalOpen(true);
        setPinError('');
    };

    const handlePinSubmit = (submittedPin: string) => {
        if (submittedPin === pin) {
            setIsPinModalOpen(false);
            setPinError('');
            pinAction?.();
            setPinAction(null);
        } else {
            setPinError('Incorrect PIN. Please try again.');
        }
    };
    
    const handleConfirmSafe = () => {
        setIsContinueModalOpen(false);
        if (checkinIntervalRef.current) clearInterval(checkinIntervalRef.current);
        const checkInMs = intervalToMs(checkInInterval);
        if (checkInMs) {
            checkinIntervalRef.current = setInterval(() => setIsContinueModalOpen(true), checkInMs);
        }
    };

    const handleStopFromSafetyCheck = () => {
        setIsContinueModalOpen(false);
        stopListening();
    };

    const handleDeEscalateAndKeepMonitoring = () => {
        resetSosState();
        setIsDeEscalationModalOpen(false);
        setAlert({level: AlertLevel.Warning, message: "SOS countdown paused. Continuing to monitor."});
    };

    const handleDeEscalateAndSend = () => {
        sendEmergencyAlerts("Situation Escalated");
        resetSosState();
    };
    
    const handleInstallApp = () => {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            installPromptEvent.userChoice.then((choice: { outcome: string }) => setInstallPromptEvent(null));
        }
    };

    const handleSetVoiceSafeCode = (phrase: string) => {
        // Simulate creating a voiceprint by hashing the phrase.
        // In a real app, this would be a complex ML-derived embedding.
        const voiceprint = `voiceprint_for_${phrase.replace(/\s/g, '_')}_${Date.now()}`;
        setVoiceSafeCode({ phrase, voiceprint });
        setAlert({ level: AlertLevel.Warning, message: 'Voice Secret Code has been set.' });
    };

    const handleDeleteVoiceSafeCode = () => {
        if (!pin) {
            setAlert({ level: AlertLevel.Warning, message: 'Please set a PIN in your profile first.' });
            setView('settings');
            return;
        }
        setPinAction(() => () => {
            setVoiceSafeCode(null);
            setAlert({ level: AlertLevel.Warning, message: 'Voice Secret Code has been deleted.' });
        });
        setIsPinModalOpen(true);
        setPinError('');
    };
    
    const handleViewInbox = () => {
        setView('inbox');
        setUnreadInboxCount(0);
        localStorage.setItem('mphakathi_unread_inbox', '0');
    };

    const handleOpenChat = (threadId: string) => {
        setActiveChatThreadId(threadId);
        setView('chat');
    };

    const handleSendMessageInChat = (threadId: string, type: 'text' | 'audio', content: string) => {
        setSafetyInbox(prevInbox => {
            const newInbox = [...prevInbox];
            const threadIndex = newInbox.findIndex(t => t.id === threadId);
            if (threadIndex === -1) return prevInbox;

            const newMessage: SafetyInboxMessage = {
                id: crypto.randomUUID(),
                sender: 'user',
                type,
                content,
                timestamp: new Date(),
            };
            newInbox[threadIndex].messages.push(newMessage);
            
            // Simulate auto-reply
            setTimeout(() => {
                let autoReplyText: string;
                if (type === 'audio') {
                    autoReplyText = "I've received your voice note and am listening now.";
                } else {
                    autoReplyText = content.toLowerCase().includes("i'm safe")
                        ? "Thank you for confirming. I'm glad you're okay."
                        : content.toLowerCase().includes("help is on the way")
                        ? "Thank you so much. I'm at the location sent."
                        : "Okay, I see your message. Please advise.";
                }

                const autoReply: SafetyInboxMessage = {
                    id: crypto.randomUUID(),
                    sender: 'contact',
                    type: 'text',
                    content: autoReplyText,
                    timestamp: new Date(),
                };

                const newStatus = type === 'text' && content.toLowerCase().includes("i'm safe") ? SafetyInboxStatus.Safe : newInbox[threadIndex].status;

                setSafetyInbox(currentInbox => {
                    const updatedInbox = [...currentInbox];
                    const currentThreadIndex = updatedInbox.findIndex(t => t.id === threadId);
                    if (currentThreadIndex === -1) return currentInbox;
                    updatedInbox[currentThreadIndex].messages.push(autoReply);
                    updatedInbox[currentThreadIndex].status = newStatus;
                    return updatedInbox;
                });

            }, 1500 + Math.random() * 1000);

            return newInbox;
        });
    };
    
    const handleResolveIncident = (threadId: string) => {
        setSafetyInbox(prev => prev.map(thread => 
            thread.id === threadId ? { ...thread, status: SafetyInboxStatus.Safe } : thread
        ));
    };

    const handleAuthSuccess = (user: User) => {
        const savedPin = localStorage.getItem('mphakathi_pin');
        if(savedPin) setPin(savedPin);
        
        const savedVsc = localStorage.getItem('mphakathi_vsc');
        if(savedVsc) setVoiceSafeCode(JSON.parse(savedVsc));

        const savedContacts = localStorage.getItem('mphakathi_emergencyContacts');
        if(savedContacts) setEmergencyContacts(JSON.parse(savedContacts));

        setCurrentUser(user);
        localStorage.setItem('mphakathi_user', JSON.stringify(user));

        setAlert({ level: AlertLevel.Success, message: `Welcome, ${user.fullName.split(' ')[0]}! A welcome email has been sent.` });
        
        if (user.isSurvivor) {
            setSensitivity(SensitivityLevel.High);
            setAlert({ level: AlertLevel.Warning, message: "For your safety, detection sensitivity has been set to High." });
        }
        if (user.gender) {
            fetchSafetyTip(user);
        }
        setView('main');
    };

    const handleLogout = () => {
        // Clear sensitive user data from localStorage
        localStorage.removeItem('mphakathi_user');
        localStorage.removeItem('mphakathi_pin');
        localStorage.removeItem('mphakathi_transcriptionHistory');
        localStorage.removeItem('mphakathi_emergencyContacts');
        localStorage.removeItem('mphakathi_vsc');
        localStorage.removeItem('mphakathi_vsc_cancel');
        localStorage.removeItem('mphakathi_securityLog');
        localStorage.removeItem('mphakathi_inbox');
        localStorage.removeItem('mphakathi_unread_inbox');
        localStorage.removeItem('mphakathi_contacts_skipped');
        localStorage.removeItem('mphakathi_vsc_skipped');
    
        // Reset component state
        setCurrentUser(null);
        setTranscriptionLog([]);
        setCompletedRecordings([]);
        setSecurityLog([]);
        setVscSkipped(false);
        setContactsSkipped(false);
        setEmergencyContacts([]);
        setSafetyInbox([]);
        setUnreadInboxCount(0);
        setPin(null);
        setVoiceSafeCode(null);
        setCancelSafeWord(null);
        setView('main'); // This will redirect to the Auth component because currentUser is null
    };

    const handleSkipVsc = () => {
        setVscSkipped(true);
        setAlert({ level: AlertLevel.Warning, message: 'Voice Secret Code skipped. You can set it up later in Settings.' });
    };

    const handleSkipContacts = () => {
        setContactsSkipped(true);
        setAlert({ level: AlertLevel.Warning, message: 'Emergency contacts skipped. Please add them soon for full protection.' });
    };

    const handleCancelSosRequest = () => {
        setPinAction(() => resetSosState);
        setIsPinModalOpen(true);
        setPinError('');
    };

    const handleSendChatMessage = async (message: string) => {
        if (!message.trim() || isChatbotResponding) return;
    
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: message,
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatbotResponding(true);
    
        if (!chatSessionRef.current) {
            setChatMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'system', text: 'Chat is not initialized. Please ensure location permissions are enabled and try again.', timestamp: new Date() }]);
            setIsChatbotResponding(false);
            return;
        }
        
        try {
            const stream = await chatSessionRef.current.sendMessageStream({ message });
            
            let modelResponseText = '';
            let groundingChunks: any[] | undefined = [];
            const modelMessageId = crypto.randomUUID();
    
            setChatMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '', timestamp: new Date() }]);
    
            for await (const chunk of stream) {
                modelResponseText = chunk.text;
                if (chunk.candidates && chunk.candidates[0].groundingMetadata) {
                     groundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
                }
                
                setChatMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId 
                    ? { ...msg, text: modelResponseText, groundingChunks } 
                    : msg
                ));
            }
    
            if (modelResponseText.trim() === '') {
                 setChatMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId 
                    ? { ...msg, text: "I'm sorry, I couldn't generate a response. Please try rephrasing your question." } 
                    : msg
                ));
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            setChatMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'system',
                text: 'Sorry, I encountered an error. Please check your connection and try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsChatbotResponding(false);
        }
    };

    const renderMainView = () => (
      <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-6 animate-fade-in">
        <MphakathiLogo />
        <EmotionIndicator emotionState={emotionState} isListening={isListening} isCountingDown={autoSosCountdown !== null} />
        <div className="text-center">
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mt-2">{statusMessage}</p>
             {moderateConfidenceTrigger && (
                <p className="text-sm text-yellow-400 animate-pulse">Moderate distress detected. Monitoring closely...</p>
            )}
        </div>
        
        {autoSosCountdown !== null && (
            <div className="p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-center">
                <p className="text-xl text-red-300 font-bold">SOS in {autoSosCountdown}s</p>
                <button onClick={handleCancelSosRequest} className="mt-2 px-4 py-1 bg-red-600 hover:bg-red-700 rounded-full text-sm">Cancel</button>
            </div>
        )}

        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-4">
            {!isListening ? (
                <button
                    onClick={() => {
                        if (!currentUser?.gender) {
                            setAlert({ level: AlertLevel.Warning, message: 'Please complete your profile in Settings first.' });
                            setView('settings');
                            return;
                        }
                        setShowConsentModal(true);
                    }}
                    className="w-full md:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
                >
                    Activate
                </button>
            ) : (
                <button
                    onClick={stopListening}
                    className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
                >
                    Deactivate
                </button>
            )}
            <button
                onClick={() => setIsSOSModalOpen(true)}
                className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
                Send SOS
            </button>
        </div>

        <SafetyActionSuggestion action={safetyAction} />
        <TranscriptionLog entries={transcriptionLog} liveTranscript={liveTranscript} emptyMessage="Activate to see transcription here..." />
        
        <div className="absolute top-4 right-4 flex gap-3">
             <button onClick={() => setView('settings')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Open Settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
             <button onClick={() => setView('help')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Open Help">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>
             <button onClick={() => setView('donate')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Donate">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             </button>
             <SafetyInboxIcon unreadCount={unreadInboxCount} onClick={handleViewInbox} />
             <button onClick={() => setView('profile')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Open Profile">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
        </div>
        <button
            onClick={() => setView('gemini-chat')}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-20 transition-transform transform hover:scale-110"
            aria-label="Open AI Assistant"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      </div>
    );
    
    const activeChatThread = safetyInbox.find(t => t.id === activeChatThreadId);

    useEffect(() => {
        // If the user is on the chat view but the thread doesn't exist (e.g., cleared inbox),
        // redirect them back to the inbox to prevent a blank screen.
        if (view === 'chat' && !activeChatThread) {
            setView('inbox');
        }
    }, [view, activeChatThread]);


    if (!currentUser) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <Auth onAuthSuccess={handleAuthSuccess} />
            </div>
        );
    }
    
    const isOnboardingComplete = (voiceSafeCode || vscSkipped) && (emergencyContacts.length > 0 || contactsSkipped) && !!pin;

    if (!isOnboardingComplete) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <Onboarding
                    userName={currentUser.fullName}
                    vscIsSet={!!voiceSafeCode}
                    vscSkipped={vscSkipped}
                    contactsAreSet={emergencyContacts.length > 0}
                    contactsSkipped={contactsSkipped}
                    pinIsSet={!!pin}
                    onSetVoiceSafeCode={handleSetVoiceSafeCode}
                    onManageContacts={() => setIsContactModalOpen(true)}
                    onSetPin={handleSetPin}
                    onSkipContacts={handleSkipContacts}
                    onSkipVsc={handleSkipVsc}
                />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <AlertBanner alert={alert} onDismiss={() => setAlert(null)} />
            <RequiredActionBanner
                isVisible={currentUser !== null && isOnboardingComplete && emergencyContacts.length === 0}
                message="Critical: No emergency contacts are set. Mphakathi cannot send alerts."
                buttonText="Add Contacts Now"
                onAction={() => setIsContactModalOpen(true)}
            />
            <VscReminderBanner 
                isVisible={isVscReminderVisible}
                onDismiss={() => setIsVscReminderVisible(false)}
                phrase={voiceSafeCode?.phrase || ''}
            />
            <TipBanner
                isVisible={isTipBannerVisible}
                onDismiss={() => setIsTipBannerVisible(false)}
                tip={safetyTip}
            />
            
            <ContactManagerModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                emergencyContacts={emergencyContacts}
                onAddManualContact={handleAddManualContact}
                onRemoveContact={handleRemoveContact}
                onManageContactsFromDevice={handleManageContactsFromDevice}
                isContactPickerSupported={isContactPickerSupported}
            />
            <RecordingConsentModal 
                isOpen={showConsentModal} 
                onConsent={handleConsent} 
                onClose={() => setShowConsentModal(false)}
            />
            <SOSModal 
                isOpen={isSOSModalOpen} 
                onClose={() => setIsSOSModalOpen(false)} 
                contacts={emergencyContacts}
                simulatedUsers={simulatedUsers}
                onSend={handleSendMessage}
                location={location}
                userName={currentUser.fullName}
            />
            <PinModal 
                isOpen={isPinModalOpen}
                onClose={() => {setIsPinModalOpen(false); setPinAction(null);}}
                onSubmit={handlePinSubmit}
                error={pinError}
            />
            <ContinueListeningModal 
                isOpen={isContinueModalOpen}
                onConfirmSafe={handleConfirmSafe}
                onStop={handleStopFromSafetyCheck}
            />
            <DeEscalationModal 
                isOpen={isDeEscalationModalOpen}
                onCancelAlert={handleDeEscalationCancel}
                onKeepMonitoring={handleDeEscalateAndKeepMonitoring}
                onSendAnyway={handleDeEscalateAndSend}
            />
            <CalmAssistModal
                isOpen={isCalmAssistModalOpen}
                onClose={() => setIsCalmAssistModalOpen(false)}
                calmAssistStyle={calmAssistStyle}
            />
            <VoiceSafeCodeManager
                isOpen={isVoiceCodeModalOpen}
                onClose={() => setIsVoiceCodeModalOpen(false)}
                voiceSafeCode={voiceSafeCode}
                onSet={handleSetVoiceSafeCode}
                onDelete={handleDeleteVoiceSafeCode}
                sensitivity={voiceSafeCodeSensitivity}
                onSensitivityChange={setVoiceSafeCodeSensitivity}
                cancelWord={cancelSafeWord}
                onCancelWordChange={setCancelSafeWord}
            />
            
            <main className="w-full flex-1 flex items-center justify-center z-10">
                 {view === 'main' && renderMainView()}
                 {view === 'profile' && (
                    <Profile
                        history={transcriptionLog}
                        onClearHistory={clearHistory}
                        onBack={() => setView('main')}
                        recordings={completedRecordings}
                        securityLog={securityLog}
                        onClearSecurityLog={() => setSecurityLog([])}
                        onClearInbox={() => setSafetyInbox([])}
                    />
                 )}
                 {view === 'settings' && (
                    <Settings
                        user={currentUser}
                        onUserUpdate={handleUserUpdate}
                        pinIsSet={!!pin}
                        onSetPin={handleSetPin}
                        calmAssistStyle={calmAssistStyle}
                        onCalmAssistStyleChange={setCalmAssistStyle}
                        sensitivity={sensitivity}
                        onSensitivityChange={setSensitivity}
                        checkInInterval={checkInInterval}
                        onCheckInIntervalChange={setCheckInInterval}
                        reminderInterval={reminderInterval}
                        onReminderIntervalChange={setReminderInterval}
                        onManageVoiceCode={() => setIsVoiceCodeModalOpen(true)}
                        canInstall={!!installPromptEvent}
                        onInstallApp={handleInstallApp}
                        onLogout={handleLogout}
                        onBack={() => setView('main')}
                        theme={theme}
                        onThemeChange={setTheme}
                    />
                 )}
                {view === 'help' && (
                    <Help
                        emergencyContacts={emergencyContacts}
                        onManageContacts={() => setIsContactModalOpen(true)}
                        onSendTestAlert={handleSendTestAlert}
                        onBack={() => setView('main')}
                        safetyTip={safetyTip}
                        onNewTip={() => currentUser && fetchSafetyTip(currentUser)}
                    />
                )}
                {view === 'donate' && (
                    <Donate onDonate={handleDonation} onBack={() => setView('main')} />
                )}
                {view === 'inbox' && (
                    <SafetyInbox
                        threads={safetyInbox}
                        onOpenChat={handleOpenChat}
                        onResolve={handleResolveIncident}
                        onBack={() => setView('main')}
                    />
                )}
                {view === 'chat' && activeChatThread && (
                     <ChatView 
                        thread={activeChatThread}
                        onSendMessage={handleSendMessageInChat}
                        onBack={() => setView('inbox')}
                     />
                )}
                {view === 'gemini-chat' && (
                    <GeminiChat 
                        messages={chatMessages}
                        onSendMessage={handleSendChatMessage}
                        isResponding={isChatbotResponding}
                        onBack={() => setView('main')}
                    />
                )}
                 {view === 'payment-processing' && (
                    <PaymentProcessing 
                        amount={donationAmount}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                    />
                 )}
                {view === 'donation-confirmation' && (
                    <DonationConfirmation onDone={() => setView('donate')} />
                )}
            </main>

            {view === 'main' && (
                <footer className="absolute bottom-4 left-0 right-0 text-center w-full z-0 animate-fade-in">
                    <MamafaLogo />
                </footer>
            )}
        </div>
    );
};

export default App;
