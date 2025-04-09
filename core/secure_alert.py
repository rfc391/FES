
# secure_alert.py
# This module sends local GPG-encrypted alerts via Mosquitto (MQTT)

import subprocess

def send_encrypted_alert(message: str, recipient_key: str = "52BCCD17AD95D0A64ADBB73F2AC31B2120605AA5"):
    """
    Encrypts the message with GPG and publishes it locally to MQTT.
    """
    try:
        # Encrypt message
        with open("/tmp/fes_alert.txt", "w") as f:
            f.write(message)
        subprocess.run(["gpg", "--yes", "--encrypt", "--recipient", recipient_key, "/tmp/fes_alert.txt"])
        
        # Publish to local Mosquitto
        subprocess.run(["mosquitto_pub", "-t", "fes/alert", "-f", "/tmp/fes_alert.txt.gpg"])
        print("[+] Encrypted alert sent via MQTT.")
    except Exception as e:
        print("[-] Secure alert failed:", e)
