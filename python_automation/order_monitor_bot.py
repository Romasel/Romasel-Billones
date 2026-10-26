#!/usr/bin/env python3
"""
order_monitor_bot.py
A rule-based monitoring bot that watches a text file for the keyword 'ORDER'.
When detected, it extracts the following line, logs it to 'processed_orders.txt',
and if not found, waits 5 seconds before checking again.
"""

import os
import sys
import time
from datetime import datetime

# Default file paths in the same directory as this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MONITOR_FILE = os.path.join(BASE_DIR, "incoming_stream.txt")
OUTPUT_FILE = os.path.join(BASE_DIR, "processed_orders.txt")
TARGET_KEYWORD = "ORDER"
CHECK_INTERVAL_SECONDS = 5


def ensure_input_file_exists(filepath: str):
    """Creates the input file with initial comments if it doesn't exist."""
    if not os.path.exists(filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("# Incoming Event Stream\n")
            f.write("# Type 'ORDER' on one line, and the order details on the next line.\n\n")
        print(f"Created initial watch file at: {filepath}")


def process_orders(filepath: str, output_path: str, keyword: str, processed_line_indices: set) -> int:
    """
    Reads the file, searches for keyword, extracts the following line,
    and appends to the processed output file.
    Returns the count of newly processed orders in this pass.
    """
    if not os.path.exists(filepath):
        return 0

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    newly_processed = 0
    total_lines = len(lines)

    for i in range(total_lines):
        line_clean = lines[i].strip()

        # Check if line contains target keyword and hasn't been processed yet
        if keyword.upper() in line_clean.upper() and i not in processed_line_indices:
            # Mark this keyword line as checked
            processed_line_indices.add(i)

            # Check if there is a following line to extract
            if i + 1 < total_lines:
                extracted_line = lines[i + 1].strip()
                processed_line_indices.add(i + 1)

                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                log_entry = f"[{timestamp}] {extracted_line}\n"

                with open(output_path, "a", encoding="utf-8") as out:
                    out.write(log_entry)

                print(f"  [+] DETECTED '{keyword}' on line {i + 1}!")
                print(f"      Extracted Next Line: \"{extracted_line}\"")
                print(f"      Logged to: {os.path.basename(output_path)}")
                newly_processed += 1
            else:
                print(f"  [!] Found '{keyword}' on line {i + 1}, but waiting for the following line to be written...")

    return newly_processed


def monitor(filepath: str = MONITOR_FILE, output_path: str = OUTPUT_FILE, max_iterations: int = None):
    print("=" * 65)
    print("RULE-BASED ORDER MONITOR BOT")
    print(f"Monitoring Target File: {filepath}")
    print(f"Output Destination:    {output_path}")
    print(f"Target Keyword:        '{TARGET_KEYWORD}'")
    print(f"Check Interval:        {CHECK_INTERVAL_SECONDS} seconds")
    print("Press Ctrl+C to stop the bot at any time.")
    print("=" * 65)

    ensure_input_file_exists(filepath)
    processed_line_indices = set()
    iteration = 0

    try:
        while True:
            iteration += 1
            now = datetime.now().strftime("%H:%M:%S")

            found_count = process_orders(filepath, output_path, TARGET_KEYWORD, processed_line_indices)

            if found_count == 0:
                print(f"[{now}] Check #{iteration}: Keyword '{TARGET_KEYWORD}' not found. Waiting {CHECK_INTERVAL_SECONDS}s...")

            if max_iterations and iteration >= max_iterations:
                print(f"\nCompleted {max_iterations} iterations. Exiting.")
                break

            time.sleep(CHECK_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n\n[!] Bot stopped by user. Goodbye!")


if __name__ == "__main__":
    # If passed '--test' or '--demo', seed sample data and run 2 checks
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        ensure_input_file_exists(MONITOR_FILE)
        with open(MONITOR_FILE, "a", encoding="utf-8") as f:
            f.write("System heartbeat ping\n")
            f.write("ORDER\n")
            f.write("Item: Cloud Server Cluster Pro (SKU: CLOUD-889) - Qty: 2 - Total: $1,450.00\n")
            f.write("User navigated to billing page\n")
        print("[Demo Mode] Appended simulated 'ORDER' and order details to watch file.")
        monitor(max_iterations=2)
    else:
        monitor()
