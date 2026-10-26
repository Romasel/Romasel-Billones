# Python AI Automation Suite

This directory contains production-ready Python automation bots integrating **scikit-learn machine learning text classification** and **file-monitoring rule-based event handling**.

---

## 1. Machine Learning Text Classification Bot (Scikit-Learn)

Classifies incoming customer and telemetry messages into **`Urgent`** or **`Not Urgent`**, extracts key entities (emails, ticket/order IDs, monetary amounts, urgency keywords), and logs structured records to `classification_logs.jsonl`.

### Files:
- `training_data.csv`: Curated labeled dataset of customer inquiries and system telemetry.
- `train_classifier.py`: Trains a `TfidfVectorizer` + `MultinomialNB` pipeline and saves `urgency_model.joblib`.
- `urgency_classifier_bot.py`: Production bot that loads the model, extracts entities, predicts urgency with confidence, and logs entries.
- `classification_logs.jsonl`: JSON Lines log file containing timestamped outputs.

### Setup & Prerequisites:
Ensure Python 3 is installed with scikit-learn and joblib:
```bash
pip install scikit-learn joblib numpy
```

### Step 1: Train the Classifier Model
Run the training script:
```bash
python3 python_automation/train_classifier.py
```
This loads `training_data.csv`, evaluates validation accuracy and confusion matrix, and exports the serialized pipeline artifact `urgency_model.joblib`.

### Step 2: Run the Classification Bot
Execute the bot on incoming text entries:
```bash
python3 python_automation/urgency_classifier_bot.py
```
The bot processes incoming tickets, outputs formatted predictions to the terminal, and logs structured JSON entries to `classification_logs.jsonl`.

Example logged record in `classification_logs.jsonl`:
```json
{
  "timestamp": "2026-10-26T03:03:43.120Z",
  "raw_text": "CRITICAL ALERT: Database pool exhausted, 500 error on /checkout for order #ORD-44910!",
  "classification": "Urgent",
  "confidence_score": 0.829,
  "extracted_information": {
    "emails": ["ops@fintech.io"],
    "order_ids": ["ORD-44910"],
    "monetary_amounts": [],
    "detected_urgent_keywords": ["error", "500", "critical"],
    "character_count": 92
  },
  "action_taken": "Escalated to P1 Incident Desk & On-Call Specialist"
}
```

---

## 2. Rule-Based Order Monitoring Bot

A robust file watcher bot that continuously monitors a text file (`incoming_stream.txt`) for the keyword **`ORDER`**.
- When `ORDER` is detected on a line, it extracts the **immediately following line** (the order details) and appends it to `processed_orders.txt` with a timestamp.
- If the keyword is not found, it waits **5 seconds** before checking again.

### Files:
- `order_monitor_bot.py`: The file monitoring bot.
- `incoming_stream.txt`: The text file being watched.
- `processed_orders.txt`: The output file where extracted orders are logged.

### How to Run:

#### Normal Watch Mode:
Start the monitoring bot:
```bash
python3 python_automation/order_monitor_bot.py
```
The bot will start watching `incoming_stream.txt`.

#### Simulating Orders:
In another terminal (or text editor), append an order to `incoming_stream.txt`:
```bash
echo "ORDER" >> python_automation/incoming_stream.txt
echo "SKU-9921: Enterprise Cluster License - $2,500.00" >> python_automation/incoming_stream.txt
```
Within 5 seconds, the bot will detect `ORDER`, extract the following line, and write it to `processed_orders.txt`:
```
[2026-10-26 03:04:10] SKU-9921: Enterprise Cluster License - $2,500.00
```

#### Demo Mode (Single Command Test):
To test immediately with automatic sample data:
```bash
python3 python_automation/order_monitor_bot.py --demo
```
Press `Ctrl+C` to stop the bot at any time.
