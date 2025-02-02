"""
Security validation module for cyber threat detection
Implements secure input validation and sanitization
"""

import numpy as np
from typing import Tuple, Optional, Dict, Any
import logging

class SecurityValidator:
    def __init__(self):
        self.max_signal_length = 1_000_000  # Maximum allowed signal length
        self.max_amplitude = 1000.0  # Maximum allowed signal amplitude
        
    def validate_signal(self, signal_data: np.ndarray, time: np.ndarray) -> Tuple[bool, str]:
        """
        Validate signal data for security concerns
        
        Args:
            signal_data: Input signal array
            time: Time array
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check for null or empty data
            if signal_data is None or len(signal_data) == 0:
                return False, "Signal data cannot be empty"
                
            # Check signal length
            if len(signal_data) > self.max_signal_length:
                return False, f"Signal length exceeds maximum allowed ({self.max_signal_length})"
                
            # Validate signal properties
            if not np.isfinite(signal_data).all():
                return False, "Signal contains invalid values (inf/nan)"
                
            # Check amplitude bounds
            if np.abs(signal_data).max() > self.max_amplitude:
                return False, f"Signal amplitude exceeds maximum allowed ({self.max_amplitude})"
                
            # Validate time array
            if len(time) != len(signal_data):
                return False, "Time and signal arrays must have same length"
                
            if not np.all(np.diff(time) > 0):
                return False, "Time values must be strictly increasing"
                
            return True, ""
            
        except Exception as e:
            logging.error(f"Signal validation error: {str(e)}")
            return False, f"Validation error: {str(e)}"
            
    def sanitize_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize metadata to prevent injection attacks
        
        Args:
            metadata: Dictionary of metadata
            
        Returns:
            Sanitized metadata dictionary
        """
        if not isinstance(metadata, dict):
            return {}
            
        sanitized = {}
        for key, value in metadata.items():
            # Only allow string keys
            if not isinstance(key, str):
                continue
                
            # Remove any potential script tags or suspicious patterns    
            if isinstance(value, str):
                value = value.replace("<script>", "").replace("</script>", "")
                value = value.replace("javascript:", "")
                
            sanitized[key] = value
            
        return sanitized
