# 🏠 BookingBnB

> A full-stack, Airbnb-inspired property booking platform with role-based access, real-time availability, image uploads, and integrated payments.

---

## ✨ Features

### For Guests 🧳
- Browse & search listings with filters (location, price, category, dates, guests)
- Interactive map view powered by Leaflet
- Real-time availability checker before booking
- Secure checkout with Razorpay payment integration
- View and manage all bookings from a personal dashboard
- Leave reviews and ratings for past stays

### For Hosts 🏠
- Create listings via a multi-step wizard (details → location → photos → pricing)
- Upload up to 10 photos per listing (Cloudinary CDN)
- Publish / unpublish listings at any time
- View all incoming bookings and earnings from a host dashboard
- Featured listing support

### Platform
- JWT-based authentication with refresh tokens
- Role-based access control: `guest`, `host`, `admin`
- Rate limiting & Mongo sanitization for API security
- Helmet, CORS, Morgan logging, Winston structured logs

---

## 🛠️ Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | Next.js 15, React 19, Zustand, Framer Motion            |
| Styling    | Vanilla CSS with CSS custom properties                  |
| Maps       | Leaflet + React-Leaflet                                 |
| Charts     | Recharts                                                |
| Backend    | Node.js, Express 4                                      |
| Database   | MongoDB + Mongoose                                      |
| Auth       | JWT (access + refresh tokens), bcryptjs                 |
| Storage    | Cloudinary (image uploads via Multer)                   |
| Payments   | Razorpay (switchable to mock mode)                      |
| Logging    | Winston + Morgan                                        |
| Security   | Helmet, express-rate-limit, express-mongo-sanitize      |

---

## 📁 Project Structure

```
BookingBnB/
├── client/                     # Next.js frontend
│   ├── app/
│   │   ├── auth/               # Login & Register page
│   │   ├── dashboard/          # Guest & Host dashboards
│   │   ├── listings/           # Listing detail pages
│   │   ├── host/               # Host listing creation
│   │   └── page.js             # Public homepage
│   ├── components/
│   │   ├── Navbar/
│   │   ├── ListingCard/
│   │   ├── CreateListingWizard/
│   │   ├── DateRangePicker/
│   │   ├── GuestSelector/
│   │   └── ListingsMap/
│   ├── store/                  # Zustand state stores
│   └── services/               # Axios API service layer
│
└── server/                     # Express backend
    ├── modules/
    │   ├── auth/               # Register, login, refresh
    │   ├── users/              # Profile management
    │   ├── listings/           # CRUD + publish/unpublish
    │   ├── bookings/           # Booking lifecycle
    │   ├── payments/           # Razorpay order & webhook
    │   ├── reviews/            # Ratings & reviews
    │   └── dashboard/          # Analytics & stats
    ├── middleware/             # Auth, role, upload, error
    ├── config/                 # Env, DB, Cloudinary config
    ├── shared/                 # Logger, helpers
    └── scripts/                # DB seeding script
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Razorpay account (or use `mock` mode)

---

### 1. Clone the Repository

```bash
git clone https://github.com/DipanjanBasak-git/BookingBnB.git
cd BookingBnB
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory based on `.env.example`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/bookingbnb

JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Use 'mock' to skip real payments during development
PAYMENT_PROVIDER=mock

CLIENT_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Start the dev server:

```bash
npm run dev       # runs with nodemon on port 5000
```

Seed the database (optional):

```bash
npm run seed
```

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file in the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev       # runs on http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description                        | Auth Required  |
|--------|-----------------------------|------------------------------------|----------------|
| POST   | `/api/auth/register`        | Register a new user                | –              |
| POST   | `/api/auth/login`           | Login and receive tokens           | –              |
| GET    | `/api/listings`             | Get all public listings            | Optional       |
| GET    | `/api/listings/featured`    | Get featured listings              | –              |
| GET    | `/api/listings/:id`         | Get listing by ID                  | –              |
| POST   | `/api/listings`             | Create a new listing               | Host           |
| PUT    | `/api/listings/:id`         | Update a listing                   | Host / Admin   |
| PATCH  | `/api/listings/:id/publish` | Toggle listing publish status      | Verified Host  |
| DELETE | `/api/listings/:id`         | Delete a listing                   | Host / Admin   |
| GET    | `/api/bookings/availability`| Check date availability            | –              |
| POST   | `/api/bookings`             | Create a booking                   | Guest          |
| POST   | `/api/bookings/confirm`     | Confirm booking after payment      | Guest          |
| GET    | `/api/bookings/my-bookings` | Get current user's bookings        | Any            |
| GET    | `/api/payments`             | Initiate Razorpay order            | Guest          |
| GET    | `/api/dashboard`            | Get dashboard stats                | Host / Admin   |
| GET    | `/health`                   | API health check                   | –              |

---

## 🔐 Demo Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Guest | guest@bookingbnb.com     | Guest123!  |

> ℹ️ Run `npm run seed` in the `server/` directory to populate demo data.

---

## 🌐 Environment Variables Summary

| Variable                  | Description                                    |
|---------------------------|------------------------------------------------|
| `MONGODB_URI`             | MongoDB connection string                      |
| `JWT_SECRET`              | Secret key for access tokens                   |
| `JWT_REFRESH_SECRET`      | Secret key for refresh tokens                  |
| `CLOUDINARY_CLOUD_NAME`   | Your Cloudinary cloud name                     |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                             |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                          |
| `RAZORPAY_KEY_ID`         | Razorpay API key (use `mock` to bypass)        |
| `RAZORPAY_KEY_SECRET`     | Razorpay secret key                            |
| `PAYMENT_PROVIDER`        | `razorpay` or `mock`                           |
| `CLIENT_URL`              | Frontend URL for CORS                          |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ using Next.js & Express</p>
