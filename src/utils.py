"""
Utility functions for the FES platform
"""

import logging
from typing import Dict, Any, List
import numpy as np
from datetime import datetime
from scipy import signal

def setup_logging() -> None:
    """
    Configure logging for the application
    """
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

def analyze_fluctuations(data: np.ndarray) -> Dict[str, Any]:
    """
    Analyze signal fluctuations for anomaly detection

    Args:
        data: Input signal data as numpy array

    Returns:
        Dictionary containing analysis results including anomalies
    """
    # Convert data to numpy array if not already
    if not isinstance(data, np.ndarray):
        data = np.array(data)

    # Perform wavelet transform for multi-scale analysis
    scales = np.arange(1, 16)
    coefficients = signal.cwt(data, signal.ricker, scales)

    # Calculate statistical features
    mean = np.mean(data)
    std = np.std(data)

    # Detect anomalies using statistical thresholds
    threshold = mean + (3 * std)  # 3-sigma rule
    anomaly_indices = np.where(data > threshold)[0]

    # Calculate anomaly score based on wavelet coefficients
    anomaly_score = np.max(np.abs(coefficients)) / np.mean(np.abs(coefficients))

    # Extract anomalies with their characteristics
    anomalies = []
    for idx in anomaly_indices:
        anomalies.append({
            "index": int(idx),
            "value": float(data[idx]),
            "severity": "high" if data[idx] > (mean + 4 * std) else "medium"
        })

    return {
        "timestamp": datetime.now().isoformat(),
        "mean": float(mean),
        "std": float(std),
        "anomaly_score": float(anomaly_score),
        "anomalies": anomalies,
        "frequency_components": list(map(float, np.fft.fft(data)[:10]))  # First 10 frequency components
    }

def validate_signal(signal_data: Dict[str, Any]) -> bool:
    """
    Validate incoming signal data

    Args:
        signal_data: Signal data to validate

    Returns:
        True if signal is valid, False otherwise
    """
    required_fields = ["timestamp", "source", "data"]
    if not all(field in signal_data for field in required_fields):
        return False

    # Validate data format
    if not isinstance(signal_data["data"], (list, np.ndarray)):
        return False

    # Validate timestamp format
    try:
        datetime.fromisoformat(signal_data["timestamp"].replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return False

    return True

def extract_features(signal_data: np.ndarray) -> Dict[str, List[float]]:
    """
    Extract relevant features from signal data for threat detection

    Args:
        signal_data: Input signal data

    Returns:
        Dictionary of extracted features
    """
    # Perform feature extraction using various signal processing techniques
    features = {
        "statistical": [
            float(np.mean(signal_data)),
            float(np.std(signal_data)),
            float(np.max(signal_data)),
            float(np.min(signal_data))
        ],
        "spectral": list(map(float, np.abs(np.fft.fft(signal_data))[:5])),  # First 5 frequency components
        "entropy": [float(signal.entropy(np.abs(signal_data)))]
    }

    return features