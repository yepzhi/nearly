/**
 * Nearly — Core App Logic (v1.4)
 */

window.app = {
    state: {
        currentView: 'welcome',
        user: null,
        isAuth: false,
        location: null // { lat, lng }
    },

    async init() {
        console.log('Nearly Initializing...');
        
        // --- Firebase Initializer ---
        this.initFirebase();

        // Check auth
        const uid = localStorage.getItem('nearly_uid');
        if (uid) {
            this.state.isAuth = true;
            // Optionally fetch real user from Firestore here
        }

        this.navigate(this.state.isAuth ? 'discovery' : 'welcome');
    },

    initFirebase() {
        try {
            if (typeof firebaseConfig !== 'undefined' || window.firebaseConfig) {
                const config = window.firebaseConfig || firebaseConfig;
                firebase.initializeApp(config);
                window.db = firebase.firestore();
                console.log('Firebase (Firestore) Connected.');
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
        if (!main) return;

        const template = document.getElementById(`view-${viewId}`);
        if (!template) {
            console.error('Template not found:', viewId);
            return;
        }

        main.innerHTML = template.innerHTML;
        this.updateNav(viewId);

        // Handle URL Params for Public Profile
        if (viewId === 'profile-detail' && params) {
            localStorage.setItem('last_viewed_user', params);
        }

        // Trigger custom events for other modules
        window.dispatchEvent(new CustomEvent('viewChanged', { detail: { viewId, params } }));
    },

    updateNav(viewId) {
        const nav = document.getElementById('main-nav');
        const hideOn = ['welcome', 'register', 'location', 'profile-setup'];
        
        if (hideOn.includes(viewId)) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === viewId);
            });
        }
    },

    showToast(msg, type = 'success') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
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
