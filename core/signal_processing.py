import numpy as np
from scipy import signal
from scipy.fft import fft, fftfreq
from typing import Tuple, Optional, List

def preprocess_signal(data: np.ndarray, sampling_rate: float) -> np.ndarray:
    """
    Preprocess the input signal by removing DC offset and normalizing
    """
    # Remove DC offset
    data = data - np.mean(data)
    # Normalize
    return data / np.std(data)

def compute_psd(data: np.ndarray, sampling_rate: float) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute Power Spectral Density using Welch's method
    """
    frequencies, psd = signal.welch(data, fs=sampling_rate, nperseg=min(len(data), 256))
    return frequencies, psd

def compute_correlation_matrix(signals: List[np.ndarray]) -> np.ndarray:
    """
    Compute correlation matrix between multiple signals

    Parameters:
    -----------
    signals : List[np.ndarray]
        List of signals to compute correlations between

    Returns:
    --------
    correlation_matrix : np.ndarray
        Matrix of correlation coefficients
    """
    n_signals = len(signals)
    correlation_matrix = np.zeros((n_signals, n_signals))

    for i in range(n_signals):
        for j in range(n_signals):
            correlation_matrix[i, j] = np.corrcoef(signals[i], signals[j])[0, 1]

    return correlation_matrix

def compute_fluctuation_analysis(data: np.ndarray, 
                               window_sizes: Optional[np.ndarray] = None) -> Tuple[np.ndarray, np.ndarray]:
    """
    Perform Detrended Fluctuation Analysis (DFA)
    """
    if window_sizes is None:
        window_sizes = np.logspace(1, np.log10(len(data)/4), 20, dtype=int)

    # Compute cumulative sum
    y = np.cumsum(data - np.mean(data))
    fluctuations = np.zeros(len(window_sizes))

    for i, window in enumerate(window_sizes):
        # Number of windows
        n_windows = len(data) // window
        windows_fluctuation = np.zeros(n_windows)

        for j in range(n_windows):
            start = j * window
            end = start + window
            segment = y[start:end]
            x = np.arange(window)
            coeffs = np.polyfit(x, segment, 1)
            trend = np.polyval(coeffs, x)
            windows_fluctuation[j] = np.sqrt(np.mean((segment - trend) ** 2))

        fluctuations[i] = np.mean(windows_fluctuation)

    return window_sizes, fluctuations

def compute_hurst_exponent(window_sizes: np.ndarray, fluctuations: np.ndarray) -> float:
    """
    Compute Hurst exponent from fluctuation analysis results
    """
    coeffs = np.polyfit(np.log(window_sizes), np.log(fluctuations), 1)
    return coeffs[0]