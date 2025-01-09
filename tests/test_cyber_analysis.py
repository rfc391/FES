import pytest
import numpy as np
from utils.cyber_analysis import CyberWarfareAnalyzer, CyberThreatIndicator

@pytest.fixture
def analyzer():
    return CyberWarfareAnalyzer(sampling_rate=1000.0)

@pytest.fixture
def sample_signal():
    # Create a test signal with known patterns
    t = np.linspace(0, 10, 10000)
    clean_signal = np.sin(2 * np.pi * t)
    # Add some noise
    noisy_signal = clean_signal + 0.1 * np.random.randn(len(t))
    return t, noisy_signal

def test_analyzer_initialization(analyzer):
    assert analyzer.sampling_rate == 1000.0
    assert len(analyzer.attack_patterns) == 4  # Should have 4 detection methods

def test_frequency_hopping_detection(analyzer, sample_signal):
    time, signal = sample_signal
    # Add frequency hopping pattern
    hopping_signal = signal.copy()
    hopping_signal[5000:6000] = np.sin(2 * np.pi * 5 * time[5000:6000])
    
    threats = analyzer._detect_frequency_hopping(hopping_signal, time)
    assert len(threats) > 0
    assert all(isinstance(t, CyberThreatIndicator) for t in threats)
    assert all(t.threat_type == "Frequency Hopping" for t in threats)

def test_signal_injection_detection(analyzer, sample_signal):
    time, signal = sample_signal
    # Add injection pattern
    injection_signal = signal.copy()
    injection_signal[7000:7100] += 2.0  # Add sudden amplitude change
    
    threats = analyzer._detect_signal_injection(injection_signal, time)
    assert len(threats) > 0
    assert all(isinstance(t, CyberThreatIndicator) for t in threats)
    assert all(t.threat_type == "Signal Injection" for t in threats)

def test_jamming_detection(analyzer, sample_signal):
    time, signal = sample_signal
    # Add jamming pattern
    jamming_signal = signal.copy()
    jamming_signal[3000:4000] *= 3.0  # Increase amplitude significantly
    
    threats = analyzer._detect_jamming(jamming_signal, time)
    assert len(threats) > 0
    assert all(isinstance(t, CyberThreatIndicator) for t in threats)
    assert all(t.threat_type == "Signal Jamming" for t in threats)

def test_replay_attack_detection(analyzer, sample_signal):
    time, signal = sample_signal
    # Add replay pattern
    replay_signal = signal.copy()
    replay_signal[8000:8500] = signal[7000:7500]  # Copy a segment
    
    threats = analyzer._detect_replay_attack(replay_signal, time)
    assert len(threats) > 0
    assert all(isinstance(t, CyberThreatIndicator) for t in threats)
    assert all(t.threat_type == "Replay Attack" for t in threats)

def test_analyze_threats_integration(analyzer, sample_signal):
    time, signal = sample_signal
    threats = analyzer.analyze_threats(signal, time)
    
    assert isinstance(threats, list)
    assert all(isinstance(t, CyberThreatIndicator) for t in threats)
    assert all(0 <= t.confidence <= 1 for t in threats)

def test_generate_countermeasures(analyzer):
    # Create some test threats
    threats = [
        CyberThreatIndicator(
            threat_type="Frequency Hopping",
            confidence=0.8,
            timestamp=1.0,
            characteristics={"frequency_change": 2.0},
            recommendation="Test recommendation"
        ),
        CyberThreatIndicator(
            threat_type="Signal Injection",
            confidence=0.9,
            timestamp=2.0,
            characteristics={"magnitude": 1.5},
            recommendation="Test recommendation"
        )
    ]
    
    countermeasures = analyzer.generate_countermeasures(threats)
    assert isinstance(countermeasures, dict)
    assert len(countermeasures) == 2
    assert all(isinstance(measures, list) for measures in countermeasures.values())
