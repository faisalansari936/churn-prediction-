# ChurnIQ — Development Progress

## Project structure

```text
hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── retention.py
│   ├── data/
│   ├── models/
│   ├── requirements.txt
│   └── train_model.py
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.tsx
    ├── package.json
    └── index.html
```

The exact tree may change. Keep this diagram synchronized with the actual repository.

## Features represented in the code
- [x] React + TypeScript frontend scaffold using Vite.
- [x] FastAPI backend structure.
- [x] Customer prediction form and result display.
- [x] API health/connection indicator.
- [x] Session history and dashboard metrics.
- [x] Risk-segment display.
- [x] SHAP explanation visualization support.
- [x] SHAP/LIME data handling where returned by the backend.
- [x] Retention-recommendations integration.
- [x] CSV batch-prediction interface.
- [x] Model-evaluation interface.
- [x] PDF report export functions.

## Verification still needed
- [ ] Confirm all sidebar navigation works.
- [ ] Run `npm run build` inside `frontend/`.
- [ ] Verify `/health`, `/predict`, `/evaluate`, `/predict-csv`, and `/retention-recommendations` against the current backend.
- [ ] Check CSV upload reads the file inside the request handler and handles invalid CSV input.
- [ ] Verify model/data paths from the documented working directory.
- [ ] Confirm SHAP and LIME dependencies and outputs.
- [ ] Add automated API tests and input-validation tests.
- [ ] Verify PDF downloads.
- [ ] Test mobile/narrow screens.
- [ ] Configure production API URL and CORS.
- [ ] Record actual evaluation metrics from a documented test set.

## Local verification log
Record actual results here; do not mark a check as passed until it has been run.

| Check | Command/action | Result | Date |
|---|---|---|---|
| Git installed | `git --version` | Not recorded | — |
| Frontend dependencies | `npm install` in `frontend/` | Not recorded | — |
| Frontend build | `npm run build` in `frontend/` | Not recorded | — |
| Backend dependencies | `pip install -r requirements.txt` in `backend/` | Not recorded | — |
| Health endpoint | Test the backend health route | Not recorded | — |
| Prediction | Test with valid synthetic input | Not recorded | — |
| CSV batch | Upload a valid synthetic CSV | Not recorded | — |

## Suggested next steps
1. Verify `.gitignore` excludes `node_modules`, virtual environments, `.env`, and private data.
2. Add screenshots and setup instructions to `README.md`.
3. Run frontend build and backend endpoint checks.
4. Add synthetic sample inputs only.
5. Deploy frontend/backend and configure the production API URL.
6. Update this document with verified test results and links.
