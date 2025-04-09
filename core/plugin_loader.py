
# plugin_loader.py - Secure Plugin Loader for FES
import os
import importlib.util

PLUGIN_DIR = os.path.join(os.path.dirname(__file__), "..", "plugins")

def load_plugins():
    print("[+] Scanning for plugins...")
    for file in os.listdir(PLUGIN_DIR):
        if file.endswith(".fesmod"):
            plugin_path = os.path.join(PLUGIN_DIR, file)
            spec = importlib.util.spec_from_file_location(file[:-7], plugin_path)
            if spec:
                module = importlib.util.module_from_spec(spec)
                try:
                    spec.loader.exec_module(module)
                    print(f"[+] Loaded plugin: {file}")
                except Exception as e:
                    print(f"[-] Failed to load plugin {file}: {e}")
