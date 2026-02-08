const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE (ORDER MATTERS)
   ========================= */

// ✅ 1. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'https://rep-up-delta.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all preflight requests

// ✅ 2. Body parser
app.use(express.json());

// ✅ 3. Request Logger (after cors)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.headers.origin);
  next();
});


/* =========================
   DATABASE CONNECTION
   ========================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));


/* =========================
   ROUTES
   ========================= */

// Test Route
app.get('/', (req, res) => {
  res.send('Exercise Tracker API is running');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);


/* =========================
   SERVER START
   ========================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
