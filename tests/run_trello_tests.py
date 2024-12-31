
import unittest
import sys
import os
from tests.trello_automation.test_trello_manager import TestTrelloManager
from tests.trello_automation.test_notification_manager import TestNotificationManager

def run_tests():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test cases
    suite.addTests(loader.loadTestsFromTestCase(TestTrelloManager))
    suite.addTests(loader.loadTestsFromTestCase(TestNotificationManager))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
