
# launcher.py
import sys
import os
import subprocess
import platform

def run_gui():
    subprocess.run(["python3", "src/gui_launcher.py"])

def run_cli():
    subprocess.run(["python3", "src/main.py"] + sys.argv[1:])

if __name__ == "__main__":
    if platform.system() == "Windows":
        if "--gui" in sys.argv:
            run_gui()
        else:
            run_cli()
    else:
        print("Use the build.sh script for Linux or run main.py manually.")

from core.secure_alert import send_encrypted_alert
send_encrypted_alert('FES launched successfully.')

from core.plugin_loader import load_plugins
load_plugins()

print('[*] Offline AI model support is enabled. Models must be placed in /models')
