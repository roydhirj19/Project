/** map_key is coming from show.ejs */
// Global map initialization - only runs when no specific listing map is present
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map');
    
    // Only initialize if map container exists and no listing-specific map is being initialized
    if (mapContainer && !window.listingMapInitialized) {
        console.log('Initializing global map');
        
        // Check if map_key is available
        if (typeof map_key === 'undefined') {
            console.error('Map key not found');
            return;
        }

        maptilersdk.config.apiKey = map_key;
        
        // Default coordinates (Delhi, India)
        const defaultCoordinates = [77.2088, 28.6139];

        const map = new maptilersdk.Map({
            container: 'map',
            style: maptilersdk.MapStyle.STREETS,
            center: defaultCoordinates,
            zoom: 9
        });

        // Add a default marker
        const marker = new maptilersdk.Marker()
            .setLngLat(defaultCoordinates)
            .addTo(map);
    }
});
