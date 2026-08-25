"""
Cybersecurity Intrusion Detection System
Clean, Production-Ready Machine Learning Pipeline
"""

import pandas as pd
import numpy as np
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
    classification_report
)
import joblib


def build_pipeline():
    # 1. Column Definitions
    numeric_cols = [
        "network_packet_size", "login_attempts", "session_duration", 
        "ip_reputation_score", "failed_logins", "unusual_time_access"
    ]
    categorical_cols = ["protocol_type", "encryption_used", "browser_type"]

    # 2. Sub-Pipelines
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", RobustScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    # 3. Column Transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_cols),
            ("cat", categorical_transformer, categorical_cols)
        ]
    )

    # 4. Full Pipeline with Classifier
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=300,
            min_samples_split=5,
            min_samples_leaf=1,
            class_weight="balanced_subsample",
            random_state=42,
            n_jobs=-1
        ))
    ])

    return pipeline


def main():
    print("[1/5] Loading dataset...")
    df = pd.read_csv("cybersecurity_intrusion_data.csv")

    X = df.drop(columns=["session_id", "attack_detected"])
    y = df["attack_detected"]

    # 2. Stratified Train-Test Split (Zero Leakage)
    print("[2/5] Splitting data into Train / Test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 3. Build & Train Pipeline
    print("[3/5] Training end-to-end pipeline...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    # 4. Evaluate with Custom Security Threshold (0.35)
    print("[4/5] Evaluating model on unseen test data...")
    y_test_proba = pipeline.predict_proba(X_test)[:, 1]
    decision_threshold = 0.35
    y_test_pred = (y_test_proba >= decision_threshold).astype(int)

    print("\n" + "=" * 45)
    print(f"  ROC-AUC SCORE: {roc_auc_score(y_test, y_test_proba):.4f}")
    print("=" * 45)
    print(f"Accuracy  : {accuracy_score(y_test, y_test_pred):.4f}")
    print(f"Precision : {precision_score(y_test, y_test_pred):.4f}")
    print(f"Recall    : {recall_score(y_test, y_test_pred):.4f}")
    print(f"F1-Score  : {f1_score(y_test, y_test_pred):.4f}")
    print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_test_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_test_pred))

    # 5. Live Single-Sample Inference Test
    print("[5/5] Testing direct raw event inference...")
    sample_log = pd.DataFrame([{
        "network_packet_size": 4250,
        "login_attempts": 1,
        "session_duration": 12.0,
        "ip_reputation_score": 0.15,
        "failed_logins": 4,
        "unusual_time_access": 1,
        "protocol_type": "TCP",
        "encryption_used": "DES",
        "browser_type": "Chrome"
    }])
    prob = pipeline.predict_proba(sample_log)[0, 1]
    status = "🚨 INTRUSION BLOCKED" if prob >= decision_threshold else "🟩 NORMAL TRAFFIC"
    print(f"Sample Attack Probability: {prob * 100:.2f}% -> Outcome: {status}")

    # 6. Export Pipeline
    joblib.dump(pipeline, "intrusion_detection_pipeline.joblib")
    print("\nArtifact saved to 'intrusion_detection_pipeline.joblib'")


if __name__ == "__main__":
    main()
