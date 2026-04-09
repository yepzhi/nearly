/**
 * Nearly — Core App Logic (v1.6.0)
 * Elite Silver & Gold Edition
 */

window.app = {
    state: {
        currentView: 'welcome',
        user: null,
        isAuth: false,
        location: null 
    },

    async init() {
        console.log('Nearly Elite Initializing...');
        
        // --- Firebase Initializer ---
        this.initFirebase();

        // Handle Reveal Animation
        const revealer = document.getElementById('page-revealer');
        setTimeout(() => {
            if (revealer) revealer.classList.add('hidden');
        }, 1500);

        // Check if location is already set in localStorage
        const savedLoc = localStorage.getItem('nearly_location');
        if (savedLoc) {
            this.state.location = JSON.parse(savedLoc);
            this.state.isAuth = !!localStorage.getItem('nearly_uid');
            this.navigate('discovery');
        } else {
            this.navigate('welcome');
        }
    },

    initFirebase() {
        try {
            if (typeof window.firebaseConfig !== 'undefined') {
                firebase.initializeApp(window.firebaseConfig);
                window.db = firebase.firestore();
                console.log('Firebase (Firestore) Elite Connected.');
            } else {
                console.warn('Firebase Config missing. Running in Seeds/Offline mode.');
            }
        } catch (err) {
            console.error('Firebase Init Error:', err);
        }
    },

    navigate(viewId, params) {
        this.state.currentView = viewId;
        const main = document.getElementById('main-view');
        const header = document.getElementById('main-header');
        const nav = document.getElementById('main-nav');

        const template = document.getElementById(`view-${viewId}`);
        if (!template) return;

        main.innerHTML = template.innerHTML;

        // Visual rules for Views
        if (viewId === 'welcome' || viewId === 'register') {
            header.classList.add('hidden');
            nav.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
            nav.classList.remove('hidden');
            
            // Sync Nav Active State
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === viewId);
            });
        }

        // Custom Logic Triggers
        if (viewId === 'discovery') {
            // Re-bind Search & Filter events after template injection
            discovery.setupListeners();
        }

        if (viewId === 'profile-detail' && params) {
            localStorage.setItem('last_viewed_user', params);
        }

        window.dispatchEvent(new CustomEvent('viewChanged', { detail: { viewId, params } }));
    },

    showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass`;
        toast.style.borderColor = type === 'success' ? 'var(--gold)' : '#ff6b6b';
        toast.innerHTML = `<span>${msg}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        setTimeout(() => toast.remove(), 3000);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();

    // Nav Listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => app.navigate(btn.dataset.view);
    });
});
