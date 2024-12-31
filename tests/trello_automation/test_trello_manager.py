
import unittest
from unittest.mock import MagicMock, patch
from src.trello_automation.trello_manager import TrelloManager
from datetime import datetime, timedelta

class TestTrelloManager(unittest.TestCase):
    def setUp(self):
        self.trello = TrelloManager()
        self.trello.client = MagicMock()
        self.mock_board = MagicMock()
        self.mock_list = MagicMock()
        self.mock_card = MagicMock()

    def test_create_project_board(self):
        self.trello.client.add_board.return_value = self.mock_board
        board = self.trello.create_project_board("Test Board")
        self.assertEqual(board, self.mock_board)

    def test_create_task(self):
        self.mock_board.list_lists.return_value = [self.mock_list]
        self.mock_list.name = "To Do"
        self.mock_list.add_card.return_value = self.mock_card
        
        task = self.trello.create_task(
            self.mock_board,
            "To Do",
            "Test Task",
            priority="High"
        )
        self.assertEqual(task, self.mock_card)

    def test_get_tasks_due_soon(self):
        due_date = datetime.now() + timedelta(days=1)
        self.mock_card.due_date = due_date
        self.mock_list.list_cards.return_value = [self.mock_card]
        self.mock_board.list_lists.return_value = [self.mock_list]
        
        tasks = self.trello.get_tasks_due_soon(self.mock_board)
        self.assertEqual(len(tasks), 1)

if __name__ == '__main__':
    unittest.main()
