/**
 * Nearly — Profile Detail & Connections Logic
 */

const profile = {
    state: {
        currentUser: null
    },

    init(userId) {
        console.log('Loading Profile Detail for:', userId);
        this.fetchUser(userId);
    },

    async fetchUser(userId) {
        // In a real app, this would fetch from Firestore
        // For now, we search in discovery's allUsers or use mock
        let user = discovery.state.allUsers.find(u => u.id === userId);
        
        if (!user) {
            // Check if it's in mock data
            user = [
                { id: '1', alias: 'DJ Norte', phone: '521234567890', category: 'DJ', description: 'Beats electrónicos para eventos locales.', intention: 'clients', location: { latitude: 29.07, longitude: -110.95 } },
                { id: '2', alias: 'Arq. Creative', phone: '521234567891', category: 'Designer', description: 'Diseño de interiores y renders 3D.', intention: 'collab', location: { latitude: 29.08, longitude: -110.96 } }
            ].find(u => u.id === userId);
        }

        if (user) {
            this.state.currentUser = user;
            this.renderDetail(user);
        } else {
            console.error('User not found');
            app.navigate('discovery');
        }
    },

    renderDetail(user) {
        document.getElementById('det-alias').textContent = user.alias;
        document.getElementById('det-category').textContent = user.category.toUpperCase();
        document.getElementById('det-description').textContent = user.description;
        
        const distance = discovery.calculateDistance(user.location);
        document.getElementById('det-distance').textContent = distance !== null ? `${distance.toFixed(1)} km` : '---';

        // Mock stats/tags
        document.getElementById('det-connections').textContent = Math.floor(Math.random() * 50);
        
        const tagsContainer = document.getElementById('det-tags');
        tagsContainer.innerHTML = '';
        ['Experto', 'Verificado', 'Local'].forEach(tag => {
            const span = document.createElement('span');
            span.className = 'category-badge';
            span.style.background = 'rgba(255,255,255,0.05)';
            span.style.color = 'var(--text-muted)';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    },

    async requestConnection() {
        if (!app.state.isAuth) {
            app.showToast('Registrate para conectar', 'warning');
            app.navigate('register');
            return;
        }

        const targetUser = this.state.currentUser;
        console.log('Requesting connection to:', targetUser.alias);
        
        try {
            if (app.db) {
                await app.db.collection('connections').add({
                    from: app.state.user.id,
                    to: targetUser.id,
                    status: 'pending',
                    timestamp: firebase.firestore.Timestamp.now()
                });
            }
            
            app.showToast(`Solicitud enviada a ${targetUser.alias}`);
            // Logic for gate validation (Future phase)
        } catch (err) {
            console.error('Connection request failed:', err);
            app.showToast('Error al conectar. Revisa tu conexión.', 'error');
        }
    },

    sendMessageToWhatsapp() {
        const user = this.state.currentUser;
        if (!user || !user.phone) return;
        
        const msg = `Hola ${user.alias}, te vi en Nearly y me gustaría conectar contigo.`;
        const url = `https://wa.me/${user.phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }
};

window.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'profile-detail') {
        const userId = localStorage.getItem('last_viewed_user');
        if (userId) profile.init(userId);
    }
});
