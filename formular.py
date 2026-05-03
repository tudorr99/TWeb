#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import os
import datetime
from urllib.parse import parse_qs

# ── Always output JSON ──────────────────────────────────────────────────────
sys.stdout.write("Content-Type: application/json; charset=utf-8\r\n")
sys.stdout.write("\r\n")
sys.stdout.flush()

DATA_FILE = os.path.join("/home/claude/project", "users_data.json")

def respond(status, message):
    print(json.dumps({"status": status, "message": message}, ensure_ascii=False))
    sys.exit(0)

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return []
    return []

def save_data(records):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

try:
    method = os.environ.get("REQUEST_METHOD", "GET").upper()

    if method == "POST":
        content_type = os.environ.get("CONTENT_TYPE", "")
        length = int(os.environ.get("CONTENT_LENGTH", 0) or 0)
        raw = sys.stdin.buffer.read(length).decode("utf-8")

        if "application/json" in content_type:
            data = json.loads(raw)
            nume   = str(data.get("nume",   "")).strip()
            varsta = str(data.get("varsta", "")).strip()
            email  = str(data.get("email",  "")).strip()
        else:
            # application/x-www-form-urlencoded  OR  multipart (flatten)
            params = parse_qs(raw, keep_blank_values=True)
            nume   = params.get("nume",   [""])[0].strip()
            varsta = params.get("varsta", [""])[0].strip()
            email  = params.get("email",  [""])[0].strip()
    else:
        respond("error", "Metoda HTTP neacceptată.")

    # ── Validation ────────────────────────────────────────────────────────
    errors = []

    if len(nume) < 3:
        errors.append("Numele este prea scurt (minim 3 caractere).")

    try:
        v = int(varsta)
        if v < 10 or v > 100:
            errors.append("Vârsta invalidă (10–100).")
    except (ValueError, TypeError):
        errors.append("Vârsta trebuie să fie un număr.")

    if "@" not in email or "." not in email.split("@")[-1]:
        errors.append("Adresa de email este invalidă.")

    if errors:
        respond("error", "<br>".join(errors))

    # ── Save ──────────────────────────────────────────────────────────────
    record = {
        "nume":      nume,
        "varsta":    int(varsta),
        "email":     email,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    records = load_data()
    records.append(record)
    save_data(records)

    respond("ok", f"Bun venit, {nume}! Datele au fost salvate cu succes.")

except Exception as e:
    respond("error", f"Eroare internă: {str(e)}")
