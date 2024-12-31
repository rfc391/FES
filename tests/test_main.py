"""
Tests for main FES platform functionality
"""

import unittest
import json
from src.main import process_signal
from src.utils import validate_signal
from src.config import load_config

class TestFESPlatform(unittest.TestCase):
    def setUp(self):
        self.config = load_config()
        self.sample_signal = {
            "timestamp": "2024-12-31T12:00:00Z",
            "source": "network_sensor_001",
            "data": [1.0, 2.0, 3.0, 4.0, 5.0]
        }

    def test_signal_validation(self):
        """Test signal validation functionality"""
        self.assertTrue(validate_signal(self.sample_signal))
        
        invalid_signal = {
            "timestamp": "2024-12-31T12:00:00Z",
            # Missing required fields
        }
        self.assertFalse(validate_signal(invalid_signal))

    def test_signal_processing(self):
        """Test basic signal processing functionality"""
        result = process_signal(self.sample_signal)
        self.assertTrue(result["processed"])
        self.assertIn("threat_level", result)
        self.assertIn("anomalies", result)

if __name__ == '__main__':
    unittest.main()
