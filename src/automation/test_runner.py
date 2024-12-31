"""
Automated test runner for FES platform
"""

import unittest
import sys
import os
import logging
from datetime import datetime
from typing import Dict, List, Any
import json
from pathlib import Path

class TestRunner:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.test_results = {}
        
    def run_tests(self) -> Dict[str, Any]:
        """
        Run all tests and collect results
        
        Returns:
            Dictionary containing test results and metrics
        """
        start_time = datetime.now()
        
        # Discover and run tests
        loader = unittest.TestLoader()
        tests = loader.discover(str(self.project_root / 'tests'))
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(tests)
        
        # Collect metrics
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        self.test_results = {
            'timestamp': start_time.isoformat(),
            'duration': duration,
            'total_tests': result.testsRun,
            'failures': len(result.failures),
            'errors': len(result.errors),
            'skipped': len(result.skipped),
            'success_rate': (result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun if result.testsRun > 0 else 0
        }
        
        return self.test_results
    
    def export_results(self, output_path: str) -> None:
        """
        Export test results to JSON file
        """
        with open(output_path, 'w') as f:
            json.dump(self.test_results, f, indent=2)
            
def main():
    """
    Main entry point for test runner
    """
    logging.basicConfig(level=logging.INFO)
    
    try:
        runner = TestRunner(os.getcwd())
        results = runner.run_tests()
        
        # Export results
        results_dir = Path('test_results')
        results_dir.mkdir(exist_ok=True)
        runner.export_results(str(results_dir / f'results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'))
        
        # Exit with appropriate code
        sys.exit(0 if results['failures'] == 0 and results['errors'] == 0 else 1)
        
    except Exception as e:
        logging.error(f"Test runner failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
