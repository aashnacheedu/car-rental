const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pg = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true,
}));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }  
}));

// PostgreSQL Setup
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'car-rental',
  password: 'cat',
  port: 5432
});

// Authentication Middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  next();
}

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../car-rental-frontend')));

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'car-rental-frontend', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, '..', 'car-rental-frontend', 'dashboard.html'));
});

app.get('/session', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const result = await pool.query('SELECT id, name FROM users WHERE id = $1', [req.session.userId]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    req.session.userId = result.rows[0].id;
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.userName = user.name;
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }

    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.post('/cars', async (req, res) => {
  const { make, model, year, color, price_per_day, available } = req.body;
  try {
    await pool.query(
      'INSERT INTO cars (make, model, year, color, price_per_day, available) VALUES ($1, $2, $3, $4, $5, $6)',
      [make, model, year, color, price_per_day, available]
    );
    res.status(201).json({ message: 'Car added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add car' });
  }
});

app.get('/cars', async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM cars
      WHERE available = true
      AND id NOT IN (
        SELECT car_id FROM bookings
        WHERE (
          (start_date <= $1 AND end_date >= $1)
          OR
          (start_date <= $2 AND end_date >= $2)
          OR
          (start_date >= $1 AND end_date <= $2)
        )
      )
    `, [start_date, end_date]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No available cars for the selected dates.' });
    } else {
      res.status(200).json({ cars: result.rows });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cars' });
  }
});

app.post('/bookings', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { car_id, start_date, end_date } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  if (startDate >= endDate) {
    return res.status(400).json({ message: 'Start date must be before end date' });
  }

  try {
    const bookingConflictResult = await pool.query(`
      SELECT * FROM bookings
      WHERE car_id = $1
      AND (
        (start_date <= $2::date AND end_date >= $2::date)
        OR
        (start_date <= $3::date AND end_date >= $3::date)
        OR
        (start_date >= $2::date AND end_date <= $3::date)
      )
    `, [
      car_id, 
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ]);

    if (bookingConflictResult.rows.length > 0) {
      return res.status(400).json({ message: 'No cars available for the selected dates.' });
    }

    await pool.query(
      'INSERT INTO bookings (user_id, car_id, start_date, end_date) VALUES ($1, $2, $3::date, $4::date)',
      [req.session.userId, car_id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    res.status(201).json({ message: 'Booking successful' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

app.get('/bookings', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        b.id AS booking_id,
        b.start_date,
        b.end_date,
        c.id AS car_id,
        c.make,
        c.model,
        c.year,
        c.color,
        c.price_per_day
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.start_date DESC
    `, [req.session.userId]);

    res.status(200).json({ bookings: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Start HTTP Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
