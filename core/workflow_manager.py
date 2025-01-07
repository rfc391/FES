
from datetime import datetime
from trello_manager import TrelloManager

class WorkflowManager:
    def __init__(self):
        self.trello = TrelloManager()

    def move_due_cards(self, board):
        now = datetime.now()
        for lst in board.open_lists():
            for card in lst.list_cards():
                if card.due_date and card.due_date < now:
                    target_list = "Done" if lst.name == "In Progress" else "In Progress"
                    self.move_card(card, target_list)

    def move_card(self, card, target_list_name):
        board = card.board
        target_list = next((lst for lst in board.open_lists() if lst.name == target_list_name), None)
        if target_list:
            card.change_list(target_list.id)
            print(f"Moved card '{card.name}' to {target_list_name}")

    def archive_completed_cards(self, board, days_old=7):
        done_list = next((lst for lst in board.open_lists() if lst.name == "Done"), None)
        if done_list:
            cutoff_date = datetime.now() - timedelta(days=days_old)
            for card in done_list.list_cards():
                if card.get_last_activity() < cutoff_date:
                    card.set_closed(True)
                    print(f"Archived card '{card.name}'")
