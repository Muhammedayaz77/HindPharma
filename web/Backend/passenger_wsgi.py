"""Passenger entry point for running the FastAPI application on cPanel.

Passenger expects a WSGI callable. The a2wsgi adapter bridges the ASGI
FastAPI application to WSGI without changing the application's routes.
"""

from a2wsgi import ASGIMiddleware

from main import app

application = ASGIMiddleware(app)
