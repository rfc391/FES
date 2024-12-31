
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import pytest
from src.visualization import generate_visualization

@pytest.mark.skip(reason="Visualization tests require display")
def test_generate_visualization():
    path = generate_visualization()
    assert os.path.exists(path)
    os.remove(path)  # Clean up after test
