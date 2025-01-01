
import requests
import json

TRELLO_API_BASE = "https://api.trello.com/1"
API_KEY = "your_api_key"
API_TOKEN = "your_api_token"
BOARD_ID = "your_board_id"

def create_trello_card(list_id, name, description):
    url = f"{TRELLO_API_BASE}/cards"
    query = {
        "key": API_KEY,
        "token": API_TOKEN,
        "idList": list_id,
        "name": name,
        "desc": description
    }
    response = requests.post(url, params=query)
    if response.status_code == 200:
        print("Card created successfully:", response.json())
    else:
        print("Failed to create card:", response.text)

if __name__ == "__main__":
    list_id = "your_list_id"
    create_trello_card(list_id, "New Workflow", "This card was created via automation.")
