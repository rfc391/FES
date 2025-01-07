"""
Automated README updater that runs periodically to keep project documentation current
"""

import schedule
import time
import logging
from pathlib import Path
import sys
from datetime import datetime

# Add parent directory to path to import readme_generator
sys.path.append(str(Path(__file__).parent.parent))
from readme_generator import update_project_readme

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('readme_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def scheduled_readme_update() -> None:
    """Run the README update task"""
    try:
        logger.info("Starting scheduled README update")
        success = update_project_readme()
        if success:
            logger.info("Scheduled README update completed successfully")
        else:
            logger.error("Scheduled README update failed")
    except Exception as e:
        logger.error(f"Error in scheduled README update: {str(e)}")

def main():
    """Main function to start the README automation"""
    logger.info("Starting README automation service")
    
    # Schedule the update to run every 6 hours
    schedule.every(6).hours.do(scheduled_readme_update)
    
    # Also run immediately on startup
    scheduled_readme_update()
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute for pending tasks
    except KeyboardInterrupt:
        logger.info("README automation service stopped by user")
    except Exception as e:
        logger.error(f"README automation service error: {str(e)}")
        raise

if __name__ == "__main__":
    main()
