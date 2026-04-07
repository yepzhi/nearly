/**
 * Nearly — Onboarding Elite v1.5
 * Localizing Talent & Services in Hermosillo
 */

window.onboarding = {
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

    setNeighborhood(val) {
        if (!val) return;
        const coords = this.state.neighborhoods[val];
        // Apply random shift +/- 250m for security
        const shiftLat = (Math.random() - 0.5) * 0.0045; 
        const shiftLng = (Math.random() - 0.5) * 0.0045; 
        
        app.state.location = {
            latitude: coords.latitude + shiftLat,
            longitude: coords.longitude + shiftLng,
            neighborhood: val
        };
        
        // Persist location locally immediately
        localStorage.setItem('nearly_location', JSON.stringify(app.state.location));
    },

    saveLocationStep() {
        if (!app.state.location) {
            app.showToast('Por favor selecciona una zona', 'warning');
            return;
        }
        
        app.showToast('¡Zona guardada!', 'success');
        app.navigate('discovery');
    },

    async handleProfileSetup(e) {
        e.preventDefault();
        const alias = document.getElementById('reg-alias')?.value;
        const category = document.getElementById('prof-category')?.value;
        const description = document.getElementById('prof-desc')?.value;
        const intention = document.querySelector('input[name="intent"]:checked')?.value;

        const finalUser = {
            alias,
            category,
            description,
            intention,
            location: app.state.location,
            createdAt: new Date().toISOString(),
            isAutoLoaded: false
        };

        try {
            if (window.db) {
                const docRef = await window.db.collection('talentos').add(finalUser);
                localStorage.setItem('nearly_uid', docRef.id);
                app.state.user = { id: docRef.id, ...finalUser };
            }
            app.showToast('¡Perfil Creado!');
            app.navigate('discovery');
        } catch (err) {
            console.error('Error saving profile:', err);
            app.showToast('Error al guardar.', 'error');
        }
    }
};
