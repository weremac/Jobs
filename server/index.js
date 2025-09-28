const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nastavnik-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB povezan'))
.catch(err => console.error('Greška pri povezivanju sa MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/annual-plans', require('./routes/annualPlans'));
app.use('/api/monthly-plans', require('./routes/monthlyPlans'));
app.use('/api/lesson-preps', require('./routes/lessonPreps'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Greška na serveru', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint nije pronađen' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});