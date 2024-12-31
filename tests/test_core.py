
import unittest
from src.core import *
from src.signal_processing import *
from src.feature_extraction import *

class TestCore(unittest.TestCase):
    def setUp(self):
        self.test_data = np.random.randn(1000, 10)
        
    def test_signal_processing(self):
        processed_data = process_signal(self.test_data)
        self.assertEqual(processed_data.shape[0], self.test_data.shape[0])
        
    def test_feature_extraction(self):
        features = extract_features(self.test_data)
        self.assertIsNotNone(features)
        
    def test_ml_integration(self):
        detector = AnomalyDetector()
        detector.train(self.test_data)
        predictions = detector.detect_anomalies(self.test_data)
        self.assertEqual(len(predictions), len(self.test_data))

if __name__ == '__main__':
    unittest.main()
