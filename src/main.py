"""
Main entry point for the FES Platform
Handles signal processing and threat detection core functionality
"""

import logging
from typing import Dict, Any
import json
from datetime import datetime
from flask import Flask, jsonify, request
from .utils import setup_logging, analyze_fluctuations, validate_signal
from .config import load_config
from .readme_generator import update_project_readme
import os

app = Flask(__name__)
config = load_config()

def initialize_platform() -> Dict[str, Any]:
    """
    Initialize the FES platform with necessary configurations
    """
    setup_logging()
    config = load_config()

    # Update README with latest metrics
    try:
        update_project_readme()
        logging.info("README.md updated successfully with latest metrics")
    except Exception as e:
        logging.error("Failed to update README: %s", str(e))

    logging.info("FES Platform initialized successfully")
    return config

@app.route('/api/process-signal', methods=['POST'])
def process_signal() -> Dict[str, Any]:
    """
    Process incoming signals using fluctuation-enhanced techniques

    Args:
        signal_data: Raw signal data from sensors

    Returns:
        Processed signal data with detected anomalies
    """
    try:
        signal_data = request.get_json()
        if not validate_signal(signal_data):
            return jsonify({"error": "Invalid signal data"}), 400

        result = analyze_fluctuations(signal_data["data"])

        # Enhance result with threat detection
        threat_analysis = {
            "processed": True,
            "timestamp": datetime.now().isoformat(),
            "anomalies": result["anomalies"],
            "threat_level": "high" if result["anomaly_score"] > config["threat_threshold"] else "low",
            "raw_data": signal_data
        }

        return jsonify(threat_analysis)

    except Exception as e:
        logging.error("Failed to process signal: %s", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics() -> Dict[str, Any]:
    """
    Get current project metrics
    """
    try:
        from .readme_generator import ReadmeGenerator
        generator = ReadmeGenerator(os.getcwd())
        metrics = generator.gather_project_metrics()
        return jsonify(metrics)
    except Exception as e:
        logging.error("Failed to gather metrics: %s", str(e))
        return jsonify({"error": str(e)}), 500

def main():
    """
    Main entry point for the FES platform
    """
    try:
        config = initialize_platform()
        logging.info("Starting FES platform with configuration: %s", 
                    json.dumps(config, indent=2))

        # Start Flask server
        app.run(host='0.0.0.0', port=5001, debug=True)

    except Exception as e:
        logging.error("Failed to start FES platform: %s", str(e))
        raise

if __name__ == "__main__":
    main()