// MongoDB connection setup with automatic MongoDB Atlas integration, seed data, and offline fallback mode
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Village = require('../models/Village');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Prescription = require('../models/Prescription');
const FollowUp = require('../models/FollowUp');

let isConnected = false;

// In-memory dataset for local zero-config testing if MongoDB is not connected
const memoryDb = {
  villages: [
    { id: 1, name: 'Rampur', district: 'Sundargarh', state: 'Odisha' },
    { id: 2, name: 'Shyampur', district: 'Sundargarh', state: 'Odisha' },
    { id: 3, name: 'Chandpur', district: 'Sundargarh', state: 'Odisha' },
    { id: 4, name: 'Gobindpur', district: 'Sundargarh', state: 'Odisha' }
  ],
  users: [
    {
      id: 1,
      full_name: 'Dr. Ramesh Sharma (Admin)',
      email: 'admin@phc.org',
      // Password: Admin@123
      password_hash: '$2a$10$rQh8GYtJAdA/U.3INAXwJefIX8Ot8h4ncbBqegQZ0qvF.GsN/mu2W',
      role: 'admin',
      phone: '9876543210',
      status: 'active'
    },
    {
      id: 2,
      full_name: 'Dr. Ananya Roy',
      email: 'doctor@phc.org',
      // Password: Doctor@123
      password_hash: '$2a$10$7ZEH5buo6jZZIfUfiUP3De0HX1LMDLeyEkBNcgMmtzDxTODc.Fc9e',
      role: 'doctor',
      phone: '9876543211',
      status: 'active'
    },
    {
      id: 3,
      full_name: 'Suresh Patel',
      email: 'receptionist@phc.org',
      // Password: Recept@123
      password_hash: '$2a$10$eMrugUtYDNoooX0Tu5Dm0.LJH0SAF2w.a7scXZou6DMnbxuGI.3BK',
      role: 'receptionist',
      phone: '9876543212',
      status: 'active'
    }
  ],
  doctors: [
    {
      id: 1,
      user_id: 2,
      qualification: 'MBBS, MD (General Medicine)',
      specialization: 'General Physician',
      license_number: 'MED-OR-2021-9982',
      phone: '9876543211'
    }
  ],
  patients: [
    {
      id: 1,
      patient_code: 'PHC-2026-0001',
      first_name: 'Sunita',
      last_name: 'Devi',
      gender: 'female',
      age: 42,
      phone: '9123456789',
      address: 'House No 45, Main Basti',
      village_id: 1,
      emergency_contact: '9876543219',
      created_at: new Date().toISOString()
    }
  ],
  visits: [],
  prescriptions: [],
  follow_ups: []
};

// Seed MongoDB Atlas with initial demo data if collections are empty
async function seedMongoDB() {
  try {
    const villageCount = await Village.countDocuments();
    if (villageCount === 0) {
      console.log('🌱 Seeding MongoDB Atlas with initial villages...');
      await Village.insertMany(memoryDb.villages);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding MongoDB Atlas with initial default users (Admin, Doctor, Receptionist)...');
      await User.insertMany(memoryDb.users);
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      console.log('🌱 Seeding MongoDB Atlas with doctor profiles...');
      await Doctor.insertMany(memoryDb.doctors);
    }

    const patientCount = await Patient.countDocuments();
    if (patientCount === 0) {
      console.log('🌱 Seeding MongoDB Atlas with initial patient records...');
      await Patient.insertMany(memoryDb.patients);
    }
    console.log('✅ MongoDB Atlas Seed Data Verification Complete!');
  } catch (err) {
    console.error('Error seeding MongoDB Atlas:', err.message);
  }
}

// Initialize connection to MongoDB Atlas or local MongoDB
async function initDb() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.warn('⚠️  MONGODB_URI is not set in .env file.');
    console.warn('👉 App will run using local in-memory fallback dataset until MONGODB_URI is provided in .env');
    isConnected = false;
    return;
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('🚀 Connected to MongoDB Atlas Cloud Database successfully!');
    await seedMongoDB();
  } catch (error) {
    console.warn('⚠️  MongoDB Atlas connection error:', error.message);
    console.warn('👉 Switching to local in-memory dataset fallback mode for development.');
    isConnected = false;
  }
}

function getIsConnected() {
  return isConnected;
}

module.exports = {
  initDb,
  getIsConnected,
  memoryDb,
  Village,
  User,
  Doctor,
  Patient,
  Visit,
  Prescription,
  FollowUp
};
