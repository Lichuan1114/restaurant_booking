-- Create users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(20),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_or_phone CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

-- Create restaurants table
CREATE TABLE restaurants (
  restaurant_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(200),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  capacity INTEGER,
  CONSTRAINT email_or_phone CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

-- Create reservations table
CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(restaurant_id) NOT NULL,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  reservation_time TIMESTAMP,
  status VARCHAR(100) DEFAULT 'pending'
);

-- Create available slot table
CREATE TABLE available_slots (
  slot_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(restaurant_id) NOT NULL,
  slot_time TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  capacity_left INTEGER NOT NULL
);