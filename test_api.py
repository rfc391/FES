
import pytest
from flask import Flask

# Example: Test Flask API endpoints
def test_home_route():
    app = Flask(__name__)
    @app.route('/')
    def home():
        return "Welcome to FES!"
    client = app.test_client()
    response = client.get('/')
    assert response.status_code == 200
    assert b"Welcome to FES!" in response.data
