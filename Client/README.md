# AI Social Media Scheduler

A full-stack web app for creating, scheduling and managing social media posts. Describe an idea, pick a tone, and the app uses the Google Gemini API to write a ready-to-publish post with hashtags. Then choose your platforms and a date and time, and the post is queued by a background scheduler.

---

## 🔗 Links

| Resource             | Link                                           |
| -------------------- | ---------------------------------------------- |
| 🌐 Live Demo         | https://your-app.vercel.app                    |
| 💻 GitHub Repository | https://github.com/your-username/your-repo     |
| 🎥 Demo Video        | https://youtu.be/your-video-id                 |
| 👤 LinkedIn          | https://linkedin.com/in/your-profile           |
| 🐙 GitHub Profile    | https://github.com/your-username               |

### Services used

| Service          | Link                               | Used for       |
| ---------------- | ---------------------------------- | -------------- |
| Google AI Studio | https://aistudio.google.com/apikey | Gemini API key |
| MongoDB Atlas    | https://www.mongodb.com/atlas      | Database       |
| Cloudinary       | https://cloudinary.com             | Media uploads  |

### Local URLs

| App      | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [How It Works](#how-it-works)
- [Roadmap](#roadmap)
- [Author](#author)
- [License](#license)

---

## Features

- **AI post generation:** enter a short idea and get platform-ready copy with hashtags, powered by Google Gemini.
- **Tone selection:** Professional, Creative, Funny, Minimalist or Excited.
- **Generation history:** every generated post is saved per user, so you can reuse it later.
- **Post scheduling:** pick one or more platforms (X, LinkedIn, Facebook, Instagram) and a future date and time.
- **Background scheduler:** a cron-based service checks for due posts and processes them automatically.
- **Media upload:** attach images or videos to scheduled posts, stored on Cloudinary.
- **Authentication:** protected API routes so each user only sees their own posts and generations.
- **Responsive UI:** built with React and Tailwind CSS.

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, Tailwind CSS, Axios          |
| UI helpers | lucide-react (icons), react-hot-toast (notifications) |
| Backend    | Node.js, Express, TypeScript                          |
| Database   | MongoDB (Mongoose)                                    |
| AI         | Google Gemini API (`@google/genai`)                   |
| Media      | Cloudinary, Multer                                    |
| Scheduling | node-cron                                             |

## Project Structure

```
social-scheduler/
├── client/                  # React frontend (Vite)
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

> Adjust folder names above if yours differ.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Gemini API key](https://aistudio.google.com/apikey)
- A [Cloudinary](https://cloudinary.com) account (the free tier is enough)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `server/.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

> Use the exact variable names your code reads. Check `server/config` and your database connection file, and rename the entries above if they differ.

Start the backend:

```bash
npm run dev
```

The server runs at `http://localhost:3000`.

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. If your frontend reads the API address from an environment variable, add it to `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

> Never commit `.env` files. Make sure `.env` is listed in your `.gitignore`.

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

## Roadmap

- [ ] Edit generated content before scheduling
- [ ] Platform-specific formatting (for example the 280-character limit for X)
- [ ] Real publishing through each platform's official API
- [ ] AI image generation (removed for now to keep the project free to run)
- [ ] Analytics dashboard

## Author

**Your Name**
GitHub: [@your-username](https://github.com/your-username) · LinkedIn: [your-profile](https://linkedin.com/in/your-profile)

## License

This project is licensed under the MIT License. 