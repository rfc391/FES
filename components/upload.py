import streamlit as st
import numpy as np
import pandas as pd
from typing import Tuple, Optional
from io import StringIO

def handle_file_upload() -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    """
    Handle file upload and return time and signal data arrays

    Returns:
        Tuple containing:
        - time: numpy array of time values or None if upload fails
        - signal_data: numpy array of signal values or None if upload fails
    """
    uploaded_file = st.file_uploader(
        "Upload signal data (CSV or TXT)", 
        type=["csv", "txt"],
        help="Upload a file containing time series data. The file should have one or two columns."
    )

    if uploaded_file is not None:
        try:
            # Read the file content
            content = StringIO(uploaded_file.getvalue().decode("utf-8"))
            data = pd.read_csv(content, header=None)

            # Validate data format
            if data.shape[1] == 1:
                signal_data = data.iloc[:, 0].values
                time = np.arange(len(signal_data))
                st.success("Successfully loaded single column data")
            elif data.shape[1] == 2:
                time = data.iloc[:, 0].values
                signal_data = data.iloc[:, 1].values
                st.success("Successfully loaded time series data")
            else:
                st.error("File should contain one or two columns (time and signal values)")
                return None, None

            # Display data preview
            st.subheader("Data Preview")
            preview_df = pd.DataFrame({
                "Time": time[:5],
                "Signal": signal_data[:5]
            })
            st.dataframe(preview_df)

            return time, signal_data

        except Exception as e:
            st.error(f"Error reading file: {str(e)}")
            return None, None

    return None, None