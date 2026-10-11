# EcoMap API

## Motivation and Project Objectives
EcoMap is an environmental problem reporting and monitoring API designed to help communities in Mozambique (initially focusing on Maputo) identify, report, and monitor environmental hazards. The goal is to provide a reliable backend platform to track issues like illegal garbage dumping, blocked drainage channels, and water pollution, ultimately facilitating community cleanup and civic action.

## Target Users and Use Cases
* **Citizens:** Can report environmental problems, providing a description, category, and precise geographical coordinates.
* **Administrators/Local Authorities:** Can monitor the reports, update the resolution status (e.g., from `pending` to `in_progress`), and manage community users.

## Technologies Used
* **Node.js & Express.js:** Backend runtime and web framework.
* **MongoDB Atlas & Mongoose:** Cloud database and Object Data Modeling (ODM).
* **Swagger UI (OpenAPI 3.0):** Interactive API documentation.
* **Render:** Cloud hosting and deployment platform.
* **Passport (GitHub OAuth) & express-session:** Authentication, sessions stored in MongoDB.
* **Jest & Supertest:** Automated testing framework.

## Installation and Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guinterchissengue/ecomap.git
   cd ecomap
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:** copy `.env.example` to `.env` and fill in `MONGODB_URI`, `SESSION_SECRET`, the GitHub OAuth credentials and `ADMIN_GITHUB_USERS`.
4. **Run the server:**
   ```bash
   npm run dev
   ```
5. **Run the tests:**
   ```bash
   npm test
   ```

## Collections and Endpoints
| Collection | GET (public) | POST / PUT / DELETE (login required) |
|---|---|---|
| `users` | `/users`, `/users/{id}` | POST admin only; PUT/DELETE the user themself or an admin |
| `reports` | `/reports`, `/reports/{id}` | reporter = logged in user; only admins change `status` |
| `cleanups` | `/cleanups`, `/cleanups/{id}` | organizer = logged in user; links to a report |
| `comments` | `/comments`, `/comments/{id}` | author = logged in user; links to a report |

All POST and PUT routes validate the body and answer `400` with a clear message when requirements are not met (`401` not logged in, `403` not the owner, `404` not found, `409` conflict).

## Authentication (GitHub OAuth)
1. On GitHub: Settings → Developer settings → OAuth Apps → New OAuth App (use one app for Render and another for localhost).
2. Homepage URL `https://ecomap-wcp2.onrender.com` and authorization callback URL `https://ecomap-wcp2.onrender.com/auth/github/callback` (locally: `http://localhost:3000/auth/github/callback`).
3. Put the client id/secret in `.env` locally and in the Render dashboard.
4. Open `/auth/github` in the browser to log in. The session cookie unlocks the protected routes, including Swagger "Try it out". `/auth/me` shows who you are and `/auth/logout` ends the session.

## Tests
`npm test` runs the Jest unit tests (models are mocked, no database needed): GET and GET-by-id for all four collections, `401` on every protected route, and the data validation rules.

## Live API and Documentation
* Swagger UI: https://ecomap-wcp2.onrender.com/api-docs (the root URL redirects here)
* Health check: https://ecomap-wcp2.onrender.com/health
