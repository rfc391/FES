
import tkinter as tk
from tkinter import messagebox
import subprocess
import sys
import platform

def run_automation():
    subprocess.Popen(["python3", "scripts/automate.py"])

def run_main():
    subprocess.Popen(["python3", "src/main.py"])

def exit_app():
    root.destroy()

root = tk.Tk()
root.title("FES Tactical Launcher")
root.geometry("350x200")

tk.Label(root, text="Field Extraction System", font=("Arial", 16)).pack(pady=10)
tk.Button(root, text="▶ Run Main System", width=25, command=run_main).pack(pady=5)
tk.Button(root, text="⚙ Run Automation", width=25, command=run_automation).pack(pady=5)
tk.Button(root, text="❌ Exit", width=25, command=exit_app).pack(pady=5)

root.mainloop()
