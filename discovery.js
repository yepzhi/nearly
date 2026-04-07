/**
 * Nearly — Discovery & Feed Logic (v1.5)
 */

window.discovery = {
    state: {
        allUsers: [],
        filteredUsers: [],
        filters: {
            category: 'all',
            search: '',
            maxDistance: 25 // default 25km
        }
    },

    init() {
        console.log('Nearly Discovery Initializing...');
        this.fetchFeed();
        this.setupListeners();
    },

    async fetchFeed() {
        // Fallback to real SEED_DATA (100 Hermosillo businesses)
        this.state.allUsers = (typeof SEED_DATA !== 'undefined') ? SEED_DATA : [];
        
        // In a real scenario, this would merge Firestore live talent
        if (window.db) {
            try {
                const snapshot = await window.db.collection('talentos').get();
                const liveUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.state.allUsers = [...this.state.allUsers, ...liveUsers];
            } catch (err) {
                console.warn('Could not fetch live talent, using seeds.');
            }
        }

        this.applyFilters();
    },

    applyFilters() {
        const { category, search, maxDistance } = this.state.filters;
        
        this.state.filteredUsers = this.state.allUsers.filter(user => {
            const matchesCat = category === 'all' || user.category.toLowerCase() === category.toLowerCase();
            const matchesSearch = !search || 
                user.alias.toLowerCase().includes(search.toLowerCase()) || 
                user.description.toLowerCase().includes(search.toLowerCase());
            
            const dist = this.calculateDistance(user.location);
            const matchesDist = dist === null || dist <= maxDistance;

            return matchesCat && matchesSearch && matchesDist;
        });

        // Sort by distance (PROXIMITY FIRST)
        this.state.filteredUsers.sort((a, b) => {
            const da = this.calculateDistance(a.location) || 9999;
            const db = this.calculateDistance(b.location) || 9999;
            return da - db;
        });

        this.renderFeed();
    },

    calculateDistance(targetLoc) {
        if (!app.state.location || !targetLoc) return null;
        
        const R = 6371; // Earth's radius in km
        const dLat = (targetLoc.latitude - app.state.location.latitude) * Math.PI / 180;
        const dLon = (targetLoc.longitude - app.state.location.longitude) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(app.state.location.latitude * Math.PI / 180) * 
                  Math.cos(targetLoc.latitude * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    renderFeed() {
        const container = document.getElementById('feed-container');
        if (!container) return;

        if (this.state.filteredUsers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.5;">
                    <p>No hay resultados para esta zona/filtro.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.state.filteredUsers.forEach(user => {
            container.appendChild(this.createCard(user));
        });
    },

    createCard(user) {
        const div = document.createElement('div');
        div.className = 'card glass-card';
        div.onclick = () => {
            localStorage.setItem('last_viewed_user', user.id);
            app.navigate('profile-detail', user.id);
        };

        const distance = this.calculateDistance(user.location);
        const distLabel = distance !== null ? `${distance.toFixed(1)} km` : '---';
        const initials = user.alias.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        div.innerHTML = `
            <div class="card-rating">
                <svg width="12" height="12" fill="var(--gold)" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                ${user.rating || '4.5'}
            </div>
            <div class="card-avatar">${initials}</div>
            <div class="card-title">${user.alias}</div>
            <div class="card-cat">${user.category}</div>
            <div class="card-dist">A ${distLabel} de ti</div>
        `;

        return div;
    },

    setupListeners() {
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.state.filters.search = e.target.value;
                this.applyFilters();
            }
        });

        document.addEventListener('click', (e) => {
            const catBtn = e.target.closest('[data-cat]');
            if (catBtn) {
                document.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active', 'btn-silver'));
                document.querySelectorAll('[data-cat]').forEach(b => b.classList.add('btn-ghost'));
                catBtn.classList.remove('btn-ghost');
                catBtn.classList.add('active', 'btn-silver');
                this.state.filters.category = catBtn.dataset.cat;
                this.applyFilters();
            }
        });
    }
};

window.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'discovery') {
        discovery.init();
    }
});
