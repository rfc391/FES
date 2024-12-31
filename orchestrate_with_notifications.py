
import subprocess
import docker
from trello import TrelloClient
import requests
import time
import schedule
import logging
import yagmail

# Configure logging
logging.basicConfig(
    filename="automation.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Trello Configuration
TRELLO_API_KEY = "Wfsv38oU"
TRELLO_API_TOKEN = "ATATT3xFfGF0qfMo-CwJbEBf7cjX1ScabIsu6-lnkmb2gyTQNstL2Mv5xqVHRMP12D9XakT2RBST-OcvTygtfLWWtIyCXLXCnzald7sY1JTQBrFxSBhRGjiGMkA2qB1f7ZOVaGzHNZ3Vd2aAI4OUINhQD4KitRShQuw0tChnG1x2MAnpo6u0XWc=D737D3BD"
TRELLO_BOARD_ID = "Wfsv38oU"

# Cloudflare Configuration
CLOUDFLARE_API_TOKEN = "7222b2d05ed1d070145c26acc3d74ff32e176"
CLOUDFLARE_ZONE_ID = "2bf985f6bc3412ca90de78c00002ecaf"
CLOUDFLARE_HEADERS = {
    "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
    "Content-Type": "application/json",
}

# Email Configuration
EMAIL_USER = "your_email@gmail.com"
EMAIL_PASS = "your_password"
EMAIL_RECIPIENT = "recipient_email@gmail.com"

# Webhook URL (example for Slack or Discord)
WEBHOOK_URL = "https://your-webhook-url"

# Initialize Trello client
trello_client = TrelloClient(api_key=TRELLO_API_KEY, api_secret=TRELLO_API_TOKEN)
board = trello_client.get_board(TRELLO_BOARD_ID)
task_list = board.open_lists()[0]  # Use the first open list

# Initialize Docker client
docker_client = docker.from_env()

# Function to send email alerts
def send_email_alert(subject, body):
    try:
        yag = yagmail.SMTP(EMAIL_USER, EMAIL_PASS)
        yag.send(EMAIL_RECIPIENT, subject, body)
        logging.info(f"Email alert sent: {subject}")
    except Exception as e:
        logging.error(f"Failed to send email alert: {e}")

# Function to send webhook notifications
def send_webhook_notification(message):
    try:
        payload = {"text": message}
        response = requests.post(WEBHOOK_URL, json=payload)
        if response.status_code == 200:
            logging.info("Webhook notification sent.")
        else:
            logging.error(f"Failed to send webhook notification: {response.text}")
    except Exception as e:
        logging.error(f"Error sending webhook notification: {e}")

# Function to list DNS records
def list_dns_records():
    logging.info("Listing DNS records...")
    url = f"https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}/dns_records"
    response = requests.get(url, headers=CLOUDFLARE_HEADERS)
    if response.status_code == 200 and response.json().get("success"):
        records = response.json()["result"]
        for record in records:
            logging.info(f"{record['type']} {record['name']} -> {record['content']} (ID: {record['id']})")
    else:
        logging.error(f"Failed to list DNS records: {response.text}")

# Function to add DNS records
def add_dns_record(record_type, name, content, ttl=3600):
    logging.info(f"Adding DNS record: {name} -> {content}")
    url = f"https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}/dns_records"
    data = {"type": record_type, "name": name, "content": content, "ttl": ttl}
    response = requests.post(url, headers=CLOUDFLARE_HEADERS, json=data)
    if response.status_code == 200 and response.json().get("success"):
        logging.info(f"DNS record added: {name} -> {content}")
        send_webhook_notification(f"DNS record added: {name} -> {content}")
    else:
        logging.error(f"Failed to add DNS record: {response.text}")
        send_email_alert("DNS Record Error", response.text)

# Monitor Docker events and update Trello
def monitor_docker_events():
    logging.info("Starting Docker event monitor...")
    for event in docker_client.events(decode=True):
        status = event.get("status")
        container_id = event.get("id")
        container_name = event.get("Actor", {}).get("Attributes", {}).get("name")

        if status in ["start", "stop", "die"]:
            task_name = f"Container {container_name} - {status}"
            task_desc = f"Container ID: {container_id}\nStatus: {status}"
            # Add a card for the Docker container event
            task_list.add_card(task_name, task_desc)
            logging.info(f"Created Trello card for container event: {task_name}")
            send_webhook_notification(f"Docker event: {task_name}")

# Scheduled job to list DNS records
def scheduled_dns_check():
    logging.info("Running scheduled DNS check...")
    list_dns_records()

# Main function
def main():
    logging.info("Starting automation...")
    
    # Step 1: Build and start Docker containers
    logging.info("Building and starting Docker containers...")
    subprocess.run(["docker-compose", "build"])
    subprocess.run(["docker-compose", "up", "-d"])

    # Step 2: Add DNS records to Cloudflare
    logging.info("Configuring Cloudflare DNS...")
    add_dns_record("A", "example.yourdomain.com", "192.0.2.1")

    # Step 3: Set up scheduled tasks
    logging.info("Setting up scheduled tasks...")
    schedule.every(10).minutes.do(scheduled_dns_check)

    # Step 4: Monitor Docker events and update Trello
    logging.info("Monitoring Docker events...")
    try:
        while True:
            schedule.run_pending()  # Run scheduled tasks
            monitor_docker_events()
    except KeyboardInterrupt:
        logging.info("Automation stopped by user.")

if __name__ == "__main__":
    main()
