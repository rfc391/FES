
"""Signal processing utilities for FES analysis."""

import logging
import numpy as np
from scipy.signal import welch
from typing import Tuple, Dict

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def log_message(message: str, level: str = 'info') -> None:
    """Log a message at the specified level."""
    levels = {
        'debug': logging.debug,
        'info': logging.info,
        'warning': logging.warning,
        'error': logging.error,
        'critical': logging.critical
    }
    levels.get(level, logging.info)(message)

def preprocess_signal(signal: np.ndarray, sampling_rate: int = 1000) -> np.ndarray:
    """Preprocess the input signal by normalizing and removing mean.
    
    Args:
        signal: Input signal array
        sampling_rate: Signal sampling rate in Hz
        
    Returns:
        np.ndarray: Preprocessed signal
        
    Raises:
        ValueError: If preprocessing fails
    """
    try:
        normalized_signal = (signal - np.mean(signal)) / np.std(signal)
        return normalized_signal
    except Exception as error:
        raise ValueError(f"Error in signal preprocessing: {str(error)}")

def compute_spectral_density(
    signal: np.ndarray,
    sampling_rate: int = 1000
) -> Tuple[np.ndarray, np.ndarray]:
    """Compute the Power Spectral Density (PSD) of the signal.
    
    Args:
        signal: Input signal array
        sampling_rate: Signal sampling rate in Hz
        
    Returns:
        Tuple containing:
            - Frequency array
            - PSD array
            
    Raises:
        ValueError: If computation fails
    """
    try:
        frequencies, psd = welch(signal, fs=sampling_rate, nperseg=1024)
        return frequencies, psd
    except Exception as error:
        raise ValueError(f"Error in spectral density computation: {str(error)}")

def fluctuation_features(
    signal: np.ndarray,
    sampling_rate: int = 1000
) -> Dict[str, float]:
    """Extract fluctuation-based features from the signal.
    
    Args:
        signal: Input signal array
        sampling_rate: Signal sampling rate in Hz
        
    Returns:
        Dict containing:
            - dominant_frequency: Peak frequency component
            - spectral_flatness: Measure of spectral uniformity
    """
    preprocessed_signal = preprocess_signal(signal, sampling_rate)
    frequencies, psd = compute_spectral_density(preprocessed_signal, sampling_rate)
    
    dominant_frequency = frequencies[np.argmax(psd)]
    spectral_flatness = np.mean(psd) / (np.max(psd) + 1e-10)
    
    return {
        "dominant_frequency": dominant_frequency,
        "spectral_flatness": spectral_flatness
    }
import numpy as np

def preprocess_signal(signal, sampling_rate):
    """Normalize and preprocess the signal."""
    signal = (signal - np.mean(signal)) / np.std(signal)
    return signal

def compute_spectral_density(signal, sampling_rate):
    """Compute power spectral density."""
    frequencies = np.fft.fftfreq(len(signal), 1/sampling_rate)
    psd = np.abs(np.fft.fft(signal))**2
    return frequencies, psd

def fluctuation_features(signal, sampling_rate):
    """Extract features from signal fluctuations."""
    freqs, psd = compute_spectral_density(signal, sampling_rate)
    return {
        "dominant_frequency": freqs[np.argmax(psd)],
        "spectral_flatness": np.exp(np.mean(np.log(psd + 1e-10))) / np.mean(psd)
    }
