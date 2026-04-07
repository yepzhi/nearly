/**
 * Nearly — Core App Logic
 */

const app = {
    state: {
        currentView: 'welcome',
        user: null, // Temporary user data during onboarding
        location: null,
        isAuth: false
    },

    init() {
        console.log('Nearly Initializing...');
        this.setupEventListeners();
        this.navigate('welcome');
        this.initFirebase();
    },

    setupEventListeners() {
        // Nav items
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.navigate(view);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },

    initFirebase() {
        // Config placeholders (To be replaced by setup.sh or injected by GH Actions)
        const firebaseConfig = {
            apiKey: "FIREBASE_API_KEY",
            authDomain: "FIREBASE_AUTH_DOMAIN",
            projectId: "FIREBASE_PROJECT_ID",
            storageBucket: "FIREBASE_STORAGE_BUCKET",
            messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
            appId: "FIREBASE_APP_ID"
        };

        if (firebaseConfig.apiKey !== "FIREBASE_API_KEY") {
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            console.log('Firebase Connected');
        } else {
            console.warn('Firebase Config missing. Run scripts/setup.sh or set GH Secrets.');
        }
    },

    navigate(viewId, viewData) {
        const container = document.getElementById('main-view');
        const template = document.getElementById(`view-${viewId}`);
        
        if (!template) {
            console.error(`View template not found: ${viewId}`);
            return;
        }

        // Store view data to localStorage if it's meant for a specific view
        if (viewId === 'profile-detail' && viewData) {
            localStorage.setItem('last_viewed_user', viewData);
        }

        // Clone and inject template
        container.innerHTML = '';
        container.appendChild(template.content.cloneNode(true));
        
        this.state.currentView = viewId;
        window.scrollTo(0, 0);

        // UI Adjustments
        const nav = document.getElementById('main-nav');
        if (['discovery', 'connections', 'profile'].includes(viewId)) {
            nav.classList.remove('hidden');
        } else {
            nav.classList.add('hidden');
        }

        // Dispatch view change event for specific logic (like refreshing discovery)
        window.dispatchEvent(new CustomEvent('viewChanged', { detail: { viewId, viewData } }));
    },

    showToast(message, type = 'success') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }
};

// Start app
window.addEventListener('DOMContentLoaded', () => app.init());
