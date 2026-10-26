#!/usr/bin/env python3
"""
urgency_classifier_bot.py
Workflow automation bot that ingests text entries, extracts metadata entities,
classifies urgency using the scikit-learn model, and logs structured results.
"""

import json
import os
import re
import sys
from datetime import datetime
import joblib

MODEL_FILE = os.path.join(os.path.dirname(__file__), "urgency_model.joblib")
LOG_FILE = os.path.join(os.path.dirname(__file__), "classification_logs.jsonl")
INPUT_FILE = os.path.join(os.path.dirname(__file__), "incoming_tickets.txt")


def load_model():
    if not os.path.exists(MODEL_FILE):
        print(f"[!] Model file '{MODEL_FILE}' not found. Running training first...")
        from train_classifier import train
        train()
    return joblib.load(MODEL_FILE)


def extract_entities(text: str) -> dict:
    """Extracts contact emails, ticket/order IDs, monetary amounts, and keywords."""
    emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    order_ids = re.findall(r"(?:INV|ORD|TKT|REQ)-[0-9]+|#\d+", text, re.IGNORECASE)
    amounts = re.findall(r"\$\s*\d+(?:,\d{3})*(?:\.\d{2})?", text)
    
    # Urgent trigger keywords
    urgent_keywords = re.findall(
        r"\b(critical|down|emergency|urgent|failing|error|500|crash|refund|unauthorized|breach|loss)\b",
        text,
        re.IGNORECASE,
    )

    return {
        "emails": list(set(emails)),
        "order_ids": list(set(order_ids)),
        "monetary_amounts": list(set(amounts)),
        "detected_urgent_keywords": list(set(k.lower() for k in urgent_keywords)),
        "character_count": len(text),
    }


def classify_and_log(text: str, model) -> dict:
    text = text.strip()
    if not text:
        return {}

    # Predict classification and confidence score
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    classes = list(model.classes_)
    confidence = float(probabilities[classes.index(prediction)])

    # Extract information
    extracted = extract_entities(text)

    # Determine automated workflow action
    if prediction == "Urgent":
        action = "Escalated to P1 Incident Desk & On-Call Specialist"
    else:
        action = "Routed to Standard Support Queue"

    record = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "raw_text": text,
        "classification": prediction,
        "confidence_score": round(confidence, 4),
        "extracted_information": extracted,
        "action_taken": action,
    }

    # Append to classification_logs.jsonl
    with open(LOG_FILE, mode="a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")

    return record


def run_batch_simulation():
    model = load_model()
    print("=" * 65)
    print("AI AUTOMATION BOT: SCIKIT-LEARN URGENCY CLASSIFIER")
    print(f"Logging outputs to: {LOG_FILE}")
    print("=" * 65)

    sample_incoming = [
        "From: ops@fintech.io. CRITICAL ALERT: Database pool exhausted, 500 error on /checkout for order #ORD-44910!",
        "Hi there, my name is Linda (linda@gmail.com). Could you please send me documentation on export formats?",
        "URGENT: Customer charged twice $1,250 on invoice #INV-8812! Please refund immediately or our card will be blocked.",
        "Just wanted to say thanks for the great customer service last week, appreciate it!",
        "Help! Unauthorized login detected from Russia on admin account dev@corp.com, locked out!",
    ]

    for idx, text in enumerate(sample_incoming, 1):
        record = classify_and_log(text, model)
        print(f"\n[Entry #{idx}]")
        print(f"Input: {record['raw_text']}")
        print(f"→ Classification: [{record['classification']}] (Confidence: {record['confidence_score'] * 100:.1f}%)")
        print(f"→ Extracted Info: Emails={record['extracted_information']['emails']}, IDs={record['extracted_information']['order_ids']}, Keywords={record['extracted_information']['detected_urgent_keywords']}")
        print(f"→ Action: {record['action_taken']}")

    print("\n✓ Batch processed and logged successfully to classification_logs.jsonl.")


if __name__ == "__main__":
    run_batch_simulation()
