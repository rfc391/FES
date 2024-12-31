import pytest
import numpy as np
from utils.cyber_visualization import (
    get_risk_color,
    create_cyber_threat_plot,
    create_threat_confidence_plot,
    CyberThreatIndicator
)

def test_get_risk_color():
    # Test low risk
    assert get_risk_color(0.0) == 'rgb(0,255,0)'  # Green
    # Test high risk
    assert get_risk_color(1.0) == 'rgb(255,0,0)'  # Red
    # Test medium risk
    color_mid = get_risk_color(0.5)
    assert color_mid == 'rgb(127,127,0)'  # Yellow-ish

def test_create_cyber_threat_plot():
    # Test data
    time = np.linspace(0, 10, 100)
    signal_data = np.sin(time)
    threats = [
        CyberThreatIndicator(
            timestamp=2.0,
            threat_type="Test Threat",
            confidence=0.8
        )
    ]
    
    # Test plot creation
    fig = create_cyber_threat_plot(time, signal_data, threats)
    assert fig is not None
    assert len(fig.data) > 0  # Should have at least the main signal trace

def test_create_cyber_threat_plot_no_threats():
    # Test with no threats
    time = np.linspace(0, 10, 100)
    signal_data = np.sin(time)
    fig = create_cyber_threat_plot(time, signal_data, [])
    assert fig is not None
    assert len(fig.data) == 1  # Should only have the main signal trace

def test_create_threat_confidence_plot():
    # Test data
    threats = [
        CyberThreatIndicator(
            timestamp=2.0,
            threat_type="Test Threat 1",
            confidence=0.8
        ),
        CyberThreatIndicator(
            timestamp=5.0,
            threat_type="Test Threat 2",
            confidence=0.3
        )
    ]
    
    # Test plot creation
    fig = create_threat_confidence_plot(threats)
    assert fig is not None
    assert len(fig.data) == 1  # Should have one bar trace

def test_create_threat_confidence_plot_empty():
    # Test with no threats
    fig = create_threat_confidence_plot([])
    assert fig is not None

def test_error_handling():
    # Test with invalid inputs
    with pytest.raises(TypeError):
        create_cyber_threat_plot(None, None, None)

    with pytest.raises(TypeError):
        create_threat_confidence_plot(None)