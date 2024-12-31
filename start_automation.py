
from src.trello_automation.project_automator import ProjectAutomator
from src.trello_automation.config import BOARD_ID
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def main():
    try:
        automator = ProjectAutomator()
        logging.info(f"Starting Trello automation for board: {BOARD_ID}")
        automator.automate_board(BOARD_ID)
    except Exception as e:
        logging.error(f"Error in Trello automation: {str(e)}")
        raise

if __name__ == "__main__":
    main()
