
from trello import TrelloClient
from datetime import datetime, timedelta
import config

class TrelloManager:
    def __init__(self):
        self.client = TrelloClient(
            api_key=config.TRELLO_API_KEY,
            api_secret=config.TRELLO_API_TOKEN
        )

    def create_project_board(self, name, description=""):
        board = self.client.add_board(name, desc=description)
        self.setup_lists(board)
        self.setup_labels(board)
        return board

    def setup_lists(self, board):
        existing_lists = [lst.name for lst in board.list_lists()]
        for list_name in config.STANDARD_LISTS:
            if list_name not in existing_lists:
                board.add_list(list_name)

    def setup_labels(self, board):
        for priority, color in config.PRIORITY_LABELS.items():
            board.add_label(priority, color)

    def create_task(self, board, list_name, title, template=None, description="", due_date=None,
                   priority=None, members=None, checklist_items=None):
        if template:
            description, checklist_items = self.get_template(template)
        lists = {lst.name: lst for lst in board.list_lists()}
        if list_name not in lists:
            raise ValueError(f"List '{list_name}' not found")

        card = lists[list_name].add_card(title, description)
        
        if due_date:
            card.set_due(due_date)
        else:
            default_due = datetime.now() + timedelta(days=config.DEFAULT_TASK_DUE_DAYS)
            card.set_due(default_due)

        if priority and priority in config.PRIORITY_LABELS:
            labels = [label for label in board.get_labels() if label.name == priority]
            if labels:
                card.add_label(labels[0])

        if members:
            for member in members:
                card.add_member(member)
                
        if checklist_items:
            checklist = card.add_checklist("Task Checklist")
            for item in checklist_items:
                checklist.add_checklist_item(item)

        return card

    def get_tasks_due_soon(self, board, days=None):
        if days is None:
            days = config.REMINDER_DAYS_BEFORE
        due_date_limit = datetime.now() + timedelta(days=days)
        return [card for lst in board.list_lists() 
                for card in lst.list_cards() 
                if card.due_date and card.due_date <= due_date_limit]

    def get_project_metrics(self, board):
        metrics = {
            'total_tasks': 0,
            'completed_tasks': 0,
            'tasks_by_list': {},
            'tasks_by_priority': {},
            'overdue_tasks': 0
        }

        for lst in board.list_lists():
            cards = lst.list_cards()
            metrics['tasks_by_list'][lst.name] = len(cards)
            metrics['total_tasks'] += len(cards)

            if lst.name == 'Done':
                metrics['completed_tasks'] += len(cards)

            for card in cards:
                for label in card.labels:
                    if label.name in config.PRIORITY_LABELS:
                        metrics['tasks_by_priority'][label.name] = \
                            metrics['tasks_by_priority'].get(label.name, 0) + 1
                
                if card.due_date and card.due_date < datetime.now() and not card.is_due_complete:
                    metrics['overdue_tasks'] += 1

        return metrics
