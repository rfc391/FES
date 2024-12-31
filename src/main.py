
from flask import Flask, jsonify, request
from signal_processing import process_signal
from feature_extraction import extract_features
from ml_integration import predict_threats

app = Flask(__name__)

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """Analyze incoming signal data and predict potential threats.
    
    Expected JSON input:
    {
        "signal": [...] # Array of signal data points
    }
    
    Returns:
        200: JSON with predictions
        500: JSON with error message
    """
    try:
        data = request.get_json()
        if not data or 'signal' not in data:
            return jsonify({'error': 'Invalid input data'}), 400
            
        processed_data = process_signal(data['signal'])
        features = extract_features(processed_data)
        predictions = predict_threats(features)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)
