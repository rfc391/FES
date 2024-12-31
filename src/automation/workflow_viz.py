"""
CI/CD Workflow Visualization Module
Tracks and visualizes automation task statuses
"""

import json
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path
import logging

class WorkflowTracker:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.workflows_dir = self.project_root / "workflow_data"
        self.workflows_dir.mkdir(exist_ok=True)
        self.current_state = {
            "last_updated": datetime.now().isoformat(),
            "workflows": {
                "tests": {
                    "status": "pending",
                    "last_run": None,
                    "metrics": {}
                },
                "code_quality": {
                    "status": "pending",
                    "last_run": None,
                    "metrics": {}
                },
                "readme_update": {
                    "status": "pending",
                    "last_run": None,
                    "metrics": {}
                }
            }
        }
        self._load_state()

    def _load_state(self) -> None:
        """Load the latest workflow state"""
        state_file = self.workflows_dir / "current_state.json"
        if state_file.exists():
            try:
                with open(state_file, 'r') as f:
                    self.current_state = json.load(f)
            except Exception as e:
                logging.error(f"Failed to load workflow state: {e}")

    def _save_state(self) -> None:
        """Save the current workflow state"""
        state_file = self.workflows_dir / "current_state.json"
        try:
            with open(state_file, 'w') as f:
                json.dump(self.current_state, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save workflow state: {e}")

    def update_workflow(self, workflow_name: str, status: str, metrics: Dict[str, Any]) -> None:
        """
        Update the status and metrics of a workflow
        
        Args:
            workflow_name: Name of the workflow to update
            status: Current status (success, failure, pending)
            metrics: Dictionary containing workflow metrics
        """
        if workflow_name in self.current_state["workflows"]:
            self.current_state["workflows"][workflow_name].update({
                "status": status,
                "last_run": datetime.now().isoformat(),
                "metrics": metrics
            })
            self.current_state["last_updated"] = datetime.now().isoformat()
            self._save_state()

    def get_workflow_status(self, workflow_name: str = None) -> Dict[str, Any]:
        """
        Get the current status of workflows
        
        Args:
            workflow_name: Optional specific workflow to get status for
            
        Returns:
            Dictionary containing workflow status and metrics
        """
        if workflow_name:
            return self.current_state["workflows"].get(workflow_name, {})
        return self.current_state

    def generate_visualization_data(self) -> Dict[str, Any]:
        """
        Generate data for workflow visualization
        
        Returns:
            Dictionary containing data formatted for visualization
        """
        nodes = []
        edges = []
        
        # Add workflow nodes
        for i, (name, data) in enumerate(self.current_state["workflows"].items()):
            status_colors = {
                "success": "#22c55e",  # green
                "failure": "#ef4444",  # red
                "pending": "#f59e0b"   # amber
            }
            
            nodes.append({
                "id": name,
                "label": name.replace("_", " ").title(),
                "x": 100 + (i * 200),
                "y": 100,
                "size": 40,
                "color": status_colors.get(data["status"], "#6b7280")
            })
            
            # Add edges showing workflow dependencies
            if i > 0:
                edges.append({
                    "source": list(self.current_state["workflows"].keys())[i-1],
                    "target": name,
                    "id": f"edge_{i}",
                    "size": 2
                })

        return {
            "nodes": nodes,
            "edges": edges,
            "last_updated": self.current_state["last_updated"]
        }
