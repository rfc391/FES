"""
FES Analysis Platform - Main Application
Provides tools for analyzing signals using fluctuation-enhanced sensing techniques.
"""
import streamlit as st
import numpy as np
from components.sidebar import create_sidebar
from components.upload import handle_file_upload
from components.analysis import perform_analysis
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def main():
    """Initialize and run the main application."""
    try:
        st.set_page_config(
            page_title="FES Analysis Platform",
            page_icon="📊",
            layout="wide",
            initial_sidebar_state="expanded"
        )

        st.title("Fluctuation-Enhanced Sensing Analysis Platform")

        # Add description
        st.markdown("""
        This platform provides tools for analyzing signals using fluctuation-enhanced sensing techniques.
        Upload your signal data to begin analysis.
        """)

        # Create sidebar with parameters
        params = create_sidebar()

        # Handle file upload
        time, signal_data = handle_file_upload()

        if time is not None and signal_data is not None:
            perform_analysis(time, signal_data, params)
        else:
            # Show demo data
            st.info("No data uploaded. Showing demo data...")
            t = np.linspace(0, 10, 1000)
            demo_signal = (
                np.sin(2 * np.pi * 1 * t) + 
                0.5 * np.sin(2 * np.pi * 2.5 * t) + 
                0.25 * np.random.randn(len(t))
            )
            perform_analysis(t, demo_signal, params)
    except Exception as e:
        logging.error(f"Application error: {str(e)}")
        st.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()