const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'openstreetmap',
    // You can also use other providers like 'google', 'mapquest', etc.
    // For Google, you would need an API key
    // provider: 'google',
    // apiKey: process.env.GOOGLE_MAPS_API_KEY,
    formatter: null
};

const geocoder = NodeGeocoder(options);

const geocodeLocation = async (location, country) => {
    try {
        const searchQuery = `${location}, ${country}`;
        const results = await geocoder.geocode(searchQuery);
        
        if (results && results.length > 0) {
            const result = results[0];
            return {
                type: 'Point',
                coordinates: [result.longitude, result.latitude]
            };
        } else {
            // Fallback to a default location if geocoding fails
            console.log(`Geocoding failed for: ${searchQuery}`);
            return {
                type: 'Point',
                coordinates: [0, 0] // Default coordinates
            };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
        };
    }
};

module.exports = { geocodeLocation }; 