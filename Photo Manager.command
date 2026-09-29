#!/bin/bash
# Double-click to open the Photo Manager (arturmorin.page)
cd "$(dirname "$0")"
git pull --ff-only --quiet 2>/dev/null
python3 tools/admin/server.py
