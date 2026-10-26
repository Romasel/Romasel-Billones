#!/usr/bin/env python3
"""
train_classifier.py - Train an Urgent vs Not Urgent text classifier using scikit-learn.
"""

import os
import csv
import pickle

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    from sklearn.metrics import classification_report, accuracy_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


# Default example training data if CSV is not found
FALLBACK_DATA = [
    ("System down in Europe region, all checkout requests returning 500 error", "Urgent"),
    ("CRITICAL: database connection pool exhausted, customers cannot login", "Urgent"),
    ("Security alert: unauthorized access attempt detected on port 443", "Urgent"),
    ("Immediate action required: payment gateway failed for order #9921", "Urgent"),
    ("Help! Double charge on my corporate card, please reverse immediately", "Urgent"),
    ("Emergency: production cluster memory at 98% and swapping", "Urgent"),
    ("Our warehouse shipments are halted due to API timeout, urgent fix needed", "Urgent"),
    ("Urgent: client presentation in 30 minutes and exports are broken", "Urgent"),
    ("Data loss warning: replica lag exceeded 45 minutes", "Urgent"),
    ("ORDER #88412 cancelled by customer, please stop shipment immediately", "Urgent"),
    ("General question about your annual pricing discount for 20 seats", "Not Urgent"),
    ("Thank you for the quick resolution yesterday, everything is working great", "Not Urgent"),
    ("Where can I find the API documentation for webhook signatures?", "Not Urgent"),
    ("Feature request: would love a dark mode theme for the reporting dashboard", "Not Urgent"),
    ("Updating our company billing contact address for next month invoice", "Not Urgent"),
    ("Hi team, just checking in on the roadmap for Q4 integrations", "Not Urgent"),
    ("Feedback: the new workflow designer is much smoother, great work!", "Not Urgent"),
    ("Can you please send a copy of our receipt from March 2026?", "Not Urgent"),
    ("Inquiring if you support SAML single sign-on for Okta", "Not Urgent"),
    ("Just testing the contact form notification, please ignore", "Not Urgent"),
]


def load_dataset(csv_path="training_data.csv"):
    if not os.path.exists(csv_path):
        # Look in current script dir
        script_dir = os.path.dirname(os.path.abspath(__file__))
        alt_path = os.path.join(script_dir, "training_data.csv")
        if os.path.exists(alt_path):
            csv_path = alt_path
        else:
            print(f"[Notice] {csv_path} not found. Using built-in training samples.")
            texts = [item[0] for item in FALLBACK_DATA]
            labels = [item[1] for item in FALLBACK_DATA]
            return texts, labels

    texts = []
    labels = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        for row in reader:
            if len(row) >= 2:
                texts.append(row[0].strip())
                labels.append(row[1].strip())
    return texts, labels


def train_and_save_model(model_filename="urgent_classifier.pkl"):
    if not SKLEARN_AVAILABLE:
        print("[Error] scikit-learn is not installed in the current Python environment.")
        print("Please install via: pip install scikit-learn")
        return None

    texts, labels = load_dataset()
    print(f"Loaded {len(texts)} training records across categories: {set(labels)}")

    # Create TF-IDF + Multinomial Naive Bayes text classification pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), lowercase=True, stop_words='english')),
        ('classifier', MultinomialNB(alpha=0.1)),
    ])

    print("Fitting scikit-learn text classification pipeline...")
    pipeline.fit(texts, labels)

    # Evaluate on training data
    preds = pipeline.predict(texts)
    acc = accuracy_score(labels, preds)
    print(f"Training accuracy: {acc * 100:.1f}%\n")
    print("Classification Report:")
    print(classification_report(labels, preds))

    # Save trained model to disk
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(script_dir, model_filename)
    with open(target_path, "wb") as f:
        pickle.dump(pipeline, f)

    print(f"Model successfully saved to: {target_path}")

    # Demo quick predictions
    print("\n--- Test Verification Inferences ---")
    demo_inputs = [
        "CRITICAL: payment service timeout, customers blocked from ordering!",
        "Could you please share your updated privacy policy PDF?",
        "URGENT: server crash on checkout node #4",
        "Hi, wishing everyone a nice weekend."
    ]

    for sample in demo_inputs:
        pred_label = pipeline.predict([sample])[0]
        probs = pipeline.predict_proba([sample])[0]
        classes = list(pipeline.classes_)
        conf = max(probs) * 100
        print(f"Text: '{sample}'")
        print(f"  -> Prediction: [{pred_label}] (Confidence: {conf:.1f}%)\n")

    return pipeline


if __name__ == "__main__":
    train_and_save_model()
