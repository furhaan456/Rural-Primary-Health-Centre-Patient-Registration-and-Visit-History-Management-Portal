// Main Express Server entrypoint for PHC Portal Backend
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb, getIsConnected } = require('./config/db');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = getIsConnected();
  res.status(200).json({
    status: 'OK',
    message: 'Rural PHC Portal API Server is running smoothly.',
    database: {
      connected: dbConnected,
      mode: dbConnected ? 'MongoDB Atlas Cloud' : 'In-Memory Fallback',
      mongooseReadyState: mongoose.connection.readyState // 1 = connected, 0 = disconnected
    }
  });
});

// Start Server & Initialize Database
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Rural PHC Portal Backend server listening on port ${port}`);
    console.log(`📍 Health Check: http://localhost:${port}/api/health`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

initDb().then(() => {
  startServer(PORT);
});

