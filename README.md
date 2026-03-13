# Realtime Messenger

A real-time chat application built with **React + TypeScript** on the frontend and **FastAPI (Python)** on the backend, using **Supabase** for database and real-time subscriptions.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for bundling and dev server
- **Tailwind CSS** + shadcn/ui components
- **Zustand** for state management
- **Supabase JS** for auth and real-time subscriptions

### Backend
- **FastAPI** (Python)
- **Supabase** (PostgreSQL database, storage, auth)
- **PyJWT** for token verification

## Project Structure

```
Realtime-Messenger/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI and chat components
│   │   ├── pages/        # Auth and Chat pages
│   │   ├── stores/       # Zustand state stores
│   │   ├── services/     # API client for backend
│   │   ├── integrations/ # Supabase client config
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── package.json
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── main.py       # FastAPI app entry
│   │   ├── config.py     # Environment config
│   │   ├── dependencies.py  # Auth middleware
│   │   ├── supabase_client.py
│   │   ├── schemas/      # Pydantic models
│   │   └── routers/      # API route handlers
│   └── requirements.txt
├── .env.example       # Environment template
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- **Node.js** ≥ 18 and npm
- **Python** ≥ 3.11
- A **Supabase** project with the database schema set up

### 1. Clone and configure

```sh
git clone <YOUR_GIT_URL>
cd Realtime-Messenger

# Copy and fill in your environment variables
cp .env.example .env
```

### 2. Start the Backend

```sh
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Start the Frontend

```sh
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:8080` and proxies API calls to the backend at `http://localhost:8000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in with email/password |
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/profiles` | List all profiles |
| GET | `/api/profiles/{id}` | Get profile by ID |
| PATCH | `/api/profiles/{id}` | Update profile |
| GET | `/api/conversations` | List user's conversations |
| POST | `/api/conversations` | Create direct conversation |
| POST | `/api/conversations/group` | Create group conversation |
| GET | `/api/conversations/{id}/messages` | Get messages |
| POST | `/api/conversations/{id}/messages` | Send message |
| POST | `/api/upload` | Upload file attachment |
| GET | `/api/health` | Health check |

## Environment Variables

### Frontend (in `frontend/.env`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Backend (in `backend/.env`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```
