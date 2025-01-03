import streamlit as st
from typing import Dict, Any
from utils.preprocessing import SignalPreprocessor

def create_preprocessing_section() -> Dict[str, Any]:
    """
    Create the preprocessing section in the sidebar.
    
    Returns:
        Dict containing preprocessing parameters:
        - enable_preprocessing: bool
        - filter_type: str
        - filter_params: dict
    """
    st.sidebar.subheader("Signal Preprocessing")

    enable_preprocessing = st.sidebar.checkbox(
        "Enable Preprocessing",
        value=True,
        help="Apply intelligent signal preprocessing"
    )

    filter_type = None
    filter_params = {}

    if enable_preprocessing:
        filter_type = st.sidebar.selectbox(
            "Filter Type",
            ["Auto (Recommended)", "Butterworth", "Savitzky-Golay", "Wavelet", "Median"],
            help="Select preprocessing filter type"
        )

        if filter_type == "Butterworth":
            filter_params['order'] = st.sidebar.slider(
                "Filter Order",
                min_value=1,
                max_value=8,
                value=4
            )
            filter_params['cutoff'] = st.sidebar.slider(
                "Cutoff Frequency",
                min_value=0.01,
                max_value=0.5,
                value=0.1
            )
        elif filter_type == "Savitzky-Golay":
            filter_params['window_length'] = st.sidebar.slider(
                "Window Length",
                min_value=5,
                max_value=51,
                value=21,
                step=2
            )
            filter_params['polyorder'] = st.sidebar.slider(
                "Polynomial Order",
                min_value=1,
                max_value=5,
                value=3
            )
        elif filter_type == "Wavelet":
            filter_params['wavelet'] = st.sidebar.selectbox(
                "Wavelet Type",
                ['db1', 'db4', 'sym4', 'coif1'],
                index=1
            )
            filter_params['level'] = st.sidebar.slider(
                "Decomposition Level",
                min_value=1,
                max_value=5,
                value=3
            )
        elif filter_type == "Median":
            filter_params['kernel_size'] = st.sidebar.slider(
                "Kernel Size",
                min_value=3,
                max_value=15,
                value=5,
                step=2
            )

    return {
        "enable_preprocessing": enable_preprocessing,
        "filter_type": filter_type,
        "filter_params": filter_params
    }

def create_sidebar():
    """
    Create the sidebar with analysis parameters
    """
    st.sidebar.title("Analysis Parameters")

    # Add preprocessing section
    preprocessing_params = create_preprocessing_section()

    # Original parameters
    sampling_rate = st.sidebar.number_input(
        "Sampling Rate (Hz)",
        min_value=1.0,
        max_value=1000000.0,
        value=1000.0,
        step=100.0,
        help="Sampling rate of the input signal in Hz"
    )

    window_size = st.sidebar.slider(
        "Window Size",
        min_value=16,
        max_value=1024,
        value=256,
        step=16,
        help="Window size for spectral analysis"
    )

    # Add anomaly detection parameters
    st.sidebar.subheader("Anomaly Detection")

    enable_anomaly_detection = st.sidebar.checkbox(
        "Enable Anomaly Detection",
        value=True,
        help="Toggle anomaly detection visualization"
    )

    contamination = st.sidebar.slider(
        "Contamination Factor",
        min_value=0.01,
        max_value=0.5,
        value=0.1,
        step=0.01,
        help="Expected proportion of anomalies in the signal"
    )

    min_segment_length = st.sidebar.slider(
        "Minimum Anomaly Length",
        min_value=1,
        max_value=50,
        value=3,
        step=1,
        help="Minimum length of consecutive points to be considered an anomaly"
    )

    return {
        **preprocessing_params,
        "sampling_rate": sampling_rate,
        "window_size": window_size,
        "enable_anomaly_detection": enable_anomaly_detection,
        "contamination": contamination,
        "min_segment_length": min_segment_length
    }