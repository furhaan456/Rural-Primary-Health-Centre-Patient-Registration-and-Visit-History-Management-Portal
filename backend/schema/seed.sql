-- Seed Data for Rural PHC Management Portal

USE phc_portal;

-- Seed Villages
INSERT INTO villages (id, name, district, state) VALUES
(1, 'Rampur', 'Sundargarh', 'Odisha'),
(2, 'Shyampur', 'Sundargarh', 'Odisha'),
(3, 'Chandpur', 'Sundargarh', 'Odisha'),
(4, 'Gobindpur', 'Sundargarh', 'Odisha');

-- Seed Users (Passwords hashed with bcrypt: 'Admin@123', 'Doctor@123', 'Recept@123')
-- Pre-computed hashes for demonstration:
-- Admin@123 -> $2a$10$y58.g7jCg0U/R4/rN0W4A.E7QzJ9/uY0J4S3a2X3X3X3X3X3X3X3
INSERT INTO users (id, full_name, email, password_hash, role, phone) VALUES
(1, 'Dr. Ramesh Sharma (Admin)', 'admin@phc.org', '$2a$10$rQh8GYtJAdA/U.3INAXwJefIX8Ot8h4ncbBqegQZ0qvF.GsN/mu2W', 'admin', '9876543210'),
(2, 'Dr. Ananya Roy', 'doctor@phc.org', '$2a$10$7ZEH5buo6jZZIfUfiUP3De0HX1LMDLeyEkBNcgMmtzDxTODc.Fc9e', 'doctor', '9876543211'),
(3, 'Suresh Patel', 'receptionist@phc.org', '$2a$10$eMrugUtYDNoooX0Tu5Dm0.LJH0SAF2w.a7scXZou6DMnbxuGI.3BK', 'receptionist', '9876543212');

-- Seed Doctor Profile
INSERT INTO doctors (id, user_id, qualification, specialization, license_number, phone) VALUES
(1, 2, 'MBBS, MD (General Medicine)', 'General Physician', 'MED-OR-2021-9982', '9876543211');

-- Seed Sample Patient
INSERT INTO patients (id, patient_code, first_name, last_name, gender, age, phone, address, village_id, emergency_contact) VALUES
(1, 'PHC-2026-0001', 'Sunita', 'Devi', 'female', 42, '9123456789', 'House No 45, Main Basti', 1, '9876543219');
