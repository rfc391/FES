
"""Signal processing utilities for FES analysis."""

import logging
import numpy as np
from scipy.signal import welch
from scipy.fftpack import fft
from typing import Tuple, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def preprocess_signal(signal: np.ndarray) -> np.ndarray:
    """Normalize and preprocess the signal by removing mean and scaling."""
    try:
        normalized_signal = (signal - np.mean(signal)) / np.std(signal)
        return normalized_signal
    except Exception as error:
        raise ValueError(f"Error in signal preprocessing: {str(error)}")


def compute_spectral_density(signal: np.ndarray, sampling_rate: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
    """Compute the Power Spectral Density (PSD) of the signal."""
    try:
        frequencies, psd = welch(signal, fs=sampling_rate, nperseg=min(len(signal), 1024))
        return frequencies, psd
    except Exception as error:
        raise ValueError(f"Error in spectral density computation: {str(error)}")


def extract_signal_features(signal: np.ndarray, sampling_rate: int = 1000) -> Dict[str, float]:
    """Extract features from the signal, including dominant frequency and spectral flatness."""
    preprocessed_signal = preprocess_signal(signal)
    frequencies, psd = compute_spectral_density(preprocessed_signal, sampling_rate)
    
    # Calculate dominant frequency and spectral flatness
    dominant_frequency = frequencies[np.argmax(psd)]
    spectral_flatness = np.exp(np.mean(np.log(psd + 1e-10))) / (np.mean(psd) + 1e-10)
    
    return {
        "dominant_frequency": dominant_frequency,
        "spectral_flatness": spectral_flatness
    }
