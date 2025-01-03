
import pytest
from src.utils.signal_processing import process_signal

def test_process_signal_valid_data():
    sample_signal = [1.0, 2.0, 3.0, 4.0, 5.0]
    result = process_signal(sample_signal)
    assert result is not None
    assert isinstance(result, list)

def test_process_signal_empty_data():
    sample_signal = []
    with pytest.raises(ValueError):
        process_signal(sample_signal)
