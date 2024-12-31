```python
import pytest
from datetime import datetime
from utils.cyber_analysis import CyberWarfareAnalyzer
import numpy as np

@pytest.fixture
def cyber_analyzer():
    return CyberWarfareAnalyzer(sampling_rate=1000.0)

def test_threat_detection():
    # Create analyzer instance
    analyzer = CyberWarfareAnalyzer(sampling_rate=1000.0)
    
    # Generate test signal with known patterns
    t = np.linspace(0, 10, 10000)
    signal = np.sin(2 * np.pi * 5 * t)  # 5 Hz sine wave
    
    # Add some noise to simulate interference
    noise = np.random.normal(0, 0.1, len(t))
    signal += noise
    
    # Analyze threats
    threats = analyzer.analyze_threats(signal, t)
    
    # Verify threat detection
    assert len(threats) > 0, "Should detect at least one threat"
    
    # Check threat attributes
    for threat in threats:
        assert 0 <= threat.confidence <= 1, "Confidence should be between 0 and 1"
        assert isinstance(threat.timestamp, float), "Timestamp should be float"
        assert threat.characteristics, "Should have characteristics"
        assert threat.recommendation, "Should have recommendation"

def test_frequency_hopping_detection(cyber_analyzer):
    # Generate signal with frequency hopping
    t = np.linspace(0, 10, 10000)
    signal = np.zeros_like(t)
    
    # Add frequency hopping pattern
    for i in range(5):
        start_idx = i * 2000
        end_idx = (i + 1) * 2000
        freq = 5 * (i + 1)  # Different frequency for each segment
        signal[start_idx:end_idx] = np.sin(2 * np.pi * freq * t[start_idx:end_idx])
    
    threats = cyber_analyzer._detect_frequency_hopping(signal, t)
    assert len(threats) > 0, "Should detect frequency hopping"

def test_signal_injection_detection(cyber_analyzer):
    # Generate clean signal
    t = np.linspace(0, 10, 10000)
    signal = np.sin(2 * np.pi * 5 * t)
    
    # Add injection
    injection_point = 5000
    signal[injection_point:injection_point+1000] += 2 * np.sin(2 * np.pi * 20 * t[injection_point:injection_point+1000])
    
    threats = cyber_analyzer._detect_signal_injection(signal, t)
    assert len(threats) > 0, "Should detect signal injection"

def test_jamming_detection(cyber_analyzer):
    # Generate signal with jamming
    t = np.linspace(0, 10, 10000)
    signal = np.sin(2 * np.pi * 5 * t)
    
    # Add high power noise in a segment
    jamming_start = 4000
    jamming_end = 6000
    signal[jamming_start:jamming_end] += np.random.normal(0, 5, jamming_end-jamming_start)
    
    threats = cyber_analyzer._detect_jamming(signal, t)
    assert len(threats) > 0, "Should detect jamming"

def test_replay_attack_detection(cyber_analyzer):
    # Generate signal with replay
    t = np.linspace(0, 10, 10000)
    signal = np.sin(2 * np.pi * 5 * t)
    
    # Copy a segment and replay it
    replay_segment = signal[1000:2000].copy()
    signal[5000:6000] = replay_segment
    
    threats = cyber_analyzer._detect_replay_attack(signal, t)
    assert len(threats) > 0, "Should detect replay attack"

def test_countermeasures_generation(cyber_analyzer):
    # Generate some sample threats
    t = np.linspace(0, 10, 10000)
    signal = np.sin(2 * np.pi * 5 * t)
    threats = cyber_analyzer.analyze_threats(signal, t)
    
    countermeasures = cyber_analyzer.generate_countermeasures(threats)
    
    assert countermeasures, "Should generate countermeasures"
    assert isinstance(countermeasures, dict), "Countermeasures should be a dictionary"
    
    for threat_type, measures in countermeasures.items():
        assert isinstance(measures, list), "Measures should be a list"
        assert len(measures) > 0, "Should have at least one countermeasure per threat"
```
