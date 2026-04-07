/**
 * Nearly — Discovery & Feed Logic
 */

const discovery = {
    state: {
        allUsers: [],
        filteredUsers: [],
        currentCategory: 'all',
        maxDistance: 25 // km
    },

    init() {
        console.log('Discovery Initializing...');
        this.fetchFeed();
        this.setupFilterListeners();
    },

    toggleFilters() {
        const drawer = document.getElementById('filter-drawer');
        if (drawer) drawer.classList.toggle('hidden');
    },

    setDistance(val) {
        this.state.maxDistance = parseFloat(val);
        const label = document.getElementById('dist-val');
        if (label) label.textContent = val;
        this.applyFilters();
    },

    setupFilterListeners() {
        document.querySelectorAll('.pill').forEach(btn => {
            btn.onmousedown = () => { // Using onmousedown for immediate response
                this.state.currentCategory = btn.dataset.cat.toLowerCase();
                document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyFilters();
            };
        });
    },

    applyFilters() {
        this.state.filteredUsers = this.state.allUsers.filter(u => {
            const matchesCat = this.state.currentCategory === 'all' || 
                             u.category.toLowerCase() === this.state.currentCategory.toLowerCase();
            
            const distance = this.calculateDistance(u.location);
            const matchesDist = distance === null || distance <= this.state.maxDistance;

            return matchesCat && matchesDist;
        });
        
        this.renderFeed();
    },

    async fetchFeed() {
        const feedContainer = document.getElementById('feed-container');
        if (!feedContainer) return;

        try {
            if (!app.db) {
                console.warn('DB not initialized. Showing mock data.');
                this.renderMockData();
                return;
            }

            const snapshot = await app.db.collection('users').orderBy('createdAt', 'desc').limit(50).get();
            this.state.allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.state.filteredUsers = [...this.state.allUsers];

            this.renderFeed();
        } catch (err) {
            console.error('Error fetching feed:', err);
            this.renderMockData();
        }
    },

    renderFeed() {
        const feedContainer = document.getElementById('feed-container');
        if (!feedContainer) return;
        
        feedContainer.innerHTML = '';
        
        if (this.state.filteredUsers.length === 0) {
            feedContainer.innerHTML = '<div class="empty-state">No se encontró talento en esta zona.</div>';
            return;
        }

        this.state.filteredUsers.forEach(u => {
            const card = this.createCard(u);
            feedContainer.appendChild(card);
        });
    },

    createCard(user) {
        const div = document.createElement('div');
        div.className = 'card';
        
        const distance = this.calculateDistance(user.location);
        const distLabel = distance !== null ? `${distance.toFixed(1)} km` : 'Hablamos luego';

        const badgeClass = user.isAutoLoaded ? 'badge-status auto' : 'badge-status';
        const badgeLabel = user.isAutoLoaded ? 'Negocio Local' : (user.intention === 'clients' ? 'Disponible' : 'Colaborando');

        div.innerHTML = `
            <div class="card-header">
                <div class="user-info">
                    <h3 class="alias">${user.alias}</h3>
                    <span class="category">${user.category.toUpperCase()}</span>
                </div>
                <div class="${badgeClass}">${badgeLabel}</div>
            </div>
            <p class="description">${user.description}</p>
            <div class="card-footer">
                <span class="distance">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" style="vertical-align: middle; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ${distLabel}
                </span>
                <button class="btn-profile" onclick="app.navigate('profile-detail', '${user.id}')">Ver perfil</button>
            </div>
        `;
        
        return div;
    },

    calculateDistance(loc) {
        if (!loc || !app.state.location) return null;
        
        const lat1 = app.state.location.lat;
        const lon1 = app.state.location.lng;
        const lat2 = loc.latitude;
        const lon2 = loc.longitude;

        return this.haversine(lat1, lon1, lat2, lon2);
    },

    haversine(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    renderMockData() {
        const baseMocks = [
            { id: '1', alias: 'DJ Norte', category: 'DJ', description: 'Beats electrónicos para eventos locales.', intention: 'clients', location: { latitude: 29.07, longitude: -110.95 } },
            { id: '2', alias: 'Arq. Creative', category: 'Designer', description: 'Diseño de interiores y renders 3D.', intention: 'collab', location: { latitude: 29.08, longitude: -110.96 } }
        ];
        
        // Merge with seeds if available
        const seeds = (typeof SEED_DATA !== 'undefined') ? SEED_DATA : [];
        this.state.allUsers = [...baseMocks, ...seeds];
        this.state.filteredUsers = [...this.state.allUsers];
        this.renderFeed();
    }
};

window.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'discovery') {
        discovery.init();
    }
});
