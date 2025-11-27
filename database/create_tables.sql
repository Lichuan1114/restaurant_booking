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
    restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id),
    user_id INT NOT NULL REFERENCES users(user_id),
    slot_id INT NOT NULL REFERENCES available_slots(slot_id),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INT NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed'
);

-- Create available slot table
CREATE TABLE available_slots (
  slot_id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(restaurant_id) NOT NULL,
  slot_time TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  capacity_left INTEGER NOT NULL
);