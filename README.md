# 🍽️ Restaurant Booking Application (Full Stack) – Work in Progress

A full-stack restaurant reservation platform where customers can sign up, log in, browse restaurants, and (eventually) make reservations online. Restaurants will also have their own dashboard to manage bookings and capacity.

> This project is currently under development. Core frontend and backend functionality is implemented, with more features planned.

---

## ✅ Features (Implemented So Far)

- Customer sign-up and login (React + Next.js + REST API)
- Backend API endpoints for user registration and login
- Password hashing using bcrypt
- JWT authentication with protected routes
- Customers can view a list of restaurants (dummy data from backend)
- Responsive frontend layout using Tailwind CSS
- Reusable UI components (e.g., `RestaurantCard`, form components)
- PostgreSQL database with `Users` and `Restaurants` tables
- Express + TypeScript backend with reusable middleware and database connection pool

---

## 🧰 Tech Stack

| Layer         | Technology |
|---------------|------------|
| Frontend      | Next.js (React), Tailwind CSS |
| Backend       | Node.js, Express.js, TypeScript |
| Database      | PostgreSQL (`pg` package) |
| Authentication| JWT tokens (currently stored in localStorage; will switch to httpOnly cookies) |
| Styling       | Tailwind CSS |
| Language      | TypeScript (frontend + backend) |

---

## 🏗 Planned Features (MVP Roadmap)

### MVP Goals
- [ ] Favoriting restaurants (wishlist)
- [ ] Restaurant booking form (date, time, number of seats) with availability checks
- [ ] Stripe payment integration for deposits or full payment
- [ ] Customer "My Bookings" page
- [ ] Restaurant login + dashboard to manage availability

### Future Enhancements
- Admin dashboard with analytics (bookings, revenue)
- Google Maps integration for restaurant locations
- Email/SMS notifications (Twilio, SendGrid)
- OAuth login (Google/Facebook)
- Dynamic restaurant filtering by location, rating, or price
- User reviews & ratings system

---

## 🗄 Database Overview

Current PostgreSQL tables:

- **users**: `user_id`, `name`, `email`, `phone`, `password`, `role`, `created_at`
- **restaurants**: `restaurant_id`, `name`, `email`, `phone`, `password`, `capacity`, `created_at`

---

## 🧪 Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Motivation
This project was built as a full-stack capstone-style personal project to showcase:
- REST API design
- TypeScript full-stack development
- JWT authentication and protected routes
- Database design and relational constraints
- Scalable folder architecture (services, models, controllers, components)
