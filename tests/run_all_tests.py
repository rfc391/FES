
import unittest
import pytest
import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_all_tests():
    """Execute all test suites"""
    test_dir = Path(__file__).parent
    
    # Core functionality tests
    logger.info("Running core tests...")
    pytest.main([
        str(test_dir / "test_core.py"),
        str(test_dir / "test_api.py"),
        str(test_dir / "test_integration.py"),
        "-v"
    ])
    
    # Feature-specific tests
    logger.info("Running feature tests...")
    pytest.main([
        str(test_dir / "test_feature_extraction.py"),
        str(test_dir / "test_signal_processing.py"),
        str(test_dir / "test_visualization.py"),
        "-v"
    ])
    
    # Performance tests
    logger.info("Running performance tests...")
    pytest.main([
        str(test_dir / "test_performance.py"),
        "--benchmark-only",
        "-v"
    ])
    
    # Trello automation tests
    logger.info("Running Trello automation tests...")
    pytest.main([
        str(test_dir / "trello_automation"),
        "-v"
    ])

if __name__ == "__main__":
    run_all_tests()
