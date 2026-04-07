/**
 * Nearly — Profile Detail & Connections Logic (v1.5)
 * Elite Silver & Gold Edition
 */

window.profile = {
    state: {
        currentProfile: null
    },

    init(userId) {
        console.log('Loading Profile Detail for:', userId);
        this.fetchUser(userId || localStorage.getItem('last_viewed_user'));
    },

    async fetchUser(userId) {
        if (!userId) return;

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
        const aliasEl = document.getElementById('det-alias');
        const catEl = document.getElementById('det-category');
        const descEl = document.getElementById('det-description');
        const distEl = document.getElementById('det-distance');
        
        if (aliasEl) aliasEl.textContent = user.alias;
        if (catEl) catEl.textContent = user.category.toUpperCase();
        if (descEl) descEl.textContent = user.description;
        
        const distance = discovery.calculateDistance(user.location);
        if (distEl) distEl.textContent = distance !== null ? `${distance.toFixed(1)} km` : '---';
        
        // Render Location Specific Actions (Business vs Talent)
        this.renderLocationActions(user);
    },

    renderLocationActions(user) {
        const container = document.getElementById('det-actions-container');
        if (!container) return;

        container.innerHTML = '';
        
        // Check if Business or Talent (Seeds are businesses by default)
        const isBusiness = user.type === 'business' || user.isAutoLoaded;

        if (isBusiness) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-silver btn-block';
            btn.style.borderColor = 'var(--gold)';
            btn.style.color = 'var(--gold)';
            btn.innerHTML = '📍 Ir al Negocio (Maps)';
            btn.onclick = () => {
                const { latitude, longitude } = user.location;
                const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                window.open(url, '_blank');
            };
            container.appendChild(btn);
        } else {
            const p = document.createElement('p');
            p.className = 'security-note';
            p.style.textAlign = 'center';
            p.style.width = '100%';
            p.innerText = '✦ Ubicación aproximada ±250m por seguridad del talento.';
            container.appendChild(p);
        }
    },

    sendMessageToWhatsapp() {
        const user = this.state.currentProfile;
        if (!user || (!user.phone && !user.phone)) {
            app.showToast('Número no disponible', 'error');
            return;
        }
        
        const phone = user.phone || user.phone;
        const cleanPhone = phone.replace(/\D/g, ''); 
        const msg = `Hola ${user.alias}, te vi en Nearly y me interesa tu servicio.`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }
};

window.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'profile-detail') {
        profile.init(e.detail.params);
    }
});
