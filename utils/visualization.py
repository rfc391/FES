import plotly.graph_objects as go
import numpy as np
from typing import Tuple, List, Optional

def create_signal_plot(time: np.ndarray, data: np.ndarray, 
                      anomaly_mask: Optional[np.ndarray] = None,
                      anomaly_segments: Optional[List[Tuple[int, int]]] = None,
                      title: str = "Signal") -> go.Figure:
    """
    Create an interactive plot of the time series data with anomaly highlighting
    """
    fig = go.Figure()

    # Plot main signal
    fig.add_trace(go.Scatter(x=time, y=data, mode='lines', name='Signal',
                            line=dict(color='#1f77b4')))

    # Highlight anomalies if provided
    if anomaly_mask is not None and anomaly_segments is not None:
        for start_idx, end_idx in anomaly_segments:
            fig.add_trace(go.Scatter(
                x=time[start_idx:end_idx],
                y=data[start_idx:end_idx],
                mode='lines',
                name=f'Anomaly {start_idx}-{end_idx}',
                line=dict(color='#FF4B4B', width=2),
                hoverinfo='x+y+name'
            ))

    fig.update_layout(
        title=title,
        xaxis_title="Time",
        yaxis_title="Amplitude",
        template="plotly_dark",
        showlegend=True,
        hovermode='x unified'
    )
    return fig

def create_correlation_heatmap(correlation_matrix: np.ndarray,
                             labels: Optional[List[str]] = None) -> go.Figure:
    """
    Create an interactive correlation heatmap

    Parameters:
    -----------
    correlation_matrix : np.ndarray
        Square matrix of correlation coefficients
    labels : Optional[List[str]]
        Labels for the correlation matrix axes

    Returns:
    --------
    fig : go.Figure
        Plotly figure object containing the heatmap
    """
    if labels is None:
        labels = [f"Signal {i+1}" for i in range(len(correlation_matrix))]

    fig = go.Figure(data=go.Heatmap(
        z=correlation_matrix,
        x=labels,
        y=labels,
        colorscale='RdBu',
        zmid=0,
        text=np.round(correlation_matrix, 3),
        texttemplate='%{text}',
        textfont={"size": 10},
        hoverongaps=False,
    ))

    fig.update_layout(
        title="Signal Correlation Heatmap",
        template="plotly_dark",
        height=600,
        width=800
    )

    return fig

def create_psd_plot(frequencies: np.ndarray, psd: np.ndarray) -> go.Figure:
    """
    Create an interactive plot of the power spectral density
    """
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=frequencies, y=psd, mode='lines', 
                            name='PSD', line=dict(color='#00FF00')))

    fig.update_layout(
        title="Power Spectral Density",
        xaxis_title="Frequency (Hz)",
        yaxis_title="Power/Frequency",
        template="plotly_dark",
        showlegend=True,
        xaxis_type="log",
        yaxis_type="log"
    )
    return fig

def create_dfa_plot(window_sizes: np.ndarray, fluctuations: np.ndarray, 
                   hurst_exponent: float) -> go.Figure:
    """
    Create an interactive plot of the DFA results
    """
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=np.log10(window_sizes), y=np.log10(fluctuations),
                            mode='markers', name='DFA', marker=dict(color='#FF4B4B')))

    # Add fitted line
    x_fit = np.log10(window_sizes)
    y_fit = hurst_exponent * x_fit + np.log10(fluctuations[0])
    fig.add_trace(go.Scatter(x=x_fit, y=y_fit, mode='lines',
                            name=f'Fit (H={hurst_exponent:.3f})',
                            line=dict(color='#00FF00', dash='dash')))

    fig.update_layout(
        title="Detrended Fluctuation Analysis",
        xaxis_title="log₁₀(Window Size)",
        yaxis_title="log₁₀(Fluctuation)",
        template="plotly_dark",
        showlegend=True
    )
    return fig

class CyberThreatIndicator:
    def __init__(self, timestamp, threat_type, confidence):
        self.timestamp = timestamp
        self.threat_type = threat_type
        self.confidence = confidence

def create_cyber_threat_plot(time: np.ndarray, signal_data: np.ndarray, 
                           threats: List[CyberThreatIndicator],
                           title: str = "Cyber Threat Analysis") -> go.Figure:
    """
    Create an interactive plot highlighting detected cyber threats

    Parameters:
    -----------
    time : np.ndarray
        Time points
    signal_data : np.ndarray
        Signal data
    threats : List[CyberThreatIndicator]
        Detected cyber threats
    title : str
        Plot title

    Returns:
    --------
    fig : go.Figure
        Plotly figure with threat annotations
    """
    fig = go.Figure()

    # Plot main signal
    fig.add_trace(go.Scatter(x=time, y=signal_data, mode='lines', 
                            name='Signal', line=dict(color='#1f77b4')))

    # Add threat markers
    for threat in threats:
        fig.add_annotation(
            x=threat.timestamp,
            y=signal_data[int(threat.timestamp * len(signal_data) / time[-1])],
            text=f"{threat.threat_type}<br>Confidence: {threat.confidence:.2f}",
            showarrow=True,
            arrowhead=2,
            arrowsize=1,
            arrowwidth=2,
            arrowcolor='#FF4B4B',
            font=dict(color='white')
        )

    fig.update_layout(
        title=title,
        xaxis_title="Time",
        yaxis_title="Amplitude",
        template="plotly_dark",
        showlegend=True,
        hovermode='x unified'
    )
    return fig

def create_threat_confidence_plot(threats: List[CyberThreatIndicator]) -> go.Figure:
    """Create a bar plot of threat confidence levels"""
    threat_types = [t.threat_type for t in threats]
    confidence_levels = [t.confidence for t in threats]

    fig = go.Figure(data=[
        go.Bar(x=threat_types, y=confidence_levels,
               marker_color='#FF4B4B')
    ])

    fig.update_layout(
        title="Cyber Threat Confidence Levels",
        xaxis_title="Threat Type",
        yaxis_title="Confidence",
        template="plotly_dark",
        showlegend=False
    )
    return fig