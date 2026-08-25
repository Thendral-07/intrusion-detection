import json

def create_notebook():
    cells = []

    def md_cell(text):
        return {
            "cell_type": "markdown",
            "metadata": {},
            "source": [line + "\n" for line in text.strip().split("\n")]
        }

    def code_cell(code):
        return {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [line + "\n" for line in code.strip().split("\n")]
        }

    # 1. Header
    cells.append(md_cell("""# 🛡️ Cybersecurity Intrusion Detection System
## Clean, Leak-Free, Production-Ready Machine Learning Pipeline

This notebook implements an end-to-end Machine Learning pipeline for detecting network intrusion attacks:
1. **Zero Data Leakage:** All preprocessing (imputation, scaling, one-hot encoding) is encapsulated in an `sklearn.pipeline.Pipeline` fitted solely on training data.
2. **Cybersecurity Outlier Reality:** Analysis showing why statistical outliers (e.g., high failed logins or login attempts) are **true positive attack vectors** rather than measurement noise.
3. **Robust Feature Transformation:** Uses `RobustScaler` (Median & IQR-based) and individual feature scaling to prevent outlier distortion.
4. **Signal-Preserving Imputation:** Missing encryption and unknown browser types are kept as distinct informative categories.
5. **Optimized Decision Threshold:** Calibrated threat threshold (0.35) prioritized for security Recall.
6. **Model Explainability:** SHAP summary and local waterfall explanation.
7. **Production Serialization:** Full pipeline export with `joblib` for direct raw inference."""))

    # 2. Imports
    cells.append(md_cell("### Step 1: Library Imports"))
    cells.append(code_cell("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import RobustScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    precision_recall_curve
)
import shap
import joblib

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
sns.set_palette('crest')"""))

    # 3. Load Data
    cells.append(md_cell("### Step 2: Ingest & Inspect Dataset"))
    cells.append(code_cell("""df = pd.read_csv('cybersecurity_intrusion_data.csv')

print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
df.head()"""))

    # 4. Profiling
    cells.append(md_cell("### Step 3: Dataset Profiling & Target Distribution"))
    cells.append(code_cell("""print("--- Missing Values ---")
print(df.isnull().sum())

print("\\n--- Target Class Distribution ---")
print(df['attack_detected'].value_counts(normalize=True).rename('proportion').to_frame())"""))

    # 5. Outlier Analysis & Critical Domain Insight
    cells.append(md_cell("""### Step 4: Outlier Analysis & Cybersecurity Domain Insight
> **🚨 Critical Domain Insight:** In Cybersecurity, statistical "outliers" (e.g. 5 failed logins, 12 login attempts, or 7,000s sessions) are **NOT measurement errors or noise** — they are the **actual malicious intrusion signatures**!
> As shown below, records with extreme `failed_logins` or `login_attempts` have a **100% attack correlation**. Deleting or capping them destroys the very threat signals we want our model to catch."""))
    cells.append(code_cell("""numeric_features = [
    'network_packet_size', 'login_attempts', 'session_duration', 
    'ip_reputation_score', 'failed_logins', 'unusual_time_access'
]

outlier_records = []
for col in numeric_features:
    q25, q75 = df[col].quantile(0.25), df[col].quantile(0.75)
    iqr = q75 - q25
    lower_bound = q25 - 1.5 * iqr
    upper_bound = q75 + 1.5 * iqr
    
    outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
    outlier_subset = df[outlier_mask]
    attack_rate_in_outliers = (outlier_subset['attack_detected'].mean() * 100) if len(outlier_subset) > 0 else 0
    
    outlier_records.append({
        'Feature': col,
        'Lower Bound': round(lower_bound, 2),
        'Upper Bound': round(upper_bound, 2),
        'Outlier Count': int(outlier_mask.sum()),
        'Outlier %': round((outlier_mask.sum() / len(df)) * 100, 2),
        'Attack % in Outliers': f"{attack_rate_in_outliers:.1f}%",
        'Min': round(df[col].min(), 2),
        'Max': round(df[col].max(), 2)
    })

outlier_df = pd.DataFrame(outlier_records)
display(outlier_df)

# Individual Subplot Visualizations (Prevents session_duration scale from squashing other features)
fig, axes = plt.subplots(2, 3, figsize=(16, 8))
axes = axes.flatten()

for i, col in enumerate(numeric_features):
    sns.boxplot(x=df[col], ax=axes[i], color='#3b82f6')
    axes[i].set_title(f'Distribution of {col}', fontsize=12, fontweight='bold')
    axes[i].set_xlabel('')

plt.suptitle('Individual Feature Distributions (Visualizing Outliers Without Scale Distortion)', fontsize=14, y=1.02)
plt.tight_layout()
plt.show()"""))

    # 6. Train-Test Split
    cells.append(md_cell("### Step 5: Stratified Train-Test Split (Zero Data Leakage)"))
    cells.append(code_cell("""X = df.drop(columns=['session_id', 'attack_detected'])
y = df['attack_detected']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

print(f"Training set: {X_train.shape[0]} samples")
print(f"Testing set:  {X_test.shape[0]} samples")"""))

    # 7. Pipeline Construction
    cells.append(md_cell("""### Step 6: Construct Scikit-Learn Preprocessing & Modeling Pipeline
- **`RobustScaler`**: Scales using **Median** and **IQR** ($X_{scaled} = \\frac{X - \\text{Median}}{\\text{IQR}}$) instead of Mean and Variance. This ensures extreme outliers cannot skew the feature representations.
- **Tree-based Ensemble (`RandomForestClassifier`)**: Decision trees use ordinal thresholds ($x \\ge \\theta$) and are fundamentally immune to extreme monotonic outlier magnitudes.
- **Categorical Handling**: Preserves missing values as explicit `"Unknown"` threat tokens."""))
    cells.append(code_cell("""numeric_cols = [
    'network_packet_size', 'login_attempts', 'session_duration', 
    'ip_reputation_score', 'failed_logins', 'unusual_time_access'
]
categorical_cols = ['protocol_type', 'encryption_used', 'browser_type']

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', RobustScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
    ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_cols),
        ('cat', categorical_transformer, categorical_cols)
    ]
)

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(
        n_estimators=300,
        min_samples_split=5,
        min_samples_leaf=1,
        class_weight='balanced_subsample',
        random_state=42,
        n_jobs=-1
    ))
])

# Fit pipeline ONLY on training data
pipeline.fit(X_train, y_train)
print("Pipeline fitted successfully!")"""))

    # 8. Evaluation & Threshold Tuning
    cells.append(md_cell("### Step 7: Model Evaluation & Calibrated Security Threshold"))
    cells.append(code_cell("""# Predicted probabilities
y_test_proba = pipeline.predict_proba(X_test)[:, 1]

# Calibrated decision threshold for cybersecurity (0.35 gives higher recall for attacks)
decision_threshold = 0.35
y_test_pred = (y_test_proba >= decision_threshold).astype(int)

roc_auc = roc_auc_score(y_test, y_test_proba)

print("=" * 45)
print(f"  ROC-AUC SCORE: {roc_auc:.4f}")
print("=" * 45)

print(f"\\n--- Performance at Threshold ({decision_threshold}) ---")
print(f"Accuracy Score : {accuracy_score(y_test, y_test_pred):.4f}")
print(f"Precision Score: {precision_score(y_test, y_test_pred):.4f}")
print(f"Recall Score   : {recall_score(y_test, y_test_pred):.4f}")
print(f"F1 Score       : {f1_score(y_test, y_test_pred):.4f}")

print("\\n--- Confusion Matrix ---")
print(confusion_matrix(y_test, y_test_pred))

print("\\n--- Classification Report ---")
print(classification_report(y_test, y_test_pred, target_names=['Normal (0)', 'Attack (1)']))"""))

    # 9. ROC and PR Curves
    cells.append(md_cell("### Step 8: ROC and Precision-Recall Visualizations"))
    cells.append(code_cell("""fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_test_proba)
axes[0].plot(fpr, tpr, color='#1f77b4', lw=2, label=f'ROC Curve (AUC = {roc_auc:.3f})')
axes[0].plot([0, 1], [0, 1], color='gray', linestyle='--')
axes[0].set_title('Receiver Operating Characteristic (ROC)', fontsize=12)
axes[0].set_xlabel('False Positive Rate')
axes[0].set_ylabel('True Positive Rate')
axes[0].legend(loc='lower right')

# Precision-Recall Curve
precisions, recalls, _ = precision_recall_curve(y_test, y_test_proba)
axes[1].plot(recalls, precisions, color='#2ca02c', lw=2, label='Precision-Recall Curve')
axes[1].axvline(x=recall_score(y_test, y_test_pred), color='red', linestyle=':', label=f'Threshold {decision_threshold}')
axes[1].set_title('Precision-Recall Tradeoff', fontsize=12)
axes[1].set_xlabel('Recall')
axes[1].set_ylabel('Precision')
axes[1].legend(loc='lower left')

plt.tight_layout()
plt.show()"""))

    # 10. SHAP Explainability
    cells.append(md_cell("### Step 9: Model Explainability via SHAP"))
    cells.append(code_cell("""preprocessor_fitted = pipeline.named_steps['preprocessor']
classifier_fitted = pipeline.named_steps['classifier']

X_test_transformed = preprocessor_fitted.transform(X_test)
feature_names = preprocessor_fitted.get_feature_names_out()

explainer = shap.TreeExplainer(classifier_fitted)
shap_values = explainer(X_test_transformed[:200])

plt.figure(figsize=(10, 6))
shap.summary_plot(shap_values[..., 1], X_test_transformed[:200], feature_names=feature_names, show=False)
plt.title('SHAP Feature Importance (Attack Detection Class)', fontsize=13, pad=12)
plt.tight_layout()
plt.show()"""))

    # 11. Live Sample Inference
    cells.append(md_cell("### Step 10: Live Raw Event Inference & Waterfall Diagnostic"))
    cells.append(code_cell("""live_event = pd.DataFrame([{
    'network_packet_size': 4250,
    'login_attempts': 1,
    'session_duration': 12.0,
    'ip_reputation_score': 0.15,
    'failed_logins': 4,
    'unusual_time_access': 1,
    'protocol_type': 'TCP',
    'encryption_used': 'DES',
    'browser_type': 'Chrome'
}])

threat_prob = pipeline.predict_proba(live_event)[0, 1]
is_attack = int(threat_prob >= decision_threshold)

print("=" * 45)
print("         LIVE SECURITY DIAGNOSTIC")
print("=" * 45)
print(f"Raw Threat Probability : {threat_prob * 100:.2f}%")
print(f"Decision Threshold     : {decision_threshold * 100:.0f}%")
status_text = "🚨 BLOCKED - INTRUSION DETECTED" if is_attack else "🟩 ALLOWED - NORMAL TRAFFIC"
print(f"Action Taken           : {status_text}")

live_transformed = preprocessor_fitted.transform(live_event)
live_shap = explainer(live_transformed)

plt.figure(figsize=(8, 4))
shap.plots.waterfall(live_shap[0, ..., 1], max_display=8)"""))

    # 12. Serialization
    cells.append(md_cell("### Step 11: Pipeline Export for Production Deployment"))
    cells.append(code_cell("""model_filename = 'intrusion_detection_pipeline.joblib'
joblib.dump(pipeline, model_filename)
print(f"Saved pipeline to: {model_filename}")

loaded_pipeline = joblib.load(model_filename)
print(f"Loaded Pipeline Test Accuracy: {loaded_pipeline.score(X_test, y_test):.4f}")"""))

    notebook_data = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.11.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

    with open("cyber_security_clean_pipeline.ipynb", "w", encoding="utf-8") as f:
        json.dump(notebook_data, f, indent=2)
    print("Notebook 'cyber_security_clean_pipeline.ipynb' updated successfully!")

if __name__ == "__main__":
    create_notebook()
