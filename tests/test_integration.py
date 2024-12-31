
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import pytest
from src.security import SecurityManager
from src.ml_integration import AnomalyDetector
from src.visualization import DashboardManager

def test_security_integration():
    security = SecurityManager()
    token = security.create_token("test_user")
    assert security.verify_token(token) is not None
    assert security.check_rate_limit("test_user") is True

def test_anomaly_detection():
    detector = AnomalyDetector()
    test_data = [[1], [2], [3], [100], [4], [5]]
    detector.train(test_data)
    predictions = detector.detect_anomalies(test_data)
    assert len(predictions) == len(test_data)

@pytest.mark.skip(reason="GUI tests require display")
def test_dashboard():
    dashboard = DashboardManager()
    assert dashboard.app is not None
    assert hasattr(dashboard, 'setup_callbacks')
