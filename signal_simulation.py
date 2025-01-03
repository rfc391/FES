
"""Signal simulation module for generating test data."""

import numpy as np
import pandas as pd
from typing import Tuple

def generate_signal(frequency: float = 5.0, 
                   sampling_rate: int = 1000, 
                   duration: float = 1.0) -> Tuple[np.ndarray, np.ndarray]:
    """Generate a sine wave signal with noise for testing.
    
    Args:
        frequency: Signal frequency in Hz
        sampling_rate: Number of samples per second
        duration: Signal duration in seconds
        
    Returns:
        Tuple containing time and signal arrays
    """
    time_points = np.linspace(0, duration, int(sampling_rate * duration), endpoint=False)
    clean_signal = np.sin(2 * np.pi * frequency * time_points)
    noise = 0.5 * np.random.randn(len(time_points))
    return time_points, clean_signal + noise

def save_signal_to_csv(file_path: str) -> None:
    """Save a simulated signal to a CSV file.
    
    Args:
        file_path: Path where the CSV file will be saved
    """
    time_points, signal = generate_signal()
    signal_df = pd.DataFrame({
        "Time": time_points,
        "Amplitude": signal
    })
    signal_df.to_csv(file_path, index=False)
    print(f"Signal saved to {file_path}")

if __name__ == "__main__":
    save_signal_to_csv("data/sample_signals/simulated_signal.csv")
