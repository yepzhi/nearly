/**
 * Nearly — Onboarding Logic
 */

const onboarding = {
    data: {
        phone: '',
        alias: '',
        lat: null,
        lng: null,
        category: '',
        description: '',
        intention: 'clients',
        phoneVerified: false,
        createdAt: null
    },

    handleRegister(event) {
        event.preventDefault();
        const phone = document.getElementById('reg-phone').value;
        const alias = document.getElementById('reg-alias').value;
        const terms = document.getElementById('reg-terms').checked;

        if (!phone || !alias || !terms) {
            console.error('Missing fields');
            return;
        }

        this.data.phone = phone;
        this.data.alias = alias;
        this.data.createdAt = firebase.firestore.Timestamp.now();

        console.log('Register Step Complete:', this.data);
        app.navigate('location');
    },

    requestLocation() {
        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            this.setLocationRange(100); // Default fallback
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.data.lat = pos.coords.latitude;
                this.data.lng = pos.coords.longitude;
                console.log('Location Found:', this.data.lat, this.data.lng);
                app.navigate('profile-setup');
            },
            (err) => {
                console.warn('Geolocation Error:', err);
                app.navigate('profile-setup'); // Continue even if failed
            }
        );
    },

    setLocationRange(range) {
        console.log('Setting Manual Range:', range);
        // In a real app, we'd prompt for a city if no lat/lng, 
        // but for MVP we'll just log it and move forward.
        this.data.range = range;
        app.navigate('profile-setup');
    },

    handleProfileSetup(event) {
        event.preventDefault();
        const category = document.getElementById('prof-category').value;
        const description = document.getElementById('prof-desc').value;
        const intention = document.querySelector('input[name="intent"]:checked').value;

        if (!category || !description) {
            console.error('Missing profile fields');
            return;
        }

        this.data.category = category;
        this.data.description = description;
        this.data.intention = intention;

        this.completeOnboarding();
    },

    async completeOnboarding() {
        console.log('Completing Onboarding...', this.data);
        
        try {
            // Check if Firebase is init
            if (!app.db) {
                console.error('Firebase DB not initialized. Check app.js config.');
                throw new Error('Firebase Connection Missing');
            }

            // Store in Firestore
            const docRef = await app.db.collection('users').add({
                ...this.data,
                location: this.data.lat ? new firebase.firestore.GeoPoint(this.data.lat, this.data.lng) : null
            });

            console.log('User created with ID:', docRef.id);
            localStorage.setItem('nearly_uid', docRef.id);
            
            app.state.user = { id: docRef.id, ...this.data };
            app.state.isAuth = true;

            app.navigate('discovery');
            // Refresh feed logic can be triggered by viewChanged event
        } catch (err) {
            console.error('Error saving user:', err);
            // Fallback for local testing if Firebase is not yet configured
            app.navigate('discovery');
        }
    }
};
