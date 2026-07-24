# AI Resume Checker

A full-stack, AI-powered resume analysis platform. Upload your resume as a PDF, receive an ATS readiness score, get detailed feedback on issues and strengths, rewrite weak bullet points using Gemini AI, and track improvement across versions with a side-by-side diff view.

---

## Project Structure

```
airesumechecker/
├── backend/                        # Node.js / Express REST API
│   ├── src/
│   │   ├── config/                 # Environment config
│   │   ├── middlewares/            # Auth, validation, upload, rate-limit, error handler
│   │   ├── models/                 # Mongoose schemas (User, Resume, ResumeVersion, Analysis)
│   │   ├── routes/                 # API route handlers
│   │   │   ├── auth.js             # Register / Login / Logout / Me
│   │   │   ├── resumes.js          # Resume CRUD, upload, analyze, rewrite, diff
│   │   │   ├── dashboard.js        # Dashboard summary + KPIs
│   │   │   ├── insights.js         # Aggregated analytics across all resumes
│   │   │   ├── versions.js         # Cross-resume version listing
│   │   │   └── history.js          # Activity event feed
│   │   ├── services/               # Business logic
│   │   │   ├── pdfService.js       # PDF text extraction
│   │   │   ├── structuredParser.js # Gemini-powered resume parsing
│   │   │   ├── geminiServices.js   # Gemini-powered ATS analysis
│   │   │   └── diffService.js      # Word/line diff between versions
│   │   └── server.js               # App entry point
│   ├── .env                        # Environment variables (never commit)
│   ├── .gitignore
│   └── package.json
│
└── frontend/
    └── airesumechecker-portal/     # React + Vite + Tailwind CSS SPA
        ├── src/
        │   ├── api/                # Axios API client modules
        │   ├── components/         # Reusable UI components
        │   ├── pages/              # Route-level page components
        │   ├── hooks/              # Custom React hooks
        │   └── main.jsx            # App entry point
        ├── .gitignore
        └── package.json
```

---

## Features

| Feature | Description |
|---|---|
| 📄 PDF Upload | Upload resume as PDF — text is extracted server-side |
| 🤖 AI Parsing | Gemini extracts structured data: basics, experience, education, skills |
| 📊 ATS Analysis | Score 0–100 with breakdown across keywords, formatting, impact, clarity |
| 🔍 Issues & Strengths | Top 5 prioritised issues and standout strengths with evidence |
| ✏️ Bullet Rewrites | AI rewrites weak bullets to be stronger and ATS-friendly |
| 🔁 Version Control | Each rewrite creates a new version; full version history tracked |
| ↔️ Diff Viewer | Word-level or line-level diff between any two versions |
| 📈 Dashboard | KPI cards, score trend chart, recent activity feed |
| 🧠 Insights | Cross-resume analytics: score trends, top issues, keyword gaps |
| 🔐 Auth | JWT-based authentication with httpOnly cookie sessions |

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js v20+ |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| AI | Google Gemini (`@google/genai`) |
| Auth | JWT + httpOnly cookies |
| Validation | Zod |
| File Upload | Multer (in-memory buffer) |
| PDF Parsing | pdf-parse |
| Diff | diff |
| Env | dotenvx |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router |

---

## Getting Started

### Prerequisites

- Node.js v20+
- A MongoDB Atlas cluster (free tier works)
- A Google Gemini API key from [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/mine0059/airesumechecker.git
cd airesumechecker
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<app>
JWT_SECRET=<your-long-random-secret>
JWT_EXPIRY_IN=7d
COOKIE_NAME=arr_token
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-3.5-flash
```

Start the backend dev server:

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Set up the frontend

```bash
cd frontend/airesumechecker-portal
npm install
npm run dev
```

Frontend runs on **http://localhost:5173** and proxies all `/api` requests to the backend.

---

## API Reference

All routes require authentication unless noted. Auth is via httpOnly cookie set on login.

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login, sets cookie |
| POST | `/logout` | Clears cookie |
| GET | `/me` | Returns current user |

### Resumes — `/api/resumes`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all resumes |
| POST | `/` | Upload PDF resume |
| GET | `/:id` | Get resume + versions |
| DELETE | `/:id` | Delete resume |
| GET | `/:id/version/:versionId` | Get a specific version |
| POST | `/:id/analyze` | Run AI analysis |
| GET | `/:id/analyses` | List all analyses |
| GET | `/:id/versions/:versionId/analysis` | Latest analysis for a version |
| POST | `/:id/rewrite` | Apply AI bullet rewrites → new version |
| GET | `/:id/diff?from=&to=` | Word/line diff between two versions |

### Dashboard & Analytics
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard` | KPIs, score trend, activity feed |
| GET | `/api/insights` | Aggregated analytics, top issues/keywords |
| GET | `/api/versions` | All versions across all resumes |
| GET | `/api/history` | Full activity event feed |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Port the backend listens on |
| `NODE_ENV` | ✅ | `development` or `production` |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (keep it long and random) |
| `JWT_EXPIRY_IN` | ✅ | Token expiry e.g. `7d` |
| `COOKIE_NAME` | ✅ | Name of the auth cookie |
| `CLIENT_ORIGIN` | ✅ | Frontend origin for CORS (comma-separated for multiple) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `GEMINI_MODEL` | ✅ | Gemini model to use e.g. `gemini-3.5-flash` |

> ⚠️ **Never commit `.env` to version control.** It is already in `.gitignore`.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

## License

MIT
