# ChurnIQ — Project Defense / Viva Q&A

Adapt these answers to the implementation you have actually tested. Do not claim metrics, dataset sizes, or results without evidence.

## Project overview

### 1. What is ChurnIQ?
ChurnIQ is a customer churn prediction application. It uses a web interface and Python API to estimate churn risk, show explanations, segment risk, and present retention suggestions.

### 2. What problem does it solve?
It helps teams identify customers who may be at risk of leaving and review model-generated reasons before deciding whether to take a retention action.

### 3. Who could use it?
Customer-success teams, subscription businesses, analysts, and managers reviewing churn risk.

### 4. What are its main modules?
React frontend, FastAPI backend, prediction workflow, SHAP/LIME explanation display, risk segmentation, retention recommendations, CSV batch prediction, model evaluation, and PDF reporting.

## Technology

### 5. Why React?
React supports reusable interface components and interactive views. TypeScript adds static checks for many values and API response structures.

### 6. Why FastAPI?
FastAPI provides a Python API layer for validating requests, running prediction logic, and returning structured responses. It also supports interactive API documentation.

### 7. What does XGBoost do?
XGBoost is the project's prediction model. It learns patterns from training data and estimates churn risk for new inputs. Its quality depends on the data, preprocessing, training process, and evaluation.

### 8. What is Axios used for?
Axios sends HTTP requests from the frontend to the backend and handles responses and request errors.

## Churn and machine learning

### 9. What is customer churn?
Churn is when a customer stops using or paying for a product or service during a defined period. The exact definition depends on the business and dataset.

### 10. What does churn probability mean?
It is the model's estimated likelihood of the churn class, assuming the pipeline returns a probability. It is not a guarantee that the customer will leave.

### 11. What is risk segmentation?
It maps a numeric score to categories such as low, medium, or high using thresholds. The actual thresholds should be documented in the code and validated for the use case.

### 12. How should a churn model be evaluated?
Useful metrics include precision, recall, F1-score, confusion matrix, ROC-AUC, and precision-recall analysis. Accuracy alone may be misleading when classes are imbalanced. Report actual values only from a documented evaluation set.

### 13. Why is recall important?
Low recall means some customers who churn may be missed. Increasing recall can also increase false positives, so the operating threshold should reflect outreach costs and business goals.

## Explainability

### 14. What is SHAP?
SHAP (SHapley Additive exPlanations) assigns feature contributions to a model output relative to a baseline, helping explain how features contribute to a prediction.

### 15. What is LIME?
LIME (Local Interpretable Model-agnostic Explanations) approximates model behavior around one input with a simpler interpretable model. It is a local explanation.

### 16. Why use SHAP and LIME?
A score alone gives little context. Explanations help reviewers inspect which features influenced the model output.

### 17. Do SHAP and LIME prove causation?
No. They explain aspects of model behavior; they do not prove that changing a feature will cause a customer to stay or leave.

### 18. Why might SHAP and LIME differ?
They use different methods, assumptions, sampling, and output representations. Their explanations should be interpreted in context, not expected to match exactly.

## Retention and batch processing

### 19. What are retention recommendations?
They are suggested follow-up actions based on customer information and predicted risk. A person should review them for suitability, fairness, and customer preferences.

### 20. What is CSV batch prediction?
It allows multiple records to be analyzed in one upload instead of submitting each customer individually.

### 21. What columns does the CSV require?
The exact required columns and value formats are defined by the current backend input schema. Check the endpoint or API documentation rather than assuming every dataset uses the same names.

### 22. Why export PDF reports?
PDF reports make prediction, batch, and evaluation results easier to save, share, and present.

## Reliability and limitations

### 23. What happens if the backend is offline?
Frontend API requests can fail. The backend must be running and reachable for predictions to succeed; the interface should communicate connection or request errors.

### 24. How is customer data protected?
Use synthetic examples in demos, never commit private data or credentials, restrict service access, and follow applicable privacy and retention rules.

### 25. What are the limitations?
Predictions depend on the training data and may become less reliable as customer behavior changes. Explanations are not causal proof, and recommendations need human review. Monitor performance after deployment.

### 26. What would you improve next?
Automated tests, model calibration, drift monitoring, fairness checks, authentication, audit logs, input validation, clearer explanation guidance, and evaluation on a documented held-out dataset.

## Suggested demo walkthrough
1. Show the dashboard and backend connection status.
2. Enter a synthetic customer example and request a prediction.
3. Explain the score and risk segment.
4. Show available SHAP/LIME output.
5. Review the suggested retention action and explain why human review matters.
6. Upload a small synthetic CSV and inspect the results.
7. Show evaluation results if a valid evaluation dataset is configured.
8. Export a PDF report.
9. Summarize architecture, limitations, and planned improvements.

## Architecture summary

```text
User
  |
  v
React + TypeScript frontend
  | HTTP requests
  v
FastAPI backend
  |
  +--> Input validation / preprocessing
  +--> XGBoost churn prediction
  +--> SHAP / LIME explanations
  +--> Risk segmentation / retention recommendations
  |
  v
Structured API response
  |
  v
Dashboard, charts, batch results, PDF reports
```

The exact internal order depends on the current backend implementation; use the source code and live API responses during the demonstration.
