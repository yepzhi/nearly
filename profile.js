/**
 * Nearly — Profile Detail & Connections Logic (v1.4)
 */

window.profile = {
    state: {
        currentProfile: null
    },

    init(userId) {
        console.log('Loading Profile Detail for:', userId);
        this.fetchUser(userId);
    },

    async fetchUser(userId) {
        // Attempt Firestore first
        try {
            if (window.db) {
                const doc = await window.db.collection('talentos').doc(userId).get();
                if (doc.exists) {
                    this.state.currentProfile = { id: doc.id, ...doc.data() };
                    this.renderDetail(this.state.currentProfile);
                    return;
                }
            }
        } catch (err) {
            console.warn('Firestore fetch failed, falling back to Seeds.');
        }

        // Fallback to SEED_DATA (100 real Hermosillo businesses)
        const seedUser = (typeof SEED_DATA !== 'undefined') ? SEED_DATA.find(u => u.id === userId) : null;
        if (seedUser) {
            this.state.currentProfile = seedUser;
            this.renderDetail(seedUser);
        } else {
            console.error('Profile not found:', userId);
            app.navigate('discovery');
        }
    },

    renderDetail(user) {
        document.getElementById('det-alias').textContent = user.alias;
        document.getElementById('det-category').textContent = user.category.toUpperCase();
        document.getElementById('det-description').textContent = user.description;
        
        const distance = discovery.calculateDistance(user.location);
        document.getElementById('det-distance').textContent = distance !== null ? `${distance.toFixed(1)} km` : '---';
        
        // Dynamic stats
        document.getElementById('det-connections').textContent = user.rating || '4.5';
        
        const tagsContainer = document.getElementById('det-tags');
        tagsContainer.innerHTML = '';
        const labels = user.isAutoLoaded ? ['Establecimiento', 'Verificado', 'Pionero'] : ['Talento Local', 'Disponible', 'Cerca'];
        labels.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'category-badge';
            span.style.background = 'rgba(255,255,255,0.05)';
            span.style.color = 'var(--text-muted)';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    },

    sendMessageToWhatsapp() {
        const user = this.state.currentProfile;
        if (!user || !user.phone) {
            app.showToast('Número no disponible', 'error');
            return;
        }
        
        const cleanPhone = user.phone.replace(/\D/g, ''); // Ensure digits only
        const msg = `Hola ${user.alias}, te vi en Nearly y me interesa tu servicio.`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }
};

window.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'profile-detail') {
        const userId = localStorage.getItem('last_viewed_user');
        if (userId) profile.init(userId);
    }
});
