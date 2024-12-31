import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

import unittest
from unittest.mock import patch
from src.trello_automation.scheduler import Scheduler

class TestScheduler(unittest.TestCase):
    def setUp(self):
        self.scheduler = Scheduler()

    @patch("schedule.run_pending")
    def test_scheduler_run(self, mock_run):
        with patch("time.sleep", return_value=None):
            self.scheduler.run()
        mock_run.assert_called()
