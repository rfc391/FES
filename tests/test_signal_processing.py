
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

import unittest
import numpy as np
from src.signal_processing import preprocess_signal, compute_spectral_density, fluctuation_features

class TestSignalProcessing(unittest.TestCase):
    def setUp(self):
        self.signal = np.random.randn(1000)  # Simulated signal
        self.sampling_rate = 1000

    def test_preprocess_signal(self):
        processed = preprocess_signal(self.signal, self.sampling_rate)
        self.assertAlmostEqual(np.mean(processed), 0, delta=1e-6)
        self.assertAlmostEqual(np.std(processed), 1, delta=1e-6)

    def test_compute_spectral_density(self):
        frequencies, psd = compute_spectral_density(self.signal, self.sampling_rate)
        self.assertTrue(len(frequencies) > 0)
        self.assertTrue(len(psd) > 0)

    def test_fluctuation_features(self):
        features = fluctuation_features(self.signal, self.sampling_rate)
        self.assertIn("dominant_frequency", features)
        self.assertIn("spectral_flatness", features)

if __name__ == "__main__":
    unittest.main()
