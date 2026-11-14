# Q-Flow: Smart Queue Management System

A modern, responsive, full-stack enterprise web application for booking digital tokens, tracking live queue positions with dynamic wait-time estimation, and managing multi-department service counters in real-time.

Designed for high-traffic environments including:
- **Hospitals & Healthcare Clinics** (Triage, consultations, emergency prioritization)
- **Banking & Financial Institutions** (Cashier counters, loan officers, teller routing)
- **Civic & Government Centers** (Passports, licensing, biometrics, identity verification)
- **Customer Care & Retail Centers** (Warranty service, technical support, billing)

---

## 🚀 Key Features

### 👤 Customer Features
- **Self-Service Token Booking**: Select department, priority category, and preferred date.
- **Transaction-Safe Sequence Engine**: Anti-collision numbering (`GM-001`, `BNK-001`, `GOV-001`) with pessimistic database locks.
- **Live Queue Tracking**: Real-time position tracking, currently serving token, people ahead, and dynamic progress bar.
- **Smart Wait-Time Prediction**: Dynamic formula based on actual completed visit durations and active counter pool.
- **Audio Chime & Alerts**: Real-time WebSocket chime when your ticket is called to a counter.
- **Cryptographic QR Code Receipts**: Downloadable and printable receipts with secure verification references.
- **Duplicate Prevention**: Prevents double bookings in the same department.

### 🧑‍💼 Staff / Operator Terminal
- **Assigned Counter View**: Dedicated counter number, desk name, and department.
- **Elapsed Service Timer**: Live clock tracking seconds and minutes spent per customer.
- **Interactive Action Terminal**:
  - `Call Next Token` (automatic priority-first triage: Emergency > Disability > Senior > Normal)
  - `Recall Token` (re-triggers customer chime and display flash)
  - `Start Serving`
  - `Complete Visit` (calculates actual duration to improve wait estimates)
  - `Skip Token` & `Mark No-Show`
- **Integrated QR Code Scanner/Verifier**: Real-time barcode or reference code lookup.
- **Daily Performance Statistics**: Total customers served today and average duration.

### 🛡️ Admin Management Console
- **Executive Analytics Dashboard**: Total customers, today's volume, active counters, average wait times.
- **Peak-Hour Traffic Analysis**: Visual hourly distribution of bookings from 8 AM to 6 PM.
- **Status Breakdown**: Interactive status distribution (Waiting, Serving, Completed, Cancelled, Skipped).
- **Department CRUD**: Manage departments, opening/closing hours, average duration, and daily limits.
- **Counter Allocation**: Create counters, assign operators, and toggle active/inactive status.
- **Staff Account Management**: Provision operator accounts with BCrypt security.
- **Live Token Monitor**: Multi-filter search (by department, status, date, or customer name/email).

### 📺 Public Display Board (`/display`)
- High-contrast lobby monitor view designed for TV displays and waiting room kiosks.
- Shows currently called tokens by desk with audible turn chimes and department filtering.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, Lucide React, React Router 6, SockJS, StompJS |
| **Backend** | Java 17, Spring Boot 3.2.4, Spring Data JPA, Spring Security 6, Hibernate, Maven |
| **Authentication** | Stateless JWT (JSON Web Tokens) with HMAC-SHA256, BCrypt Password Encryption |
| **Real-time** | STOMP WebSockets over SockJS (`/ws-queue`) with 5-second polling fallback |
| **Database** | MySQL 8.0+ compatible schema / Embedded H2 with MySQL mode for instant out-of-the-box run |
| **QR Engine** | ZXing Core & JavaSE (Generates Base64 PNG QR barcodes) |

---

## ⚡ Quick Start Instructions

### Prerequisites
- **Java 17+** (e.g. Eclipse Adoptium OpenJDK 17)
- **Node.js 18+** & npm

### Method 1: Instant One-Click Launcher (Windows)
Double-click `start-all.bat` in the project root:
```cmd
start-all.bat
```
This automatically launches:
1. **Backend Server**: `http://localhost:8080`
2. **Frontend UI**: `http://localhost:5173`

---

### Method 2: Manual Terminal Startup

#### 1. Start Spring Boot Backend
```powershell
cd backend
mvn spring-boot:run
```
*Note: The backend starts on port 8080 and immediately loads realistic sample data for all 4 sectors.*

#### 2. Start React Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 👥 Pre-Configured Demo Accounts

For instant testing, the login page features **1-click autofill buttons** for all three roles:

| Role | Email | Password | Description / Assigned Desk |
|---|---|---|---|
| **Admin** | `admin@smartqueue.com` | `Admin@123` | Full administrative control & analytics |
| **Staff (Doctor)** | `dr.sharma@hospital.com` | `Staff@123` | Doctor Room 1 (`C-01`), General Medicine |
| **Staff (Teller)** | `teller.alice@bank.com` | `Staff@123` | Teller Counter 1 (`T-01`), Retail Banking |
| **Staff (Civic)** | `officer.raj@gov.com` | `Staff@123` | Biometrics Desk 1 (`W-01`), Passport & ID |
| **Customer** | `john.doe@example.com` | `Customer@123` | General customer with active token |
| **Customer** | `sarah.smith@example.com`| `Customer@123` | Senior Citizen priority test account |

---

## 🗄️ Database Setup & MySQL Workbench

### Default Embedded Mode (Zero Configuration)
By default, the application runs an embedded database in MySQL 8 compatibility mode:
- URL: `jdbc:h2:mem:smart_queue_db;MODE=MySQL`
- Web Console: `http://localhost:8080/h2-console` (Username: `sa`, Password: *blank*)

### Using Native MySQL 8 Server:
1. Import the provided schema:
   ```cmd
   mysql -u root -p < database/smart_queue_schema.sql
   ```
   *(Or double-click `database/setup_mysql.bat`)*
2. Start the backend with the MySQL profile:
   ```powershell
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## 📡 REST API & Postman Collection

Import `docs/Smart_Queue_API.postman_collection.json` into Postman to test all endpoints:
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Customer**: `/api/customer/departments`, `/api/customer/tokens/book`, `/api/customer/tokens/my-tokens`, `/api/customer/tokens/{id}/queue-position`, `/api/customer/tokens/{id}/cancel`
- **Staff**: `/api/staff/stats`, `/api/staff/call-next`, `/api/staff/recall`, `/api/staff/start-serving`, `/api/staff/complete`, `/api/staff/skip`, `/api/staff/no-show`, `/api/staff/verify-token`
- **Admin**: `/api/admin/stats`, `/api/admin/departments`, `/api/admin/counters`, `/api/admin/staff`, `/api/admin/tokens`
- **Public**: `/api/public/departments`, `/api/public/queue/{departmentId}`, `/api/public/verify/{code}`
- **WebSocket**: `/ws-queue` (Broker: `/topic/queue/{id}`, `/topic/token/{id}`, `/topic/admin/stats`)

---

## 📐 Smart Waiting-Time Formula

$$\text{Estimated Waiting Time (min)} = \max\left(2, \; \left\lceil \frac{\text{People Ahead}}{\max(1, \text{Active Counters})} \times \left(0.7 \times \bar{D}_{\text{completed today}} + 0.3 \times D_{\text{configured}}\right) \right\rceil\right)$$
