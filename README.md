# AI Social Media Scheduler

A full-stack web app for creating, scheduling and managing social media posts. Describe an idea, pick a tone, and the app uses the Google Gemini API to write a ready-to-publish post with hashtags. Then choose your platforms and a date and time, and the post is queued by a background scheduler.

---

## 🔗 Links

| Resource             | Link                                                |
| -------------------- | --------------------------------------------------- |
| 🌐 Live Demo         | https://social-scheduler-flame.vercel.app          |
| ⚙️ Backend API       | https://social-scheduler-api-eovz.onrender.com     |

> **Note:** the backend runs on Render's free plan, which sleeps when idle. The first request after a break can take 30 to 60 seconds.

### Services used

- Google Gemini API
- MongoDB Atlas
- Cloudinary
- Zernio
- Render
- Vercel

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Features

- **AI post generation:** enter a short idea and get platform-ready copy with hashtags, powered by Google Gemini.
- **Tone selection:** Professional, Creative, Funny, Minimalist or Excited.
- **Generation history:** every generated post is saved per user, so you can reuse it later.
- **Post scheduling:** pick one or more platforms (X, LinkedIn, Facebook, Instagram) and a future date and time.
- **Background scheduler:** a cron-based service checks for due posts and processes them automatically.
- **Dashboard:** an overview of your scheduled posts, published posts, connected accounts and AI-generated posts.
- **Media upload:** attach images or videos to scheduled posts, stored on Cloudinary.
- **Authentication:** JWT-based login, with protected API routes so each user only sees their own data.
- **Responsive UI:** built with React and Tailwind CSS.

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, Tailwind CSS, Axios          |
| UI helpers | lucide-react (icons), react-hot-toast (notifications) |
| Backend    | Node.js, Express 5, TypeScript (tsx)                  |
| Database   | MongoDB (Mongoose)                                    |
| Auth       | JSON Web Tokens, bcrypt                               |
| AI         | Google Gemini API (`@google/genai`)                   |
| Social API | Zernio (`@zernio/node`)                               |
| Media      | Cloudinary, Multer                                    |
| Scheduling | node-cron                                             |
| Hosting    | Vercel (frontend), Render (backend)                   |

## Project Structure

```
social-scheduler/
├── Client/                  # React frontend (Vite)
│   └── src/
│       ├── api/axios.ts     # Axios instance
│       ├── assets/assets.ts # Platform definitions
│       └── pages/           # Dashboard, Accounts, Scheduler, AIComposer
└── server/                  # Express backend
    ├── config/              # Cloudinary and Multer setup
    ├── controllers/         # postController.ts (generate, schedule, list)
    ├── middlewares/         # authMiddleware.ts (protect)
    ├── models/              # Generation.ts, Post.ts, ...
    ├── routes/              # postRoutes.ts, ...
    └── server.ts            # App entry point
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Gemini API key](https://aistudio.google.com/apikey)
- A [Cloudinary](https://cloudinary.com) account 
- A Zernio API key

### 1. Clone the repository

```bash
git clone https://github.com/sidharth-webdev/social-scheduler.git
cd social-scheduler
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `server/.env` file (see [Environment Variables](#environment-variables)), then start the server:

```bash
npm run server
```

The backend runs at `http://localhost:3000`.

### 3. Set up the frontend

```bash
cd Client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Create `Client/.env` so the frontend knows where the API is:

```env
VITE_API_URL=http://localhost:3000
```

## Environment Variables

### Backend (`server/.env`)

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
ZERNIO_API_KEY=your_zernio_key
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend (`Client/.env`)

```env
VITE_API_URL=http://localhost:3000
```

> Never commit `.env` files. They are listed in `.gitignore`.

## API Overview

All routes below are protected and require a logged-in user.

| Method | Endpoint                 | Description                                                |
| ------ | ------------------------ | ---------------------------------------------------------- |
| POST   | `/api/posts/generate`    | Generate post text with Gemini and save it                 |
| GET    | `/api/posts/generations` | List the user's saved generations                          |
| GET    | `/api/posts`             | List the user's scheduled posts                            |
| POST   | `/api/posts`             | Schedule a post (platforms, date and time, optional media) |

### Example: generate a post

```http
POST /api/posts/generate
Content-Type: application/json

{
  "prompt": "A post about the launch of our new eco-friendly coffee beans",
  "tone": "Creative"
}
```

## How It Works

1. The user enters an idea and picks a tone on the AI Composer page.
2. The backend sends a prompt to Gemini, saves the generated text to MongoDB and returns it.
3. The user selects platforms, a date and a time, and the post is saved with the status `scheduled`.
4. A node-cron service runs on an interval, finds posts that are due and processes them.

## Deployment

- **Frontend:** deployed on Vercel with the root directory set to `Client`. The `VITE_API_URL` environment variable points to the Render backend.
- **Backend:** deployed on Render as a Node web service with the root directory set to `server`, build command `npm install` and start command `npm start`. All variables from `server/.env` are added in Render's environment settings.
- **Database:** MongoDB Atlas, with network access allowed for Render.

## Roadmap

- [ ] Edit generated content before scheduling
- [ ] Platform-specific formatting (for example the 280-character limit for X)
- [ ] Analytics dashboard
- [ ] Always-on scheduler hosting

## Author

**Sidharth Pradhan**
GitHub: https://github.com/sidharth-webdev · LinkedIn: www.linkedin.com/in/sidharth-webdev 
