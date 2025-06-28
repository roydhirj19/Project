const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

// Connect to MongoDB
const dbUrl = process.env.ATLASDB_URL;

async function updateExistingListings() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB");

        // Find all listings that don't have booking fields
        const listings = await Listing.find({
            $or: [
                { roomType: { $exists: false } },
                { maxGuests: { $exists: false } },
                { isAvailable: { $exists: false } },
                { amenities: { $exists: false } }
            ]
        });

        console.log(`Found ${listings.length} listings to update`);

        for (let listing of listings) {
            // Set default values for missing fields
            if (!listing.roomType) {
                listing.roomType = 'Private Room';
            }
            if (!listing.maxGuests) {
                listing.maxGuests = 2;
            }
            if (listing.isAvailable === undefined) {
                listing.isAvailable = true;
            }
            if (!listing.amenities) {
                listing.amenities = [];
            }
            if (!listing.bookings) {
                listing.bookings = [];
            }

            await listing.save();
            console.log(`Updated listing: ${listing.title}`);
        }

        console.log("All listings updated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating listings:", error);
        process.exit(1);
    }
}

// Run the update
updateExistingListings(); 