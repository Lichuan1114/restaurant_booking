-- USERS
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(50),
  CONSTRAINT email_or_phone CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

-- RESTAURANTS
CREATE TABLE restaurants (
  restaurant_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(50),
  open_time TIME,
  close_time TIME,
  last_booking_time TIME,
  CONSTRAINT email_or_phone CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

-- AVAILABLE SLOTS
CREATE TABLE available_slots (
  slot_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id),
  slot_time TIME NOT NULL,
  slot_date DATE,
  capacity_left INTEGER NOT NULL
);

-- RESERVATIONS
CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id),
  user_id INT NOT NULL REFERENCES users(user_id),
  slot_id INT NOT NULL REFERENCES available_slots(slot_id),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INT NOT NULL CHECK (party_size > 0),
  status VARCHAR(20) DEFAULT 'confirmed'
);

-- INDEXES
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_slots_restaurant_id ON available_slots(restaurant_id);