
import schedule
import time
from src.trello_automation.trello_manager import TrelloManager
from src.notification_manager import NotificationManager

class Scheduler:
    def __init__(self):
        self.trello = TrelloManager()
        self.notifier = NotificationManager()

    def daily_progress_report(self):
        for board in self.trello.client.list_boards():
            progress = self.trello.fetch_progress(board)
            report = f"Daily Report for {board.name}: {progress}"
            self.notifier.send_email("Daily Progress Report", report, config.EMAIL_USER)
            self.notifier.send_webhook(report)

    def run(self):
        schedule.every().day.at("09:00").do(self.daily_progress_report)
        while True:
            schedule.run_pending()
            time.sleep(1)
