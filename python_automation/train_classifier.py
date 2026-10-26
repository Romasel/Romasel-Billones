#!/usr/bin/env python3
"""
train_classifier.py
Trains a text classification model using scikit-learn to categorize incoming text entries
into 'Urgent' and 'Not Urgent'.
"""

import csv
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

DATA_FILE = os.path.join(os.path.dirname(__file__), "training_data.csv")
MODEL_FILE = os.path.join(os.path.dirname(__file__), "urgency_model.joblib")


def load_dataset(filepath):
    texts = []
    labels = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = row["text"].strip()
            label = row["label"].strip()
            if text and label:
                texts.append(text)
                labels.append(label)
    return texts, labels


def train():
    print(f"[1/4] Loading training data from: {DATA_FILE}")
    texts, labels = load_dataset(DATA_FILE)
    print(f"      Total labeled samples: {len(texts)}")
    print(f"      - Urgent samples: {labels.count('Urgent')}")
    print(f"      - Not Urgent samples: {labels.count('Not Urgent')}")

    # Split dataset into training and validation sets
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.25, random_state=42, stratify=labels
    )

    print(f"[2/4] Building TF-IDF + Multinomial Naive Bayes Pipeline...")
    from sklearn.naive_bayes import MultinomialNB
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words="english",
                lowercase=True,
                sublinear_tf=True,
                min_df=1,
            ),
        ),
        (
            "classifier",
            MultinomialNB(alpha=0.3),
        ),
    ])

    print("[3/4] Fitting model on training data...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    predictions = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print("\n--- Model Evaluation ---")
    print(f"Validation Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, predictions))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    # Save artifact
    print(f"\n[4/4] Saving model artifact to: {MODEL_FILE}")
    joblib.dump(pipeline, MODEL_FILE)
    print("✓ Model training completed successfully!\n")

    # Quick test demonstration
    test_samples = [
        "Server CPU at 99%, payment gateway failing for all customers",
        "Could you please send me a link to your user onboarding webinar?",
    ]
    print("--- Quick Inference Test ---")
    for sample in test_samples:
        pred = pipeline.predict([sample])[0]
        probs = pipeline.predict_proba([sample])[0]
        classes = pipeline.classes_
        confidence = probs[list(classes).index(pred)] * 100
        print(f"Input: \"{sample}\"")
        print(f"→ Classification: [{pred}] (Confidence: {confidence:.1f}%)\n")


if __name__ == "__main__":
    train()
