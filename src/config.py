"""
Configuration management for the FES platform
"""

import os
import json
from typing import Dict, Any

DEFAULT_CONFIG = {
    "sampling_rate": 1000,  # Hz
    "analysis_window": 60,  # seconds
    "threat_threshold": 0.8,
    "sensor_types": ["network", "system", "electromagnetic"],
    "log_level": "INFO",
    "data_retention_days": 30
}

def load_config() -> Dict[str, Any]:
    """
    Load configuration from environment or file
    
    Returns:
        Dictionary containing configuration parameters
    """
    config = DEFAULT_CONFIG.copy()
    
    # Override with environment variables if present
    for key in config:
        env_key = f"FES_{key.upper()}"
        if env_key in os.environ:
            config[key] = os.environ[env_key]
            
    return config

def save_config(config: Dict[str, Any], config_path: str) -> None:
    """
    Save configuration to file
    
    Args:
        config: Configuration dictionary
        config_path: Path to save configuration file
    """
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
