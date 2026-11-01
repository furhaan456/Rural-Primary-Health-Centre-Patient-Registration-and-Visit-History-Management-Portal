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

// API Route Mounts (supporting both /api and root paths for maximum client compatibility)
const apiRoutes = [
  ['/auth', authRoutes],
  ['/patients', patientRoutes],
  ['/visits', visitRoutes],
  ['/prescriptions', prescriptionRoutes],
  ['/follow-ups', followUpRoutes],
  ['/doctors', doctorRoutes],
  ['/reports', reportRoutes]
];

apiRoutes.forEach(([path, router]) => {
  app.use(`/api${path}`, router);
  app.use(path, router);
});

// Health check endpoint
const handleHealth = (req, res) => {
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
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Start Server & Initialize Database
const startServer = (port) => {
  const numericPort = Number(port);
  const server = app.listen(numericPort, () => {
    console.log(`🚀 Rural PHC Portal Backend server listening on port ${numericPort}`);
    console.log(`📍 Health Check: http://localhost:${numericPort}/api/health`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${numericPort} is in use, trying port ${numericPort + 1}...`);
      startServer(numericPort + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

initDb().then(() => {
  startServer(PORT);
});

