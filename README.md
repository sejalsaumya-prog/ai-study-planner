# StudyAI — AI-Powered Study Planner

A full-stack web application that uses AI to generate personalized study schedules based on your subjects, exam dates, and available study hours.

## Live Demo
> Deploy link goes here after deployment

## Features
- 🤖 **AI Schedule Generation** — Groq (Llama3) creates optimized 7-day study plans
- 📚 **Subject Management** — Add subjects with exam dates, difficulty, priority
- ✅ **Session Tracking** — Mark study sessions complete, track daily progress
- 📊 **Progress Analytics** — Visual charts showing completion by subject
- 🏆 **Achievement Badges** — Gamified progress milestones
- 🔐 **JWT Authentication** — Secure login/register system
- 📱 **Fully Responsive** — Works on mobile and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI | Groq API (Llama3-8b) |
| Auth | JWT (JSON Web Tokens) |
| Deploy | Vercel (frontend) + Railway (backend) |

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables (backend/.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GROQ_API_KEY=gsk_...
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## Project Structure
```
ai-study-planner/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── pages/       # Dashboard, Subjects, Schedule, Progress
        ├── components/  # Layout, Navigation
        └── context/     # Auth state management
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/subjects | Get all subjects |
| POST | /api/subjects | Add subject |
| POST | /api/schedule/generate | Generate AI schedule |
| GET | /api/schedule | Get current schedule |
| PATCH | /api/schedule/complete/:id | Toggle session complete |
| GET | /api/progress/stats | Get progress statistics |
