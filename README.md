# 🍽️ Restaurant Reservation System (Full Stack) – Work in Progress

A full-stack restaurant reservation platform focused on **reliable booking logic, concurrency safety, and real-world backend design**.

Customers can browse restaurants and make reservations, while restaurants manage availability and capacity through a structured time-slot system.

> 🚧 This project is actively under development. The backend core is fully functional, with frontend features being built in parallel.

---

## 🚀 Key Highlights

* 🔐 Secure authentication with JWT and HTTP-only cookies
* 🧠 **Concurrency-safe reservation system using PostgreSQL transactions (`FOR UPDATE`)**
* 📅 Time-slot based booking system with automatic capacity tracking
* ⚡ RESTful API built with Express + TypeScript
* 🗄 Relational database design with real-world constraints
* 🧩 Scalable backend architecture (controllers, middleware, DB layer)

---

## ✅ Core Features (Backend Complete)

### 🔑 Authentication & Authorization

* User and restaurant signup/login
* Password hashing with bcrypt
* JWT-based authentication (stored in httpOnly cookies)
* Protected routes via middleware

### 🏨 Restaurant Management

* Fetch all restaurants
* View restaurant details (capacity, opening hours)
* Restaurants can update operating hours
* Automatic generation of booking time slots

### 📅 Reservation System (Core Logic Implemented)

* Create reservation with:

  * Party size validation
  * Time-slot selection
  * Capacity checks
* Prevent booking in the past
* Prevent overbooking using **row-level locking (`FOR UPDATE`)**
* Atomic booking flow using **database transactions (BEGIN / COMMIT / ROLLBACK)**
* Cancel reservations with capacity restoration
* Fetch all reservations for a user

---

## 🧠 Technical Deep Dive (What Makes This Interesting)

### Concurrency-Safe Booking System

To prevent race conditions when multiple users book the same slot:

* Row-level locking is applied:

  ```sql
  SELECT ... FOR UPDATE
  ```
* Ensures only one transaction can modify a slot at a time
* Combined with transactions to maintain consistency

---

### Transactional Reservation Flow

Each booking:

1. Locks the selected time slot
2. Validates availability and time
3. Inserts reservation
4. Updates remaining capacity
5. Commits or rolls back on failure

This guarantees **data integrity under concurrent requests**.

---

### Time-Slot Generation System

* Restaurants define:

  * Opening time
  * Closing time
  * Last booking time
* System automatically generates slots for upcoming days
* Each slot tracks remaining capacity independently

---

## 🧰 Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Backend  | Node.js, Express.js, TypeScript               |
| Database | PostgreSQL (`pg`)                             |
| Auth     | JWT + httpOnly cookies                        |
| Frontend | Next.js (React), Tailwind CSS *(in progress)* |

---

## 🗄 Database Schema (Simplified)

### users

* `user_id`, `name`, `email`, `phone`, `password`, `role`

### restaurants

* `restaurant_id`, `name`, `email`, `phone`, `password`, `capacity`, `open_time`, `close_time`

### available_slots

* `slot_id`, `restaurant_id`, `slot_date`, `slot_time`, `capacity_left`

### reservations

* `reservation_id`, `user_id`, `restaurant_id`, `slot_id`, `party_size`, `reservation_date`, `reservation_time`

---

## 🧪 Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend (Work in Progress)

```bash
cd frontend
npm install
npm run dev
```

---

## 🗺 Roadmap

### Next Steps (High Priority)

* [ ] Complete frontend booking flow
* [ ] Connect frontend to live backend APIs
* [ ] Add input validation layer (e.g., Zod)
* [ ] Improve error handling & API responses

### Planned Features

* [ ] Restaurant dashboard (manage availability & bookings)
* [ ] Customer "My Reservations" page
* [ ] Favorites / wishlist system
* [ ] Pagination & filtering

### Future Enhancements

* [ ] Payment integration (Stripe)
* [ ] Notifications (email/SMS)
* [ ] Reviews & ratings
* [ ] Admin analytics dashboard

---

## 💡 Motivation

This project was built to demonstrate:

* Real-world backend problem solving (race conditions, consistency)
* RESTful API design with TypeScript
* Authentication and session management
* Relational database modeling
* Building systems that scale beyond basic CRUD

---

## 📌 Status

Backend core features are complete and tested.
Frontend is currently being developed alongside job applications.

---
