# 🩺 Health Guardian AI

An AI-powered healthcare management system that helps users manage personal and family health records, medicine reminders, health checkups, prescription scanning, and an AI chatbot for health-related assistance.

---

# 📌 Project Overview

Health Guardian AI is a full-stack web application designed to simplify healthcare management for individuals and families. The system securely stores medical information, reminds users about medicines and checkups, scans prescriptions, and provides AI-powered health guidance through an intelligent chatbot.

The application follows a modern three-tier architecture consisting of Frontend, Backend, and Database for better scalability, maintainability, and security.

---

# ❗ Problem Statement

Managing family healthcare manually is difficult because users often:

- Forget to take medicines.
- Miss regular health checkups.
- Lose prescription records.
- Find it difficult to monitor family members' health.
- Need quick healthcare assistance without searching multiple websites.

There is a need for one centralized platform that manages all healthcare information in one place.

---

# 💡 Solution

Health Guardian AI provides a complete healthcare management platform that enables users to:

- Manage their personal profile.
- Add and monitor family members.
- Receive medicine reminders.
- Schedule health checkups.
- Upload and store prescriptions.
- Chat with an AI assistant for health-related queries.
- Securely store all healthcare information.

---

# ✨ Features

## 👤 User Authentication
- User Signup
- User Login
- JWT Authentication
- Secure Password Hashing (bcrypt)

## 👨‍👩‍👧 Family Management
- Add Family Members
- Edit Family Members
- Delete Family Members
- View Family Health Information

## 💊 Medicine Reminder
- Add Medicines
- Set Reminder Schedule
- Update Medicine Details
- Delete Medicines

## 🩺 Health Checkup Reminder
- Schedule Checkups
- Track Upcoming Appointments
- Update Checkup Status

## 📄 Prescription Management
- Upload Prescription Images
- Store Medical Records
- Delete Prescriptions

## 🤖 AI Health Chatbot
- AI-powered health assistance
- Chat history management

## 👤 Profile Management
- Update Profile Information
- Upload Profile Photo

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- PostgreSQL

## Database

- PostgreSQL

## AI Integration

- Google Gemini API

## Version Control

- Git
- GitHub

---

# 🏗 Technical Architecture

```
                    +----------------------+
                    |      User Browser    |
                    +----------+-----------+
                               |
                               |
                        HTTP Requests
                               |
                               v
+------------------------------------------------------+
|                 React Frontend (Vite)                |
| Login | Dashboard | Family | Medicines | AI Chatbot  |
+----------------------+-------------------------------+
                       |
                 REST API Calls
                       |
                       v
+------------------------------------------------------+
|           Node.js + Express Backend                  |
|------------------------------------------------------|
| Authentication (JWT)                                 |
| Profile Management                                   |
| Family Members                                       |
| Medicine Reminder                                    |
| Health Checkups                                      |
| Prescription Upload                                  |
| AI Chatbot API                                       |
+----------------------+-------------------------------+
                       |
             SQL Queries / File Uploads
                       |
          +------------+-------------+
          |                          |
          v                          v
+---------------------+      +----------------------+
| PostgreSQL Database |      | Local Upload Storage |
| Users               |      | Avatars              |
| Profiles            |      | Prescriptions        |
| Medicines           |      +----------------------+
| Family Members      |
| Checkups            |
| Chat History        |
+---------------------+

                       |
                       v
               Google Gemini API
                 (AI Responses)
```

---

# 🔄 Workflow

```
User
   │
   ▼
Frontend (React)
   │
REST API Request
   │
   ▼
Backend (Node.js + Express)
   │
 ┌──────────────┬──────────────┐
 │              │              │
 ▼              ▼              ▼
Database     File Storage    Gemini AI
(PostgreSQL)   Uploads         API
 │              │              │
 └──────────────┴──────────────┘
        Response to Frontend
                │
                ▼
              User
```

---

# ⚙ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/Nisha8806/Health-Guardian-AI.git
```

---

## Backend Setup

```bash
cd backend

npm install

cp .env.example .env

npm run dev
```

Backend runs on:

```
http://localhost:4000
```

---

## Database Setup

Install PostgreSQL.

Create a database named:

```
health_guardian
```

Run:

```bash
database/schema.sql
```

Update:

```
backend/.env
```

Example:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/health_guardian

JWT_SECRET=your_secret_key
```

---

## Frontend Setup

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🚀 Usage Guide

1. Create a new account.
2. Login securely.
3. Complete your profile.
4. Add family members.
5. Add medicine reminders.
6. Schedule health checkups.
7. Upload prescriptions.
8. Chat with the AI Health Assistant.
9. Monitor healthcare activities through the dashboard.

---

# 📂 Project Structure

```
Health-Guardian-AI/

│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── uploads/
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── README.md
└── .gitignore
```

---

# 🔐 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected REST APIs
- Secure File Upload
- Environment Variables

---

# 🚀 Future Enhancements

- AWS Cloud Deployment
- Email Notifications
- SMS Medicine Alerts
- Doctor Appointment Booking
- Medical Report Analysis using AI
- Cloud Storage (AWS S3)
- Mobile Application
- Push Notifications

---

# 👥 Team Details

**Project Title**

Health Guardian AI

**Developed By**

- Nishanthini

**Technology**

- React
- Node.js
- Express.js
- PostgreSQL
- Google Gemini API

---

# 📄 License

This project is developed for educational and learning purposes.
