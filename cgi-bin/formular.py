#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import cgi
import os
import json
from datetime import datetime
import sys
sys.stdout.reconfigure(encoding='utf-8')

print("Content-Type: application/json; charset=UTF-8")
print()

form = cgi.FieldStorage()

nume = form.getvalue("nume", "").strip()
varsta = form.getvalue("varsta", "").strip()
email = form.getvalue("email", "").strip()

erori = []

if len(nume) < 3:
    erori.append("Numele este prea scurt.")

try:
    varsta_int = int(varsta)
    if varsta_int < 10 or varsta_int > 100:
        erori.append("Vârsta trebuie între 10 și 100.")
except:
    erori.append("Vârsta invalidă.")

if "@" not in email or "." not in email.split("@")[-1]:
    erori.append("Email invalid.")

response = {}

if erori:
    response["success"] = False
    response["errors"] = erori
else:
    data_entry = {
        "nume": nume,
        "varsta": varsta,
        "email": email,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    fisier_date = os.path.join(os.path.dirname(__file__), "..", "date_utilizatori.json")
    fisier_date = os.path.abspath(fisier_date)

    utilizatori = []
    if os.path.exists(fisier_date):
        try:
            with open(fisier_date, "r", encoding="utf-8") as f:
                utilizatori = json.load(f)
        except:
            utilizatori = []

    utilizatori.append(data_entry)

    with open(fisier_date, "w", encoding="utf-8") as f:
        json.dump(utilizatori, f, ensure_ascii=False, indent=2)

    response["success"] = True
    response["message"] = f"Bine ai venit, {nume}! Date salvate."

print(json.dumps(response))