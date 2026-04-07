/**
 * Nearly — Onboarding & Persistence Logic
 */

const onboarding = {
    state: {
        tempUser: {},
        neighborhoods: {
            'pitic': { latitude: 29.088, longitude: -110.945 },
            'san-benito': { latitude: 29.092, longitude: -110.958 },
            'villa-de-seris': { latitude: 29.055, longitude: -110.940 },
            'rio-sonora': { latitude: 29.070, longitude: -110.955 },
            'modelo': { latitude: 29.090, longitude: -110.951 },
            'centenario': { latitude: 29.082, longitude: -110.954 },
            'balderrama': { latitude: 29.098, longitude: -110.970 },
            'sahuaro': { latitude: 29.095, longitude: -110.990 },
            'puerta-real': { latitude: 29.120, longitude: -110.975 },
            'la-joya': { latitude: 29.115, longitude: -110.965 },
            'los-lagos': { latitude: 29.085, longitude: -110.995 },
            'valle-grande': { latitude: 29.090, longitude: -111.005 }
        }
    },

    handleRegister(e) {
        e.preventDefault();
        const phone = document.getElementById('reg-phone').value;
        const alias = document.getElementById('reg-alias').value;

        this.state.tempUser = { 
            phone, 
            alias,
            createdAt: new Date().toISOString()
        };
        
        app.navigate('location');
    },

    setNeighborhood(val) {
        if (!val) return;
        const coords = this.state.neighborhoods[val];
        // Apply random shift +/- 250m for security
        const shiftLat = (Math.random() - 0.5) * 0.0045; // ~250m
        const shiftLng = (Math.random() - 0.5) * 0.0045; // ~250m
        
        this.state.tempUser.location = {
            latitude: coords.latitude + shiftLat,
            longitude: coords.longitude + shiftLng,
            neighborhood: val
        };
    },

    saveLocationStep() {
        if (!this.state.tempUser.location) {
            app.showToast('Por favor selecciona una zona', 'warning');
            return;
        }
        app.navigate('profile-setup');
    },

    async handleProfileSetup(e) {
        e.preventDefault();
        const category = document.getElementById('prof-category').value;
        const description = document.getElementById('prof-desc').value;
        const intention = document.querySelector('input[name="intent"]:checked').value;

        const finalUser = {
            ...this.state.tempUser,
            category,
            description,
            intention,
            isAutoLoaded: false
        };

        try {
            if (window.db) {
                // Save to Firestore
                const docRef = await window.db.collection('talentos').add(finalUser);
                finalUser.id = docRef.id;
                localStorage.setItem('nearly_uid', docRef.id);
            } else {
                console.warn('Firestore not initialized. Saving locally.');
                finalUser.id = 'temp-' + Date.now();
                localStorage.setItem('nearly_uid', finalUser.id);
            }

            app.state.user = finalUser;
            app.state.isAuth = true;
            app.navigate('discovery');
            app.showToast('¡Bienvenido a Nearly!');
        } catch (err) {
            console.error('Error saving profile:', err);
            app.showToast('Error al guardar perfil. Intenta de nuevo.', 'error');
        }
    }
};
