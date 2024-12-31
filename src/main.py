
from flask import Flask, jsonify, request
from signal_processing import process_signal
from feature_extraction import extract_features
from ml_integration import predict_threats

app = Flask(__name__)

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """Analyze signal data and return threat predictions.
    
    Returns:
        JSON response with predictions or error message
    """
    try:
        data = request.get_json()
        processed_data = process_signal(data['signal'])
        features = extract_features(processed_data)
        predictions = predict_threats(features)
        return jsonify({'predictions': predictions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
