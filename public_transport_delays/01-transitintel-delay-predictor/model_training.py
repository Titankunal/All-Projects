import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb
import joblib

def train_and_evaluate_model(input_file, model_file):
    print(f"Loading data from {input_file} for model training...")
    df = pd.read_csv(input_file)
    
    # 2. Drop columns causing data leakage
    leakage_cols = ['actual_departure_delay_min', 'actual_arrival_delay_min']
    df = df.drop(columns=[col for col in leakage_cols if col in df.columns])
    
    # 3. Separate features and target
    X = df.drop(columns=['delayed'])
    y = df['delayed']
    
    # 4. Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Train set shape: {X_train.shape}")
    print(f"Test set shape: {X_test.shape}")
    
    # 5. Train XGBoost classifier
    print("\nTraining XGBoost classifier...")
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=3,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # 6. Evaluate the model
    print("\n--- Model Evaluation ---")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy Score: {accuracy:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # 7. Print top 10 most important features
    print("\n--- Top 10 Feature Importances ---")
    feature_importances = pd.DataFrame({
        'Feature': X.columns,
        'Importance': model.feature_importances_
    }).sort_values(by='Importance', ascending=False)
    
    print(feature_importances.head(10).to_string(index=False))
    
    # 8. Save the trained model
    joblib.dump(model, model_file)
    print(f"\nModel saved successfully to {model_file}")

if __name__ == "__main__":
    train_and_evaluate_model("processed_data.csv", "models/xgboost_model.pkl")
