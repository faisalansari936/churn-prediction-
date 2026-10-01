# ChurnIQ — Project Planning

## 1. Overview
ChurnIQ is an explainable customer churn prediction application with a React + TypeScript frontend and Python/FastAPI backend. It estimates churn risk, displays model explanations, segments risk, and presents retention suggestions.

## 2. Problem statement
Customer churn can reduce recurring revenue and increase replacement-acquisition costs. Teams need a risk estimate plus understandable context to help them decide which customers to review.

## 3. Goals
- Accept customer information and return a churn-risk prediction.
- Display a probability/percentage and risk segment.
- Present SHAP/LIME explanations when provided by the backend.
- Offer retention recommendations.
- Support CSV batch prediction.
- Display model-evaluation results.
- Export available prediction, batch, and evaluation reports as PDFs.
- Provide a responsive dashboard.

## 4. Technology stack

| Area | Technology | Purpose |
|---|---|---|
| Frontend | React, TypeScript, Vite | Interactive interface |
| Styling | CSS | Responsive layout |
| Charts | Recharts | Analytics visualizations |
| Icons | lucide-react | UI icons |
| HTTP | Axios | API requests |
| Backend | Python, FastAPI | API and prediction workflow |
| ML model | XGBoost | Churn-risk prediction |
| Explainability | SHAP, LIME | Model interpretation |
| Reports | jsPDF, jspdf-autotable | PDF exports |
| Version control | Git, GitHub | Source history and sharing |

## 5. User workflow
1. Open the dashboard and check backend connection.
2. Enter customer details and request a prediction.
3. Review the risk score and segment.
4. Inspect available SHAP/LIME explanations.
5. Review retention suggestions.
6. Optionally upload a CSV for batch analysis.
7. Review evaluation metrics and export reports.

## 6. Implementation checklist
- [x] React/Vite frontend and FastAPI backend structure.
- [x] Customer-prediction interface and API integration.
- [x] Session history and dashboard summary cards.
- [x] CSV batch-prediction UI and PDF reporting.
- [x] Model-evaluation UI and PDF reporting.
- [x] Retention-insights UI and API integration.
- [x] Frontend support for explanation visualization.
- [ ] Verify every API endpoint end to end.
- [ ] Test SHAP/LIME with representative inputs.
- [ ] Test invalid inputs, missing model/data, and offline backend.
- [ ] Run frontend production build and resolve errors.
- [ ] Complete responsive/accessibility checks.
- [ ] Configure production API URLs and deploy.
- [ ] Document dataset, training, actual metrics, and limitations.

> Checklist items describe current development notes; re-test them before release.

## 7. Success criteria
- Frontend communicates with the configured backend.
- Valid inputs produce structured prediction responses.
- Explanations and recommendations display when returned.
- CSV processing returns per-customer results and summary counts.
- Evaluation results display when evaluation data is available.
- PDF exports work.
- Secrets and generated dependency folders are excluded from version control.
- Another developer can follow the setup guide.

## 8. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Unrepresentative data | Document data source, preprocessing, class balance, and limitations. |
| Misleading probability | Evaluate calibration; explain that a score is not certainty. |
| Explanation mistaken for causation | Explain that SHAP/LIME describe model behavior, not causal effects. |
| Privacy exposure | Use synthetic demo data; do not commit private customer data. |
| Local API URL fails in production | Configure the deployed API URL through environment settings. |
| Large model artifacts | Check repository limits; consider Git LFS or artifact storage. |

## 9. Responsible use
Use predictions to support human review, not as unquestioned decisions. Validate performance across relevant customer groups, protect data, and review retention actions for fairness and suitability.
