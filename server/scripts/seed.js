require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../modules/users/user.model');
const Listing = require('../modules/listings/listing.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookingbnb';

// ─── Sample Data ──────────────────────────────────────────────────────────────
const users = [
    {
        name: 'Admin User',
        email: 'admin@bookingbnb.com',
        password: 'Admin123!',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'approved',
        isEmailVerified: true,
    },
    {
        name: 'Arjun Sharma',
        email: 'host@bookingbnb.com',
        password: 'Host123!',
        role: 'host',
        isVerified: true,
        verificationStatus: 'approved',
        isEmailVerified: true,
        bio: 'Passionate traveler turned host. Offering unique stays across India.',
    },
    {
        name: 'Priya Kapoor',
        email: 'host2@bookingbnb.com',
        password: 'Host123!',
        role: 'host',
        isVerified: true,
        verificationStatus: 'approved',
        isEmailVerified: true,
        bio: 'Experience curator and wellness enthusiast.',
    },
    {
        name: 'Rahul Gupta',
        email: 'guest@bookingbnb.com',
        password: 'Guest123!',
        role: 'guest',
        isEmailVerified: true,
    },
];

const generateListings = (hostId1, hostId2) => [
    // ─── PROPERTIES / STAYS ────────────────────────────────────────────────────
    {
        title: 'Luxury Villa with Private Pool in Goa',
        description: 'Experience the ultimate luxury in this stunning Goa villa. Features a private pool, lush tropical garden, and panoramic sea views. Perfect for families and groups seeking a premium stay.',
        type: 'property',
        category: 'villa',
        host: hostId1,
        location: { address: '15 Candolim Beach Road', city: 'Goa', state: 'Goa', country: 'India', zip: '403515' },
        capacity: { guests: 8, bedrooms: 4, beds: 5, bathrooms: 4 },
        pricing: { basePrice: 25000, currency: 'INR', priceType: 'per_night', cleaningFee: 2000, serviceFee: 1500 },
        images: [
            { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', isPrimary: true, caption: 'Villa exterior with pool' },
            { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', caption: 'Living room' },
        ],
        amenities: [
            { name: 'Private Pool', icon: '🏊' }, { name: 'WiFi', icon: '📶' }, { name: 'Air Conditioning', icon: '❄️' },
            { name: 'Kitchen', icon: '🍳' }, { name: 'Beach Access', icon: '🏖️' }, { name: 'Parking', icon: '🚗' },
        ],
        averageRating: 4.9, reviewCount: 47,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Heritage Haveli Suite in Jaipur Old City',
        description: 'Sleep like royalty in this beautifully restored 18th-century haveli. Authentic Rajasthani architecture meets modern luxury. Walking distance to Hawa Mahal and City Palace.',
        type: 'property',
        category: 'hotel',
        host: hostId1,
        location: { address: '42 Tripolia Bazaar', city: 'Jaipur', state: 'Rajasthan', country: 'India', zip: '302002' },
        capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
        pricing: { basePrice: 8500, currency: 'INR', priceType: 'per_night', cleaningFee: 500, serviceFee: 400 },
        images: [
            { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' },
        ],
        amenities: [
            { name: 'WiFi', icon: '📶' }, { name: 'Breakfast Included', icon: '🍳' }, { name: 'Rooftop Terrace', icon: '🌅' },
        ],
        averageRating: 4.8, reviewCount: 89,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Scenic Mountain Cabin in Manali',
        description: 'Cozy log cabin nestled in the Himalayan mountains with breathtaking valley views. Perfect for couples seeking a peaceful mountain retreat with a warm fireplace and snow-capped peaks.',
        type: 'property',
        category: 'cabin',
        host: hostId1,
        location: { address: 'Vashisht Village, Near Old Manali', city: 'Manali', state: 'Himachal Pradesh', country: 'India', zip: '175131' },
        capacity: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 1 },
        pricing: { basePrice: 6500, currency: 'INR', priceType: 'per_night', cleaningFee: 800, serviceFee: 500 },
        images: [
            { url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800' },
        ],
        amenities: [
            { name: 'Fireplace', icon: '🔥' }, { name: 'Mountain View', icon: '⛰️' }, { name: 'WiFi', icon: '📶' },
            { name: 'Hiking Trails', icon: '🥾' },
        ],
        averageRating: 4.7, reviewCount: 63,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Modern Apartment in Bandra, Mumbai',
        description: 'Chic fully-furnished apartment in the heart of Bandra West. Walking distance to cafes, restaurants, and the iconic Bandstand promenade. Perfect for business travelers and couples.',
        type: 'property',
        category: 'apartment',
        host: hostId1,
        location: { address: '12 Carter Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400050' },
        capacity: { guests: 3, bedrooms: 1, beds: 2, bathrooms: 1 },
        pricing: { basePrice: 5500, currency: 'INR', priceType: 'per_night', cleaningFee: 600, serviceFee: 400 },
        images: [
            { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' },
        ],
        amenities: [
            { name: 'WiFi', icon: '📶' }, { name: 'Gym Access', icon: '💪' },
            { name: 'Air Conditioning', icon: '❄️' }, { name: 'Work Desk', icon: '💻' },
        ],
        averageRating: 4.6, reviewCount: 38,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Treetop Eco-House in Coorg Coffee Estates',
        description: 'Wake up among the treetops in this stunning eco-house perched within a working coffee plantation. Morning coffee from the estate, bird-watching at sunrise, waterfall treks nearby.',
        type: 'property',
        category: 'treehouse',
        host: hostId1,
        location: { address: 'Siddapura Coffee Estate', city: 'Coorg', state: 'Karnataka', country: 'India', zip: '571254' },
        capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
        pricing: { basePrice: 9800, currency: 'INR', priceType: 'per_night', cleaningFee: 500, serviceFee: 600 },
        images: [
            { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
        ],
        amenities: [
            { name: 'Estate Coffee', icon: '☕' }, { name: 'Nature Walks', icon: '🌿' },
            { name: 'Bird Watching', icon: '🦜' }, { name: 'Waterfall Trek', icon: '🏞️' },
        ],
        averageRating: 4.9, reviewCount: 54,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Luxury Houseboat on Dal Lake, Kashmir',
        description: 'Float in serenity on the iconic Dal Lake in a traditionally carved wooden houseboat. Experience Kashmiri hospitality with daily Shikara rides, local cuisine, and snow-dusted mountain views.',
        type: 'property',
        category: 'houseboat',
        host: hostId2,
        location: { address: 'Dal Lake Boulevard', city: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', zip: '190001' },
        capacity: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
        pricing: { basePrice: 12000, currency: 'INR', priceType: 'per_night', cleaningFee: 1000, serviceFee: 800 },
        images: [
            { url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800' },
        ],
        amenities: [
            { name: 'Shikara Rides', icon: '🚣' }, { name: 'Kashmiri Meals', icon: '🍲' },
            { name: 'Lake View', icon: '🌊' }, { name: 'Traditional Decor', icon: '🏮' },
        ],
        averageRating: 4.8, reviewCount: 71,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Beachfront Cottage in Pondicherry',
        description: 'A charming French-colonial cottage steps from the sea at Promenade Beach. White walls, terracotta floors, and a private veranda facing the Bay of Bengal. Cycling distance to Auroville.',
        type: 'property',
        category: 'cottage',
        host: hostId1,
        location: { address: '7 Goubert Avenue', city: 'Pondicherry', state: 'Puducherry', country: 'India', zip: '605001' },
        capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
        pricing: { basePrice: 7200, currency: 'INR', priceType: 'per_night', cleaningFee: 600, serviceFee: 400 },
        images: [
            { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=800' },
        ],
        amenities: [
            { name: 'Ocean View', icon: '🌊' }, { name: 'Bicycle Rental', icon: '🚲' },
            { name: 'French Bakery Nearby', icon: '🥐' }, { name: 'Beach Access', icon: '🏖️' },
        ],
        averageRating: 4.7, reviewCount: 42,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Farm Stay with Organic Garden in Wayanad',
        description: 'Reconnect with nature at this working organic farm in the lush Wayanad highlands. Pluck your own breakfast from the garden, help with farm activities, and sleep under an open sky of stars.',
        type: 'property',
        category: 'farmstay',
        host: hostId1,
        location: { address: 'Kalpetta Village Road', city: 'Wayanad', state: 'Kerala', country: 'India', zip: '673121' },
        capacity: { guests: 6, bedrooms: 3, beds: 3, bathrooms: 2 },
        pricing: { basePrice: 8000, currency: 'INR', priceType: 'per_night', cleaningFee: 700, serviceFee: 500 },
        images: [
            { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800' },
        ],
        amenities: [
            { name: 'Organic Farm', icon: '🌱' }, { name: 'Home-cooked Meals', icon: '🍛' },
            { name: 'Jungle Walk', icon: '🌳' }, { name: 'Stargazing', icon: '🌟' },
        ],
        averageRating: 4.9, reviewCount: 33,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Sky-High Penthouse, Bengaluru City Center',
        description: "Step into this ultra-modern penthouse on the 28th floor of UB City with panoramic views of Bengaluru's skyline. Floor-to-ceiling windows, a private terrace jacuzzi, and concierge service.",
        type: 'property',
        category: 'penthouse',
        host: hostId2,
        location: { address: 'UB City Tower', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560001' },
        capacity: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 3 },
        pricing: { basePrice: 35000, currency: 'INR', priceType: 'per_night', cleaningFee: 3000, serviceFee: 2500 },
        images: [
            { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800' },
        ],
        amenities: [
            { name: 'Jacuzzi', icon: '🛁' }, { name: 'City View', icon: '🌆' },
            { name: 'Concierge', icon: '🎩' }, { name: 'Valet Parking', icon: '🚗' }, { name: 'Smart Home', icon: '📱' },
        ],
        averageRating: 4.9, reviewCount: 18,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },

    // ─── EXPERIENCES ───────────────────────────────────────────────────────────
    {
        title: 'Old Delhi Food & Culture Walking Tour',
        description: 'Explore the vibrant lanes of Old Delhi with an expert local guide. Visit 12+ hidden food spots, try street food delicacies, and discover untold stories behind historical monuments. 4-hour immersive experience.',
        type: 'experience',
        category: 'tour',
        host: hostId2,
        location: { address: 'Chandni Chowk Metro Station', city: 'Delhi', state: 'Delhi', country: 'India', zip: '110006' },
        capacity: { guests: 12 },
        pricing: { basePrice: 2500, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 200 },
        images: [
            { url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800' },
        ],
        amenities: [
            { name: 'Expert Guide', icon: '👤' }, { name: 'Food Tastings', icon: '🍜' },
            { name: 'History Walk', icon: '🏛️' }, { name: 'Small Groups', icon: '👥' },
        ],
        averageRating: 4.9, reviewCount: 127,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Photography Walk – Kolkata Street Photography',
        description: 'Join professional photographer Priya for a 3-hour street photography walk through Kolkata\'s most photogenic neighborhoods. Learn composition, lighting, and storytelling techniques.',
        type: 'experience',
        category: 'workshop',
        host: hostId2,
        location: { address: 'Kumartuli Potters Quarter', city: 'Kolkata', state: 'West Bengal', country: 'India', zip: '700005' },
        capacity: { guests: 8 },
        pricing: { basePrice: 3200, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 300 },
        images: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800' },
        ],
        amenities: [
            { name: 'Pro Photographer Guide', icon: '📸' }, { name: 'Editing Tips', icon: '🖥️' },
            { name: 'Small Group', icon: '👥' }, { name: 'All Skill Levels', icon: '✅' },
        ],
        averageRating: 4.9, reviewCount: 41,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Sunrise Yoga & Meditation at Rishikesh Ghats',
        description: 'Start your day with a transformative 2-hour yoga and pranayama session on the banks of the holy Ganga. Certified yoga teacher leads you through Hatha and Ashtanga flows with meditation to close.',
        type: 'experience',
        category: 'wellness',
        host: hostId2,
        location: { address: 'Triveni Ghat', city: 'Rishikesh', state: 'Uttarakhand', country: 'India', zip: '249201' },
        capacity: { guests: 20 },
        pricing: { basePrice: 1200, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 100 },
        images: [
            { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800' },
        ],
        amenities: [
            { name: 'Certified Instructor', icon: '🧘' }, { name: 'Yoga Mats Provided', icon: '🟩' },
            { name: 'Ganga View', icon: '🌊' }, { name: 'Meditation Session', icon: '🧠' },
        ],
        averageRating: 4.8, reviewCount: 98,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Jim Corbett Wildlife Safari & Nature Walk',
        description: 'An exhilarating jeep safari through Jim Corbett National Park. Expert naturalists guide you through elephant grass and sal forests in search of tigers, leopards, elephants, and rare birds.',
        type: 'experience',
        category: 'adventure',
        host: hostId1,
        location: { address: 'Dhikuli Range Gate', city: 'Jim Corbett', state: 'Uttarakhand', country: 'India', zip: '244715' },
        capacity: { guests: 6 },
        pricing: { basePrice: 4500, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 400 },
        images: [
            { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800' },
        ],
        amenities: [
            { name: 'Naturalist Guide', icon: '🔭' }, { name: 'Jeep Safari', icon: '🚙' },
            { name: 'Tiger Habitat', icon: '🐯' }, { name: 'Bird Watching', icon: '🦜' },
        ],
        averageRating: 4.7, reviewCount: 66,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Stargazing Night at Rann of Kutch',
        description: 'Experience the unmatched clarity of the night sky over the white salt desert of Kutch. An astronomer guides you through constellations, Milky Way photography, and telescope sessions. Includes dinner under the stars.',
        type: 'experience',
        category: 'astronomy',
        host: hostId2,
        location: { address: 'Dhordo Village', city: 'Kutch', state: 'Gujarat', country: 'India', zip: '370510' },
        capacity: { guests: 15 },
        pricing: { basePrice: 2800, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 250 },
        images: [
            { url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1517817748493-49ec54a32465?w=800' },
        ],
        amenities: [
            { name: 'Telescope Sessions', icon: '🔭' }, { name: 'Astronomer Guide', icon: '🌌' },
            { name: 'Dinner Included', icon: '🍽️' }, { name: 'Desert Campfire', icon: '🔥' },
        ],
        averageRating: 5.0, reviewCount: 29,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Traditional Cooking Class – Tamil Nadu Cuisine',
        description: 'Learn to make authentic Tamil Nadu dishes with home-cook Meera: dosas from scratch, sambhar, rasam, and traditional payasam. Hands-on, in a real Chennai home kitchen. Includes a sit-down meal.',
        type: 'experience',
        category: 'cooking',
        host: hostId2,
        location: { address: 'Alwarpet', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zip: '600018' },
        capacity: { guests: 8 },
        pricing: { basePrice: 2200, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 200 },
        images: [
            { url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800' },
        ],
        amenities: [
            { name: 'Hands-on Cooking', icon: '👩‍🍳' }, { name: 'Recipe Cards', icon: '📄' },
            { name: 'Meal Included', icon: '🍽️' }, { name: 'Home Experience', icon: '🏡' },
        ],
        averageRating: 4.9, reviewCount: 83,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Sea Kayaking at Andamans Blue Bay',
        description: 'Paddle through crystal-clear turquoise waters, exploring sea caves and coral gardens with a certified kayaking guide. Snorkel gear included. Suitable for beginners. 4-hour adventure.',
        type: 'experience',
        category: 'adventure',
        host: hostId1,
        location: { address: 'Corbyn\'s Cove Beach', city: 'Port Blair', state: 'Andaman & Nicobar', country: 'India', zip: '744101' },
        capacity: { guests: 10 },
        pricing: { basePrice: 3800, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 300 },
        images: [
            { url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800' },
        ],
        amenities: [
            { name: 'Certified Guide', icon: '🚣' }, { name: 'Snorkel Gear', icon: '🤿' },
            { name: 'All Equipment', icon: '🎒' }, { name: 'Beginner Friendly', icon: '✅' },
        ],
        averageRating: 4.8, reviewCount: 57,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },

    // ─── SERVICES ─────────────────────────────────────────────────────────────
    {
        title: 'Private Chef Experience – 5-Course Indian Feast',
        description: 'Let our award-winning chef Priya create an unforgettable 5-course authentic Indian dining experience in your accommodation. Catering to dietary requirements, using locally sourced ingredients.',
        type: 'service',
        category: 'chef',
        host: hostId2,
        location: { address: 'Your Location', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400001' },
        capacity: { guests: 10 },
        pricing: { basePrice: 4500, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 500 },
        images: [
            { url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', isPrimary: true },
        ],
        amenities: [
            { name: 'Ingredient Sourcing', icon: '🌿' }, { name: 'All Equipment', icon: '🍽️' },
            { name: 'Dietary Friendly', icon: '🥗' }, { name: 'Dessert Included', icon: '🍮' },
        ],
        averageRating: 5.0, reviewCount: 34,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Ayurvedic Wellness Retreat in Kerala',
        description: 'Immerse yourself in traditional Kerala Ayurveda with certified practitioners. Includes personalized consultations, therapeutic massages, herbal treatments, and yoga sessions. A transformative 3-day program.',
        type: 'service',
        category: 'wellness',
        host: hostId2,
        location: { address: 'Kumarakom Lake Resort Area', city: 'Alleppey', state: 'Kerala', country: 'India', zip: '686563' },
        capacity: { guests: 6 },
        pricing: { basePrice: 12000, currency: 'INR', priceType: 'flat', cleaningFee: 0, serviceFee: 1000 },
        images: [
            { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', isPrimary: true },
        ],
        amenities: [
            { name: 'Herbal Treatment', icon: '🌿' }, { name: 'Yoga Sessions', icon: '🧘' },
            { name: 'Certified Practitioners', icon: '👨‍⚕️' }, { name: 'Organic Meals', icon: '🥗' },
        ],
        averageRating: 4.8, reviewCount: 52,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Professional Travel Photography Session',
        description: 'Capture your perfect India moments with a professional travel photographer. 3-hour session at the location of your choice — from palace façades to beach sunsets. Receive 50+ edited photos within 48 hours.',
        type: 'service',
        category: 'photography',
        host: hostId2,
        location: { address: 'Your Location', city: 'Udaipur', state: 'Rajasthan', country: 'India', zip: '313001' },
        capacity: { guests: 5 },
        pricing: { basePrice: 6000, currency: 'INR', priceType: 'flat', cleaningFee: 0, serviceFee: 500 },
        images: [
            { url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?w=800' },
        ],
        amenities: [
            { name: '50+ Edited Photos', icon: '🖼️' }, { name: 'Any Location', icon: '📍' },
            { name: '48hr Delivery', icon: '⚡' }, { name: 'Couple/Group Friendly', icon: '👫' },
        ],
        averageRating: 5.0, reviewCount: 24,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
    {
        title: 'Sound Healing & Crystal Bowl Therapy',
        description: 'Restore balance and inner peace through a 90-minute sound healing session using Tibetan singing bowls and crystal bowls. Conducted by certified sound therapist Meera in a specially designed meditation space.',
        type: 'service',
        category: 'wellness',
        host: hostId2,
        location: { address: 'Laxmanjhula Road', city: 'Rishikesh', state: 'Uttarakhand', country: 'India', zip: '249302' },
        capacity: { guests: 8 },
        pricing: { basePrice: 1800, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 150 },
        images: [
            { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', isPrimary: true },
        ],
        amenities: [
            { name: 'Crystal Bowls', icon: '🎶' }, { name: 'Certified Therapist', icon: '🌸' },
            { name: 'Meditation Space', icon: '🧘' }, { name: 'Herbal Tea', icon: '🍵' },
        ],
        averageRating: 4.9, reviewCount: 37,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Indian Wine & Cheese Tasting Experience',
        description: 'Discover India\'s burgeoning wine scene with a curated tasting of 8 Indian wines from Nashik and Bangalore paired with artisanal Indian cheeses and charcuterie. Hosted by a certified sommelier.',
        type: 'service',
        category: 'entertainment',
        host: hostId1,
        location: { address: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', country: 'India', zip: '411001' },
        capacity: { guests: 12 },
        pricing: { basePrice: 3500, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 300 },
        images: [
            { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
        ],
        amenities: [
            { name: '8 Wine Tastings', icon: '🍷' }, { name: 'Artisan Cheese Board', icon: '🧀' },
            { name: 'Certified Sommelier', icon: '🎓' }, { name: 'Tasting Notes', icon: '📝' },
        ],
        averageRating: 4.8, reviewCount: 45,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: false,
    },
    {
        title: 'Live Bollywood Music & Dinner Evening',
        description: 'An intimate evening of live Bollywood music performed by a 4-piece band, paired with a 3-course Indian dinner. Perfect for celebrations, date nights, or memorable evenings in Mumbai.',
        type: 'service',
        category: 'entertainment',
        host: hostId1,
        location: { address: 'Marine Drive', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400002' },
        capacity: { guests: 20 },
        pricing: { basePrice: 5000, currency: 'INR', priceType: 'per_person', cleaningFee: 0, serviceFee: 400 },
        images: [
            { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
        ],
        amenities: [
            { name: 'Live 4-piece Band', icon: '🎸' }, { name: '3-Course Dinner', icon: '🍽️' },
            { name: 'Bollywood Classics', icon: '🎬' }, { name: 'Event Planning', icon: '📋' },
        ],
        averageRating: 4.7, reviewCount: 62,
        isPublished: true, isDraft: false, hostVerified: true, isFeatured: true,
    },
];



const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Listing.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users
        const createdUsers = await User.create(users);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const host1 = createdUsers.find(u => u.email === 'host@bookingbnb.com');
        const host2 = createdUsers.find(u => u.email === 'host2@bookingbnb.com');
        console.log(`✅ Created ${createdUsers.length} users`);
        console.log(`   Admin: admin@bookingbnb.com / Admin123!`);
        console.log(`   Host:  host@bookingbnb.com / Host123!`);
        console.log(`   Guest: guest@bookingbnb.com / Guest123!`);

        // Create listings
        const listingData = generateListings(host1._id, host2._id);
        const createdListings = await Listing.create(listingData);
        console.log(`✅ Created ${createdListings.length} listings`);

        console.log('\n🚀 Seed complete! BookingBnB database is ready.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seed();
