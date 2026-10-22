-- Database Schema for Rural PHC Patient Registration & Visit History Management Portal

CREATE DATABASE IF NOT EXISTS phc_portal;
USE phc_portal;

-- 1. Villages Table
CREATE TABLE IF NOT EXISTS villages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  district VARCHAR(100) DEFAULT 'Rural District',
  state VARCHAR(100) DEFAULT 'State Medical Center',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Role-Based Access)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'receptionist') NOT NULL,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Doctors Profile Table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) DEFAULT 'General Physician',
  license_number VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. PHC-2026-0001
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  age INT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  village_id INT NOT NULL,
  emergency_contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (village_id) REFERENCES villages(id)
);

-- 5. Visits Table
CREATE TABLE IF NOT EXISTS visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_code VARCHAR(30) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  receptionist_id INT NOT NULL,
  visit_date DATE NOT NULL,
  chief_complaint TEXT NOT NULL,
  temp_celsius DECIMAL(4,1),
  bp_systolic INT,
  bp_diastolic INT,
  pulse_rate INT,
  weight_kg DECIMAL(5,2),
  diagnosis TEXT,
  status ENUM('waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (receptionist_id) REFERENCES users(id)
);

-- 6. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_id INT UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- 7. Prescription Items Table
CREATE TABLE IF NOT EXISTS prescription_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_name VARCHAR(150) NOT NULL,
  dosage VARCHAR(50) NOT NULL,         -- e.g. 500mg
  frequency VARCHAR(50) NOT NULL,      -- e.g. 1-0-1
  duration_days INT NOT NULL,          -- e.g. 5 days
  instructions VARCHAR(255),           -- e.g. Take after food
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 8. Follow-ups Table
CREATE TABLE IF NOT EXISTS follow_ups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  visit_id INT NOT NULL,
  follow_up_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status ENUM('pending', 'completed', 'missed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);
