
import sys
import os
import numpy as np
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))
from feature_extraction import extract_features

def test_extract_features():
    data = np.random.randn(100, 10)
    components = extract_features(data, n_components=2)
    assert components.shape == (100, 2)
