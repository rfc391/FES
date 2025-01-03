import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import unittest
from unittest.mock import patch
from src.trello_automation.notification_manager import NotificationManager

class TestNotificationManager(unittest.TestCase):
    def setUp(self):
        self.notifier = NotificationManager()

    @patch("yagmail.SMTP.send")
    def test_send_email(self, mock_send):
        self.notifier.send_email("Test Subject", "Test Body", "test@example.com")
        mock_send.assert_called_once()

    @patch("requests.post")
    def test_send_webhook(self, mock_post):
        self.notifier.send_webhook("Test Message")
        mock_post.assert_called_once()
