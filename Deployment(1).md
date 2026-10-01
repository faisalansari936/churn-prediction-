# ChurnIQ — Setup and Deployment

This document covers local development and a production deployment outline. Check the chosen host's current documentation, pricing, and limitations before deploying.

## 1. Prerequisites
- Python compatible with `backend/requirements.txt`
- Node.js LTS and npm
- Required trained model file(s) and data artifacts
- Git for normal Git-based deployment

## 2. Run locally on Windows

Use two VS Code terminals.

### Terminal A — Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If PowerShell blocks activation, try:
```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

This assumes `backend/app/main.py` exposes a FastAPI variable named `app`. Adjust the Uvicorn target if your code differs. Test the health route documented by the backend (commonly `http://localhost:8000/health`). FastAPI docs are commonly at `http://localhost:8000/docs`.

### Terminal B — Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, commonly `http://localhost:5173`.

Before production, replace the frontend's local API address (`http://localhost:8000`) with the deployed backend URL.

## 3. Pre-deployment checklist
- [ ] Run `npm run build` in `frontend/`.
- [ ] Install backend requirements in a clean environment.
- [ ] Verify endpoint paths, request schemas, and response schemas.
- [ ] Ensure required model artifacts are available at runtime.
- [ ] Never commit passwords, API keys, `.env` files, or real customer data.
- [ ] Configure CORS for the deployed frontend origin.
- [ ] Use an environment variable such as `VITE_API_URL` for the production API base URL, and make sure frontend code reads it.
- [ ] Check model/data file sizes and hosting limits.
- [ ] Test the live site and inspect service logs.

## 4. Example hosting architecture
A common setup is a static frontend host (such as Vercel or Netlify), a Python web-service host (such as Render), and GitHub for source control. These are examples, not guarantees; verify current plan limits, build options, sleeping behavior, and file-storage support.

### Frontend build settings
Typical Vite configuration:
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Example environment variable:
```text
VITE_API_URL=https://YOUR-BACKEND-HOST
```

This works only after the frontend code reads `import.meta.env.VITE_API_URL`. Vite variables prefixed with `VITE_` are exposed to browser code, so never put secrets in them.

### Backend service settings
Typical settings when the host builds from the repository with `backend` as root:
- Install command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Use the port syntax required by your hosting provider. Confirm the Python version and model-loading paths work on that host.

### CORS
Allow requests from the exact deployed frontend origin(s). Prefer an explicit allowlist over allowing every origin.

## 5. Model and data artifacts
Check how the backend loads model and data files. Relative paths may fail when the working directory changes. Resolve paths consistently or configure them explicitly. For files too large for normal GitHub storage, consider Git LFS or a suitable artifact store, and confirm the deployed service can access the files at startup.

## 6. Common problems
| Problem | What to check |
|---|---|
| Frontend says backend offline | API URL, backend status, HTTPS, browser console |
| CORS error | Exact frontend origin in backend CORS settings |
| API 404 | Route path and service entry point |
| API 500 | Service logs, input validation, model loading, file paths |
| Missing model | Artifact inclusion/download and runtime path |
| Build failure | Run `npm run build`; inspect dependency errors |
| CSV failure | Endpoint implementation, required columns, file size and format |
| Service exits | Required port binding and start command |

## 7. Post-deployment smoke test
- [ ] Open frontend over HTTPS.
- [ ] Check backend health endpoint.
- [ ] Submit a synthetic customer example.
- [ ] Confirm risk score and explanations display.
- [ ] Test retention recommendations.
- [ ] Upload a small synthetic CSV.
- [ ] Test evaluation if evaluation data is configured.
- [ ] Download available PDF reports.
- [ ] Test desktop and mobile layouts.
- [ ] Inspect logs and remove test secrets/data.

## 8. Deployment record
- GitHub repository: _add URL_
- Frontend URL: _add URL_
- Backend URL: _add URL_
- Deployment date: _add date_
- Known limitations: _add notes_
