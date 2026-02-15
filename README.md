# Sup'Hope – Child Protection Dashboard Platform

Sup'Hope is a full-stack web application designed to support child protection case management in Tunisia.  
The platform provides secure, role-based dashboards for Mothers/Aunts/Educators, Psychologists, and Directors.

---

## Project Overview

Sup'Hope enables:

- Secure authentication system
- Role-based access control
- Case reporting & management
- AI-powered PDF report generation
- Prioritization system for psychologists
- Workflow tracking for child protection cases

The platform is designed to be secure, scalable, and modular.

---

## Tech Stack

### Frontend
- React.js
- Axios
- React Router
- Responsive UI

### Backend
- Node.js
- Express.js
- MongoDB (In-Memory for development)
- JWT Authentication
- PDF Generation Service
- AI Integration Module

---


---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SupHope.git
cd SupHope


cd backend
npm install
node src/server.js

cd frontend
npm install
npm start

PORT=5000
JWT_SECRET=your_secret_key
MONGO_URI=your_mongodb_connection_string

POST    /api/auth/register
POST    /api/auth/login
GET     /api/reports
POST    /api/reports
PUT     /api/reports/:id
DELETE  /api/reports/:id

cd backend
node src/server.js

cd frontend
npm start

