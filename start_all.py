
import subprocess
import logging
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def start_all_services():
    try:
        # Run code quality checks
        logger.info("Running code quality checks...")
        subprocess.run([sys.executable, "-m", "black", "src/", "tests/"], check=True)
        subprocess.run([sys.executable, "-m", "flake8", "src/", "tests/"], check=True)
        
        # Start automation services
        logger.info("Starting automation services...")
        subprocess.Popen([sys.executable, "start_automation.py"])
        subprocess.Popen([sys.executable, "orchestrate_with_notifications.py"])
        subprocess.Popen([sys.executable, "src/monitoring.py"])
        
        logger.info("All services started successfully")
    except Exception as e:
        logger.error(f"Error starting services: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_all_services()
