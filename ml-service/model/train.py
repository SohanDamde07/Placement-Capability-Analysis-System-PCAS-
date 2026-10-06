"""
PCAS Model Training Script
Trains the top-performing placement classification model (Logistic Regression with StandardScaler)
using the actual placement dataset (placementdata.csv).
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, f1_score

DATA_PATH = os.path.join(os.path.dirname(__file__), 'placementdata.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'prs_model.pkl')
META_PATH  = os.path.join(os.path.dirname(__file__), 'model_meta.pkl')

def train_and_save():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset Shape: {df.shape}")

    # Drop student id if present
    if 'StudentID' in df.columns:
        df = df.drop(columns=['StudentID'])

    # Map binary categoricals
    if df['PlacementTraining'].dtype == object:
        df['PlacementTraining'] = df['PlacementTraining'].map({'Yes': 1, 'No': 0})
    if df['ExtracurricularActivities'].dtype == object:
        df['ExtracurricularActivities'] = df['ExtracurricularActivities'].map({'Yes': 1, 'No': 0})
    if df['PlacementStatus'].dtype == object:
        df['PlacementStatus'] = df['PlacementStatus'].map({'Placed': 1, 'NotPlaced': 0})

    feature_cols = [c for c in df.columns if c != 'PlacementStatus']
    X = df[feature_cols]
    y = df['PlacementStatus']

    print(f"Training features ({len(feature_cols)}): {feature_cols}")

    # Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Build Pipeline: StandardScaler + LogisticRegression
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LogisticRegression(max_iter=1000, random_state=42))
    ])

    # 5-Fold Cross Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring='accuracy')
    print(f"5-Fold CV Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")

    # Fit on training partition
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)

    print(f"\n--- Test Set Metrics ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=['Not Placed', 'Placed']))

    # Feature importance (coefficients)
    clf = pipeline.named_steps['model']
    feature_importances = dict(zip(feature_cols, clf.coef_[0].tolist()))

    # Calculate dataset feature baselines/averages for insight comparison
    feature_means = X.mean().to_dict()

    # Save Pipeline Model
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model pipeline saved to: {MODEL_PATH}")

    # Save Metadata
    meta = {
        'model_name': 'StandardScaler + LogisticRegression',
        'features': feature_cols,
        'feature_means': feature_means,
        'coefficients': feature_importances,
        'accuracy': float(acc),
        'cv_mean_accuracy': float(cv_scores.mean()),
        'trained_at': pd.Timestamp.now().isoformat()
    }
    joblib.dump(meta, META_PATH)
    print(f"Model metadata saved to: {META_PATH}")

    return pipeline, meta

if __name__ == '__main__':
    train_and_save()
