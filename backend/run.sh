#!/usr/bin/env bash
set -e

# run from inside the backend folder
source .venv/bin/activate
export PYTHONPATH=$(pwd)
uvicorn app:app --host 0.0.0.0 --port 8000 --reload