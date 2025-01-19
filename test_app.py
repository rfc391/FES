
import pytest
from flask import Flask
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# Test the home route
def test_home(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Training and Simulation System is fully functional.' in response.data

# Test adding a scenario
def test_add_scenario(client):
    data = {"title": "Tactical Infiltration", "description": "Simulate a stealth mission."}
    response = client.post('/add_scenario', json=data)
    assert response.status_code == 200
    assert "Training scenario added successfully." in response.get_json()["message"]

# Test retrieving scenarios
def test_get_scenarios(client):
    response = client.get('/get_scenarios')
    assert response.status_code == 200
    scenarios = response.get_json()
    assert isinstance(scenarios, list)
    assert len(scenarios) > 0

# Test submitting results
def test_submit_results(client):
    # Add a scenario first
    data = {"title": "Obstacle Course", "description": "Navigate through a challenging course."}
    scenario_response = client.post('/add_scenario', json=data)
    scenario_id = scenario_response.get_json()["scenario"]["id"]

    # Submit results for the scenario
    result_data = {"scenario_id": scenario_id, "score": 85}
    result_response = client.post('/submit_results', json=result_data)
    assert result_response.status_code == 200
    assert "Training results submitted successfully." in result_response.get_json()["message"]

# Test analytics endpoint
def test_analytics(client):
    response = client.get('/analytics')
    assert response.status_code == 200
    analytics_data = response.get_json()
    assert "total_sessions" in analytics_data
    assert "average_score" in analytics_data
