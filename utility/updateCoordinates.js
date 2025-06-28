const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const { geocodeLocation } = require('./geocoder.js');
require('dotenv').config();

const updateExistingListings = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.ATLASDB_URL);
        console.log('Connected to MongoDB');

        // Find all listings without coordinates
        const listings = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { 'geometry.coordinates': { $exists: false } },
                { 'geometry.coordinates.0': 0, 'geometry.coordinates.1': 0 }
            ]
        });

        console.log(`Found ${listings.length} listings to update`);

        for (const listing of listings) {
            if (listing.location && listing.country) {
                console.log(`Updating coordinates for: ${listing.title} - ${listing.location}, ${listing.country}`);
                
                const geometry = await geocodeLocation(listing.location, listing.country);
                listing.geometry = geometry;
                await listing.save();
                
                console.log(`Updated coordinates: [${geometry.coordinates[0]}, ${geometry.coordinates[1]}]`);
            } else {
                console.log(`Skipping ${listing.title} - missing location or country`);
            }
        }

        console.log('All listings updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating listings:', error);
        process.exit(1);
    }
};

// Run the update if this file is executed directly
if (require.main === module) {
    updateExistingListings();
}

module.exports = { updateExistingListings }; 