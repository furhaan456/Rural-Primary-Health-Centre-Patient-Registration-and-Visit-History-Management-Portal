# 🏥 Rural Primary Health Centre (PHC) Management Portal

A full-stack, enterprise-grade digital health management system specifically crafted for **Rural Primary Health Centres (PHCs)**. This portal streamlines patient intake, daily Outpatient Department (OPD) queue token generation, vitals recording, electronic clinical consultations, structured e-prescriptions, follow-up scheduling, and administrative health analytics.

---

## 🌟 Key Features

### 👨‍💼 Role-Based Access Control (RBAC)
- **Receptionist**: Patient registration, village mapping, daily OPD token creation, vitals recording (BP, Pulse, Temp, Weight), and patient search.
- **Doctor**: Real-time OPD patient queue, comprehensive past visit history review, clinical diagnosis entry, electronic prescription writing (dosage, frequency, duration), and follow-up appointment scheduling.
- **Administrator**: Staff user registration (Doctors & Receptionists), overall PHC analytics dashboard, village-wise patient distribution, and weekly visit trend reports.

### 📋 Core Modules
1. **Patient Registration & Search**: Instant registration with auto-generated unique PHC patient tracking codes (e.g., `PHC-2026-0001`), emergency contacts, and village demographic mapping.
2. **OPD Queue & Token System**: Automated daily token generation (`VST-20261010-001`) with real-time status tracking (`waiting`, `in_consultation`, `completed`).
3. **Clinical Consultation & E-Prescriptions**: Structured prescription entry for medicines, dosage schedules, duration in days, and doctor notes.
4. **Follow-Up Tracking**: Calendar and list view for scheduling and monitoring upcoming patient follow-ups.
5. **Analytics & Metrics**: Visual charts (powered by Chart.js) displaying village patient statistics and weekly OPD visit trends.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS & Custom Modern Glassmorphism UI
- **Icons & Charts**: Lucide React Icons & Chart.js (`react-chartjs-2`)
- **HTTP Client**: Axios

### **Backend**
- **Runtime**: Node.js (v18+) & Express.js
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Middleware**: Express CORS & JSON body parsing

### **Database Layer (Dual Engine Support)**
- **MongoDB Atlas** (Cloud NoSQL via Mongoose ORM with auto-seeding)
- **MySQL** (Relational via `mysql2` with auto-schema execution)
- **Zero-Config Fallback**: Automatic in-memory dataset mode for instant testing if external databases are offline.

---

## 📁 Project Architecture

```text
Rural Primary Health Centre Management Portal/
├── backend/
│   ├── config/
│   │   └── db.js               # Dual MongoDB Atlas & MySQL database connector + fallback engine
│   ├── controllers/
│   │   ├── authController.js   # Login, staff registration, profile retrieval
│   │   ├── patientController.js# Patient intake, search, village mapping
│   │   ├── visitController.js  # OPD tokens, vitals, visit history
│   │   ├── prescriptionController.js # E-prescriptions & items
│   │   ├── followUpController.js    # Follow-up scheduling & queue
│   │   ├── doctorController.js      # Doctor staff management
│   │   └── reportController.js      # PHC analytics & metrics
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication verification
│   │   └── roleMiddleware.js   # Role authorization guards
│   ├── models/                 # Mongoose schemas (User, Patient, Visit, etc.)
│   ├── routes/                 # Express API router mounts
│   ├── schema/                 # Relational SQL schema & seed files
│   ├── .env                    # Environment configuration
│   ├── package.json
│   └── server.js               # Main Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/         # Navigation bars, metric cards, modal dialogs
│   │   ├── pages/              # Dashboard, Patient Intake, Queue, Consultations, Reports
│   │   ├── services/           # Axios API integration modules
│   │   ├── App.jsx             # Route definitions & React Context providers
│   │   └── index.css           # Tailwind base styles & custom animations
│   ├── package.json
│   └── vite.config.js          # Vite build & proxy settings
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 1. Clone & Set Up Environment Variables

Navigate to the `backend/` directory and configure `.env`:

```bash
cd backend
```

Create or update `.env`:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=phc_super_secret_jwt_key_2026_rural_health

# MongoDB Atlas Connection String (Optional - falls back to local demo DB if blank)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/phc_portal?appName=Cluster0
```

### 2. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```
*(The backend runs at `http://localhost:5001`. Health Check endpoint: `http://localhost:5001/api/health`)*

### 3. Start the Frontend Application

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs at `http://localhost:3000/`)*

---

## 🔑 Demo Login Credentials

The system includes pre-seeded demo accounts for testing each role:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor@phc.org` | `Doctor@123` | Patient visit histories, clinical consultations, e-prescriptions, follow-up scheduling |
| **Receptionist** | `receptionist@phc.org` | `Recept@123` | Patient registration, village selection, OPD token generation, vitals recording |
| **Administrator** | `admin@phc.org` | `Admin@123` | Full administrative dashboard, staff user creation, PHC analytics reports |

---

## 📡 API Reference Overview

| Endpoint | Method | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticate user and receive JWT token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve profile of currently logged-in user |
| `/api/patients/create` | `POST` | Receptionist / Admin | Register new patient |
| `/api/patients/search` | `GET` | Authenticated | Search patients by code, name, or phone |
| `/api/patients/:id` | `GET` | Authenticated | Get detailed patient profile |
| `/api/patients/villages` | `GET` | Authenticated | Fetch list of registered villages |
| `/api/visits/create` | `POST` | Receptionist / Admin | Issue OPD visit token & record vitals |
| `/api/visits/today` | `GET` | Authenticated | Retrieve active OPD queue for today |
| `/api/visits/patient/:patientId` | `GET` | Authenticated | Retrieve complete visit history for a patient |
| `/api/prescriptions` | `POST` | Doctor / Admin | Add e-prescription for an OPD visit |
| `/api/prescriptions/visit/:visitId` | `GET` | Authenticated | Get prescription items & details for a visit |
| `/api/follow-ups` | `POST` | Doctor / Admin | Schedule follow-up appointment |
| `/api/follow-ups/upcoming` | `GET` | Authenticated | List upcoming follow-up appointments |
| `/api/reports/overview` | `GET` | Admin | Aggregate metrics, village distribution & visit trends |

---

## 🛡️ License & Acknowledgments

Built to support healthcare accessibility in rural communities. Released under the **MIT License**.
