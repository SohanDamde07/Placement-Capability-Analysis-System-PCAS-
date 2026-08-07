"""
PCAS PRS Model Training Script
Generates a simulated dataset and trains a Decision Tree model
to predict Placement Readiness Score (PRS).
"""

import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def generate_dataset(n_samples=500, random_state=42):
    """Generate a realistic simulated dataset for PRS prediction."""
    np.random.seed(random_state)

    # Feature distributions (realistic placement readiness factors)
    num_skills      = np.random.randint(1, 20, n_samples)            # technical skills count
    project_count   = np.random.randint(0, 10, n_samples)            # number of projects
    project_level   = np.random.randint(1, 4, n_samples)             # 1=Beginner, 2=Intermediate, 3=Advanced
    internship_count= np.random.randint(0, 5, n_samples)             # internships done
    comm_score      = np.random.randint(1, 11, n_samples)            # communication score (1–10)
    cgpa            = np.round(np.random.uniform(5.0, 10.0, n_samples), 2)  # bonus CGPA feature

    # Build PRS formula (0–100) with noise
    prs = (
        num_skills * 1.8 +
        project_count * 3.5 +
        project_level * 7.0 +
        internship_count * 8.0 +
        comm_score * 3.5 +
        (cgpa - 5.0) * 4.0
    )
    
    # Normalize to 0–100 range
    prs_min, prs_max = prs.min(), prs.max()
    prs = (prs - prs_min) / (prs_max - prs_min) * 100
    
    # Add Gaussian noise
    noise = np.random.normal(0, 4, n_samples)
    prs = np.clip(prs + noise, 0, 100).round(2)

    df = pd.DataFrame({
        'num_skills':       num_skills,
        'project_count':    project_count,
        'project_level':    project_level,
        'internship_count': internship_count,
        'comm_score':       comm_score,
        'cgpa':             cgpa,
        'prs_score':        prs
    })

    return df


def classify_prs(score):
    """Classify PRS score into readiness category."""
    if score < 40:
        return "Beginner"
    elif score < 70:
        return "Intermediate"
    else:
        return "Placement Ready"


def train_and_save():
    print("Generating training dataset...")
    df = generate_dataset()
    print(f"Dataset shape: {df.shape}")
    print(df.describe())

    features = ['num_skills', 'project_count', 'project_level', 'internship_count', 'comm_score', 'cgpa']
    X = df[features]
    y = df['prs_score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Build pipeline: scale + decision tree
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', DecisionTreeRegressor(
            max_depth=8,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42
        ))
    ])

    print("\nTraining Decision Tree model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2  = r2_score(y_test, y_pred)
    print(f"MAE: {mae:.2f}")
    print(f"R²:  {r2:.4f}")

    # Save model
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), 'prs_model.pkl')
    joblib.dump(pipeline, model_path)
    print(f"\nModel saved to: {model_path}")

    # Save feature list alongside model
    meta_path = os.path.join(os.path.dirname(__file__), 'model_meta.pkl')
    joblib.dump({'features': features}, meta_path)
    print(f"Metadata saved to: {meta_path}")

    return pipeline


if __name__ == '__main__':
    train_and_save()
