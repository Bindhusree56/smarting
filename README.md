# SmartSHG – A Multilingual Digital Platform for Self Help Groups

Full-stack source code for Modules 1–3:

1. **Authentication & Language** – Register, Login, Forgot Password, English/Telugu language switch, role-based access (Head / Member).
2. **SHG Group Management** – Head creates a group and gets an auto-generated group code, edits group details, approves/removes members. Member joins using the group code and views group details.
3. **Member Management** – Head adds/edits/removes/searches members with name, mobile, Aadhaar (optional), address, join date, and status.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** React (Vite), React Router, react-i18next (English/Telugu), Axios

## Project Structure

```
smartshg/
  backend/     Express REST API
  frontend/    React SPA
```

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev               # starts on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod`, or a MongoDB Atlas connection string in `.env`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # points to the backend API, defaults to http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## How the Modules Work

### Module 1 – Auth & Language
- `POST /api/auth/register` – create account with role `head` or `member`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password` – generates a 6-character reset code (returned in the response for this demo build since no SMS/email provider is wired up — see the `TODO` in `authController.js` to plug one in for production)
- `POST /api/auth/reset-password`
- Language can be switched anytime from the navbar/login/register screens (English / తెలుగు) and is stored per-user.

### Module 2 – SHG Group Management
- Head: `POST /api/groups` creates a group and returns a unique code like `SHG-7K3F9A`.
- Head: `PUT /api/groups/:id` edits group details; `GET /api/groups/:id/pending` + `PUT /api/groups/:id/approve/:memberId` approve join requests; `DELETE /api/groups/:id/members/:memberId` removes a member.
- Member: `GET /api/groups/lookup/:code` previews a group, `POST /api/groups/join` submits a join request that goes into `pending` status until the Head approves it.

### Module 3 – Member Management
- Head-only endpoints under `/api/members` (add, edit, remove — soft delete via `status: removed`, list/search by name or mobile).
- Fields stored: name, mobile, Aadhaar (optional, 12-digit), address, join date, status (`pending` / `active` / `removed`).

## Security Notes for Production

- Set a strong, random `JWT_SECRET` in `backend/.env`.
- Wire up a real SMS/email provider for the forgot-password flow and stop returning the reset code in the API response.
- Consider rate-limiting `/api/auth/*` routes to prevent brute-force attempts.
- Serve the frontend over HTTPS and set a strict CORS `CLIENT_URL`.

## Next Modules

This ships Modules 1–3. Send over the specs for the next modules (e.g. Savings & Loans, Meetings/Attendance, Reports) and they'll be added following the same structure (model → controller → routes → frontend pages).
# smarting
