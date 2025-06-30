const NodeGeocoder = require('node-geocoder');

// Free geocoding using Nominatim (OpenStreetMap) - works worldwide
const freeGeocode = async (location, country) => {
    const searchQuery = `${location}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'StayEasy-App/1.0 (https://roydhiraj.com; contact@daisydhiraj.com)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            return {
                longitude: parseFloat(result.lon),
                latitude: parseFloat(result.lat)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

const geocodeLocation = async (location, country) => {
    try {
        const searchQuery = `${location}, ${country}`;
        console.log('Geocoding location:', searchQuery);
        
        const result = await freeGeocode(location, country);
        
        if (result) {
            console.log('Geocoding successful:', result);
            return {
                type: 'Point',
                coordinates: [result.longitude, result.latitude]
            };
        }
        
        // Fallback to default coordinates
        console.log(`Geocoding failed for: ${searchQuery}`);
        return {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
        };
        
    } catch (error) {
        console.error('Geocoding error:', error);
        return {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
        };
    }
};

module.exports = { geocodeLocation }; 
