#!/bin/bash
set -e

echo "Running database migrations..."
python -m flask db upgrade

echo "Starting production server with gunicorn..."
exec gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 --bind 0.0.0.0:5000 run:app