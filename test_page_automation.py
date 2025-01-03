import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import unittest
from src.trello_automation.page_automation import PageAutomation

class TestPageAutomation(unittest.TestCase):
    def setUp(self):
        self.page_automation = PageAutomation()

    def test_login_to_trello(self):
        # Replace with actual Trello credentials for testing
        self.page_automation.login_to_trello("test_email", "test_password")
        self.assertIn("Boards", self.page_automation.driver.title)

    def tearDown(self):
        self.page_automation.close()
