
# offline_ai.py - Load local offline models for inference (e.g., anomaly detection)
import os
import torch

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

def run_local_model(input_tensor, model_name="anomaly_detector.pt"):
    model_path = os.path.join(MODEL_DIR, model_name)
    if not os.path.exists(model_path):
        print(f"[-] Model {model_name} not found in offline store.")
        return None

    model = torch.load(model_path, map_location=torch.device('cpu'))
    model.eval()

    with torch.no_grad():
        output = model(input_tensor)
    return output
