const CACHE_NAME = 'mphakathi-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/metadata.json',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/components/Auth.tsx',
  '/components/Onboarding.tsx',
  '/components/AlertBanner.tsx',
  '/components/ActivationPromptModal.tsx',
  '/components/AudioPlayer.tsx',
  '/components/BreathingVisualizer.tsx',
  '/components/CalmAssistModal.tsx',
  '/components/SOSModal.tsx',
  '/components/ContactManagerModal.tsx',
  '/components/EmergencyContactManager.tsx',
  '/components/ContinueListeningModal.tsx',
  '/components/DeEscalationModal.tsx',
  '/components/DonationConfirmation.tsx',
  '/components/EmotionIndicator.tsx',
  '/components/ExternalResources.tsx',
  '/components/Helplines.tsx',
  '/components/MamafaLogo.tsx',
  '/components/MphakathiLogo.tsx',
  '/components/PaymentProcessing.tsx',
  '/components/PinModal.tsx',
  '/components/Profile.tsx',
  '/components/Settings.tsx',
  '/components/Help.tsx',
  '/components/SupportMission.tsx',
  '/components/SafetyTip.tsx',
  '/components/SafetyActionSuggestion.tsx',
  '/components/TipBanner.tsx',
  '/components/TranscriptionLog.tsx',
  '/components/SecurityLog.tsx',
  '/components/VoiceSafeCodeManager.tsx',
  '/components/SafetyInboxIcon.tsx',
  '/components/SafetyInbox.tsx',
  '/components/ChatView.tsx',
  '/components/GeminiChat.tsx',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.webmanifest',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});