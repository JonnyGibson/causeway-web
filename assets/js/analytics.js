// Analytics Configuration
const MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 measurement ID

// Initialize analytics
function initAnalytics() {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID);

    // Initialize offline queue
    window.analyticsQueue = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
}

// Send analytics event
function sendAnalyticsEvent(eventName, params = {}) {
    if (navigator.onLine) {
        // Send event directly if online
        gtag('event', eventName, params);
        
        // Try to send any queued events
        processQueue();
    } else {
        // Queue event if offline
        queueEvent(eventName, params);
    }
}

// Queue offline events
function queueEvent(eventName, params) {
    const event = {
        timestamp: new Date().toISOString(),
        eventName,
        params
    };
    window.analyticsQueue.push(event);
    localStorage.setItem('analyticsQueue', JSON.stringify(window.analyticsQueue));
}

// Process queued events when online
function processQueue() {
    if (!window.analyticsQueue?.length) return;

    const queue = [...window.analyticsQueue];
    window.analyticsQueue = [];
    localStorage.setItem('analyticsQueue', '[]');

    queue.forEach(event => {
        gtag('event', event.eventName, {
            ...event.params,
            queued_time: event.timestamp
        });
    });
}

// Track audio playback
function trackAudioPlay(audioPoint) {
    sendAnalyticsEvent('audio_play', {
        audio_id: audioPoint.id,
        audio_title: audioPoint.title
    });
}

// Track audio completion
function trackAudioComplete(audioPoint) {
    sendAnalyticsEvent('audio_complete', {
        audio_id: audioPoint.id,
        audio_title: audioPoint.title
    });
}

// Track offline usage
function trackOfflineUsage() {
    sendAnalyticsEvent('offline_usage', {
        timestamp: new Date().toISOString()
    });
}

// Export analytics functions
window.siteAnalytics = {
    init: initAnalytics,
    trackAudioPlay,
    trackAudioComplete,
    trackOfflineUsage
}; 