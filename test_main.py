
import pytest
from src.main import app
from src.config import load_config

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.get_json() == {'status': 'healthy'}

def test_analyze_data_valid(client):
    payload = {'signal': [1.0, 2.0, 3.0, 4.0]}
    response = client.post('/api/analyze', json=payload)
    assert response.status_code == 200
    assert 'predictions' in response.get_json()

def test_analyze_data_invalid(client):
    payload = {'invalid_key': [1.0, 2.0, 3.0, 4.0]}
    response = client.post('/api/analyze', json=payload)
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_config_loading():
    config = load_config()
    assert isinstance(config, dict)
    assert 'sampling_rate' in config
