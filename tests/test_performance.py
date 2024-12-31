
import time
import pytest
import numpy as np
from src.ml_integration import AnomalyDetector
from src.feature_extraction import extract_features

def measure_execution_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        return result, end_time - start_time
    return wrapper

@pytest.mark.benchmark
class TestPerformance:
    def test_anomaly_detection_speed(self):
        detector = AnomalyDetector()
        data = np.random.randn(1000, 10)
        
        @measure_execution_time
        def train_and_predict():
            detector.train(data)
            return detector.detect_anomalies(data)
            
        predictions, execution_time = train_and_predict()
        assert execution_time < 1.0  # Should complete within 1 second
        
    def test_feature_extraction_performance(self):
        data = np.random.randn(1000, 50)
        
        @measure_execution_time
        def extract_and_transform():
            return extract_features(data, n_components=10)
            
        features, execution_time = extract_and_transform()
        assert execution_time < 0.5  # Should complete within 0.5 seconds
