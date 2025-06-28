# Hotel Booking App

A full-featured hotel and room booking application built with Node.js, Express, and MongoDB. Users can browse listings, book rooms, leave reviews, and manage their reservations. Property owners can list their properties, manage bookings, and provide contact information.

## Features

###  Authentication
- Local username/password login
- Google OAuth integration
- LinkedIn OAuth integration
- Secure session management

###  Booking System
- Browse available hotel/room listings
- Book rooms with specific dates and times
- Select number of guests and special requests
- Real-time availability checking
- Manage your bookings (view, cancel)
- Automatic price calculation

###  Maps & Location
- Interactive maps for each listing using MapTiler
- Geocoding for location and country
- Visual location display

###  Contact Information
- Hotel phone numbers and mobile contacts
- Email addresses for direct communication
- Full property addresses
- Emergency contact numbers
- Clickable contact links

###  Reviews & Ratings
- Leave reviews with star ratings
- View all reviews for each listing
- Delete your own reviews

###  Responsive Design
- Mobile-friendly interface
- Modern UI with Bootstrap
- Custom CSS styling
- Works on all device sizes

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   Create a `.env` file with:
   ```
   ATLASDB_URL=your_mongodb_connection_string
   SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   LINKEDIN_CLIENT_ID=your_linkedin_oauth_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_oauth_client_secret
   MAP_TOKEN=your_maptiler_api_key
   ```

3. **Start the application**
   ```bash
   npm start
   ```
   Visit [L https://first-fullstack-project-ooh4.onrender.com]

## Project Structure
