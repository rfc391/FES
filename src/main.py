
from flask import Flask, jsonify
from src.signal_processing import process_signal
from src.feature_extraction import extract_features
from src.ml_integration import predict_threats

app = Flask(__name__)

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
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
