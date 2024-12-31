
from src.trello_automation.trello_manager import TrelloManager
from src.trello_automation.project_automator import ProjectAutomator
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_project(project_name, description=""):
    try:
        trello = TrelloManager()
        board = trello.create_project_board(project_name, description)
        
        # Create initial tasks
        trello.create_task(
            board,
            "Planning",
            "Project Setup",
            template="feature",
            priority="High"
        )
        
        # Start automation
        automator = ProjectAutomator()
        automator.automate_board(board.id)
        
        logger.info(f"Project '{project_name}' created successfully!")
        logger.info(f"Board URL: {board.url}")
        return board.id
        
    except Exception as e:
        logger.error(f"Error setting up project: {str(e)}")
        raise

if __name__ == "__main__":
    project_name = input("Enter project name: ")
    description = input("Enter project description (optional): ")
    board_id = setup_project(project_name, description)
    print(f"Board ID: {board_id} - Save this in your environment variables!")
