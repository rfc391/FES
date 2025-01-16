
# Developer Guide: Fluctuation-Enhanced Sensing (FES)

## Overview
This guide provides developers with insights into the architecture, codebase, and best practices for contributing to the FES platform.

## Architecture
- **Core Services**
  - Kafka: Message broker for real-time data ingestion.
  - InfluxDB: Time-series database for sensor data.
  - IPFS: Decentralized storage for archival.
  - immudb: Immutable database for logs.

- **AI Engine**
  - OpenCV and ONNX for signal analysis.
  - NVIDIA Triton for GPU-accelerated inference.

## Codebase Structure
- `core/`: Contains the main logic for signal processing.
- `frontend/`: Code for the user interface.
- `tests/`: Unit and integration tests.
- `config/`: Service configurations.

## Development Workflow
1. Clone the repository:
   ```bash
   git clone https://github.com/rfc391/FES.git
   cd FES
   ```
2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Run the application locally:
   ```bash
   python main.py
   ```

## Testing
- Run all tests using:
  ```bash
  pytest tests/
  ```
