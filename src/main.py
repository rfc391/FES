
from core.signal_processing import preprocess_signal, compute_psd
from core.live_dashboard import create_live_plot
import numpy as np

def main():
    print("Starting FES Application...")

    # Example: Simulated signal data
    sampling_rate = 1000  # Hz
    time = np.linspace(0, 1, sampling_rate)
    signal_data = np.sin(2 * np.pi * 50 * time) + 0.5 * np.random.normal(size=time.shape)

    # Preprocess signal
    preprocessed_signal = preprocess_signal(signal_data, sampling_rate)

    # Compute Power Spectral Density (PSD)
    frequencies, psd = compute_psd(preprocessed_signal, sampling_rate)
    print("Computed PSD:", psd)

    # Launch live dashboard (currently placeholder)
    print("Launching live dashboard...")
    create_live_plot()

if __name__ == "__main__":
    main()
