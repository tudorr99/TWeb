#!/usr/bin/env python3
"""
Server HTTP cu suport CGI pentru proiectul Rețele Neurale.
Rulează: python3 server.py
Apoi deschide: http://localhost:8000
"""

import http.server
import os

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.CGIHTTPRequestHandler
handler.cgi_directories = ["/cgi-bin"]

print(f"✅ Server pornit pe http://localhost:{PORT}")
print("   Apasă Ctrl+C pentru a opri.\n")

with http.server.HTTPServer(("", PORT), handler) as httpd:
    httpd.serve_forever()
