
import threading
from src.monitoring import SystemMonitor
from src.automated_reports import AutomatedReporting
from src.trello_automation.project_automator import ProjectAutomator
from src.ml_integration import ModelManager
from src.visualization import DashboardManager
import logging

logging.basicConfig(level=logging.INFO)

def main():
    # Start system monitoring
    monitor = SystemMonitor()
    monitor.start()

    # Initialize ML models
    model_manager = ModelManager()

    # Start dashboard
    dashboard = DashboardManager()
    
    # Start automated reporting
    reporting = AutomatedReporting({
        'smtp_server': 'smtp.gmail.com',
        'port': 587
    })

    # Start Trello automation
    automator = ProjectAutomator()
    
    # Start all services in separate threads
    services = [
        threading.Thread(target=monitor.update_metrics),
        threading.Thread(target=dashboard.app.run_server, kwargs={'host': '0.0.0.0', 'port': 8050}),
        threading.Thread(target=reporting.schedule_reports),
        threading.Thread(target=automator.automate_board, args=('YOUR_BOARD_ID',))
    ]
    
    for service in services:
        service.daemon = True
        service.start()
    
    # Keep main thread alive
    try:
        while True:
            pass
    except KeyboardInterrupt:
        logging.info("Shutting down services...")

if __name__ == "__main__":
    main()
