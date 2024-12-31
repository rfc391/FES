"""
Main entry point for the FES Platform
Handles signal processing and threat detection core functionality
"""

import logging
from typing import Dict, Any
import json
from datetime import datetime
import os
from flask import Flask, jsonify, request
from utils import setup_logging, analyze_fluctuations, validate_signal
from config import load_config
from readme_generator import update_project_readme
from automation.test_runner import TestRunner
from automation.code_quality import analyze_code_quality
from automation.workflow_viz import WorkflowTracker

app = Flask(__name__)
config = load_config()
workflow_tracker = WorkflowTracker(os.getcwd())

def initialize_platform() -> Dict[str, Any]:
    """
    Initialize the FES platform with necessary configurations and run automations
    """
    setup_logging()
    config = load_config()

    # Update README with latest metrics
    try:
        update_project_readme()
        workflow_tracker.update_workflow("readme_update", "success", {
            "timestamp": datetime.now().isoformat()
        })
        logging.info("README.md updated successfully with latest metrics")
    except Exception as e:
        workflow_tracker.update_workflow("readme_update", "failure", {
            "error": str(e)
        })
        logging.error("Failed to update README: %s", str(e))

    # Run initial code quality analysis
    try:
        analyze_code_quality()
        workflow_tracker.update_workflow("code_quality", "success", {
            "timestamp": datetime.now().isoformat()
        })
        logging.info("Code quality analysis completed successfully")
    except Exception as e:
        workflow_tracker.update_workflow("code_quality", "failure", {
            "error": str(e)
        })
        logging.error("Failed to run code analysis: %s", str(e))

    # Run test suite
    try:
        runner = TestRunner(os.getcwd())
        results = runner.run_tests()
        workflow_tracker.update_workflow("tests", "success", results)
        logging.info(f"Test suite completed with {results['success_rate']*100}% success rate")
    except Exception as e:
        workflow_tracker.update_workflow("tests", "failure", {
            "error": str(e)
        })
        logging.error("Failed to run tests: %s", str(e))

    logging.info("FES Platform initialized successfully")
    return config

@app.route('/api/process-signal', methods=['POST'])
def process_signal() -> Dict[str, Any]:
    """
    Process incoming signals using fluctuation-enhanced techniques
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
        from readme_generator import ReadmeGenerator
        generator = ReadmeGenerator(os.getcwd())
        metrics = generator.gather_project_metrics()
        return jsonify(metrics)
    except Exception as e:
        logging.error("Failed to gather metrics: %s", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/automation/run-tests', methods=['POST'])
def run_tests() -> Dict[str, Any]:
    """
    Manually trigger test suite
    """
    try:
        runner = TestRunner(os.getcwd())
        results = runner.run_tests()
        return jsonify(results)
    except Exception as e:
        logging.error("Failed to run tests: %s", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/automation/analyze-code', methods=['POST'])
def analyze_code() -> Dict[str, Any]:
    """
    Manually trigger code quality analysis
    """
    try:
        results = analyze_code_quality()
        if results:
            return jsonify(results)
        return jsonify({"error": "Code analysis failed"}), 500
    except Exception as e:
        logging.error("Failed to analyze code: %s", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/workflow-status', methods=['GET'])
def get_workflow_status() -> Dict[str, Any]:
    """
    Get current workflow status for visualization
    """
    try:
        return jsonify(workflow_tracker.generate_visualization_data())
    except Exception as e:
        logging.error("Failed to get workflow status: %s", str(e))
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